String gitCredentials = 'gitId'
String repoUrl = 'https://github.com/Lakkahutta/lighthouse_training.git'

node(){

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

                DOCKER_CMD = "docker run --network host --rm -v ${pwd()}:${pwd()} -w ${pwd()} ibombit/lighthouse-puppeteer-chrome:latest node training_app_performance.js"

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
                
                sh "rsync -r ${pwd()}/* /opt/lighthouse-result/"

        }

        stage('publishReport') {

                archiveArtifacts allowEmptyArchive: true, artifacts: "**/user-flow.report.html", onlyIfSuccessful: false

        }

        stage('verifyBuild') {

            if (!buildSucceeded){

                error("Build failed...")

            } else{

                echo 'Succeeded!'

            }

      }

}
