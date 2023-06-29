String gitCredentials = 'gitId'
String repoUrl = 'https://github.com/Lakkahutta/lighthouse_training.git'

node('perf-testing-node'){

        properties(

            [

                disableConcurrentBuilds(),

                buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '25', numToKeepStr: '25')),         

            ])

        stage('pulLatestCode'){

                git branch: 'main',

                 credentialsId: gitCredentials,

                 url: repoUrl

        }

        stage('preparation') {

                buildSucceeded = true  

                SCIPT = 'Training app'  

                script{

                        DATE= String.format('%tF-%<tH-%<tM-%<tS'

                        , java.time.LocalDateTime.now())

                }

                RESULTS_DIR="testResults/${SCIPT}/${DATE}"

 
                DOCKER_CMD = "docker run --rm -v $WORKSPACE/testResults:/${RESULTS_DIR}\
                      -w "$WORKSPACE" ibombit/lighthouse-puppeteer-chrome:latest node <training_app_performance.js>"


        }

        stage('runShell') {

                print "---------- Running tests ----------"

                 try {

                    sh DOCKER_CMD

                } catch (err) {

                    echo "Failed: ${err}"

                    buildSucceeded = false

                }

        }

        stage('copyResults') {

                sh "rsync -r ${PWD}/testResults/* /opt/lighthouse-result/"

        }

        stage('publishReport') {

                archiveArtifacts allowEmptyArchive: true, artifacts: "${RESULTS_DIR}/**/*", onlyIfSuccessful: false

                publishHTML([

                allowMissing: true,

                alwaysLinkToLastBuild: true,

                keepAll: true,

                reportDir: "${RESULTS_DIR}",

                reportFiles: "index.html",

                        reportName: "HTML Report",

                        reportTitles: ""])

        }

        stage('verifyBuild') {

            if (!buildSucceeded){

                error("Build failed...")

            } else{

                echo 'Succeeded!'

            }

      }

}
