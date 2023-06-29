const fs = require('fs')
const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js')

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    //console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Fully Rendered Page: " + page.url());
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};

async function captureReport() {
	const browser = await puppeteer.launch({args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	//const browser = await puppeteer.launch({"headless": false, args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	const page = await browser.newPage();
	const baseURL = "http://localhost/";
	
	await page.setViewport({"width":1920,"height":1080});
	await page.setDefaultTimeout(10000);
	
	const navigationPromise = page.waitForNavigation({timeout: 30000, waitUntil: ['domcontentloaded']});
	await page.goto(baseURL);
    await navigationPromise;
		
	const flow = await lighthouse.startFlow(page, {
		name: 'training_app',
		configContext: {
		  settingsOverrides: {
			throttling: {
			  rttMs: 40,
			  throughputKbps: 10240,
			  cpuSlowdownMultiplier: 1,
			  requestLatencyMs: 0,
			  downloadThroughputKbps: 0,
			  uploadThroughputKbps: 0
			},
			throttlingMethod: "simulate",
			screenEmulation: {
			  mobile: false,
			  width: 1920,
			  height: 1080,
			  deviceScaleFactor: 1,
			  disabled: false,
			},
			formFactor: "desktop",
			onlyCategories: ['performance'],
		  },
		},
	});

    await flow.navigate(baseURL, {
		stepName: 'open main page'
		});
  	console.log('main page is opened');
	
	const name    = "test_name";
	const address = "test_address";
	const postal  = "12345";
	const city    = "test_city";
	const country = "AF";
	const phone   = "11111111";
	const email   = "email@dot.com"
	
	const tablesTab               = "a[href='http://localhost/tables']";
	const tableIcon               = "div[class*='priced'] h3[class*='product-name']";
	const addToCartButton         = "button[type='submit']";
	const addedToCartLabel        = "span[class*='success']";
	const cartTab                 = "a[href='http://localhost/cart']";
	const placeOrderButton        = "input[class*='to_cart_submit']";
	const nameField               = "input[name='cart_name']";
	const addressField            = "input[name='cart_address']";
	const postalField             = "input[name='cart_postal']";
	const cityField               = "input[name='cart_city']";
	const countryField            = "select[name='cart_country']";
	const phoneField              = "input[name='cart_phone']";
	const emailField              = "input[name='cart_email']";
	const submitOrderButton       = "input[name='cart_submit']";
	const thanksText              = ".breadcrumb-wrapper a[href='http://localhost/thank-you']";
	
	await page.waitForSelector(tablesTab);
	await flow.startTimespan({ stepName: 'tables page' });
		await page.click(tablesTab);
		await page.waitForSelector(tableIcon);
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('table page loading is completed');
	
	await flow.startTimespan({ stepName: 'table details' });
		await page.click(tableIcon);
		await page.waitForSelector(addToCartButton);
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('table details loading is completed');
	
	await page.waitForSelector(addToCartButton);
	await page.click(addToCartButton);
	await page.waitForSelector(addedToCartLabel);
	
	await page.waitForSelector(cartTab);
	await flow.startTimespan({ stepName: 'cart page' });
		await page.click(cartTab);
		await page.waitForSelector(placeOrderButton);
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('cart page loading is completed');
	
	await flow.startTimespan({ stepName: 'checkout' });
		await page.click(placeOrderButton);
		await page.waitForSelector(nameField);
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('checkout page loading is completed');
	
	await page.type(nameField, name);
	await page.waitForSelector(addressField);
	await page.type(addressField, address);
	await page.waitForSelector(postalField);
	await page.type(postalField, postal);
	await page.waitForSelector(cityField);
	await page.type(cityField, city);
	await page.waitForSelector(countryField);
	await page.type(countryField, country);
	await page.waitForSelector(phoneField);
	await page.type(phoneField, phone);
	await page.waitForSelector(emailField);
	await page.type(emailField, email);

	await page.waitForSelector(submitOrderButton);
	await flow.startTimespan({ stepName: 'place order' });
		await page.click(submitOrderButton);
		await page.waitForSelector(thanksText);
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('place order is completed');

	//================================REPORTING================================
	//const reportPathJson = __dirname + '/user-flow.report.json';
	//const reportJson = JSON.stringify(flow.getFlowResult()).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	//fs.writeFileSync(reportPathJson, reportJson);
	
	const reportPath = __dirname + '/user-flow.report.html';
	fs.writeFileSync(reportPath, await flow.generateReport());
	
    await browser.close();
}
captureReport();