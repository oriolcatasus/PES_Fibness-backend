pipeline {
    agent any
    environment {
        UNSUCCESSFUL_STAGE = 'null'
    }
    stages {
        stage('Build test image') {
            steps {
                echo 'Starting building test docker image'
                script {
                    sh 'docker-compose -f docker-compose.test.yaml build --build-arg NODE_ENV=test --pull'
                }
            }
            post {
                success {
                    echo 'Image successfully build'
                }
                failure {
                    echo 'Failed to build image'
                    script {
                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                    }
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Starting tests'                
                script {
                    sh 'mkdir -p reports'
                    sh 'docker-compose -f docker-compose.test.yaml down -v'
                    sh 'docker-compose -f docker-compose.test.yaml up -V api'
                }
            }
            post {
                always {
                    sh 'docker-compose -f docker-compose.test.yaml down -v --rmi local'
                    junit(testResults: 'reports/junit.xml',
                        allowEmptyResults:false,
                        healthScaleFactor: 10.0,
                        keepLongStdio: true)
                    cobertura(
                        autoUpdateHealth: false,
                        autoUpdateStability: false,
                        coberturaReportFile: 'reports/cobertura-coverage.xml',
                        failNoReports: true,
                        failUnhealthy: false,
                        failUnstable: false,                        
                        onlyStable: false,
                        enableNewApi: true,
                        zoomCoverageChart: true,
                        maxNumberOfBuilds: 0,
                        conditionalCoverageTargets: '99, 0, 0',
                        lineCoverageTargets: '99, 0, 0'
                    )
                }
                success {
                    echo 'Tests succesfully executed'
                }
                unstable {
                    echo 'One or more tests failed'
                    echo 'Build marked as unstable'
                }
                failure {
                    echo 'Test execution failed'
                }
                unsuccessful {
                    script {
                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                    }
                }
            }
        }
        stage('SonarQube analysis') {
            environment {
                scannerHome = tool 'SonarScanner'
            }
            steps {
                echo 'Starting SonarQube analysis'
                nodejs(nodeJSInstallationName: 'node12') {
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=PES_fibness-backend-$BRANCH_NAME"
                    }
                }
            }
            post {
                failure {
                    echo 'SonarQube analysis failed'
                    script {
                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 15, units: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }
            }
            post {
                success {
                    echo 'SonarQube quality gate passed'
                }
                unstable {
                    echo 'SonarQube quality gate failed'
                    echo 'Build marked as unstable'
                    script {
                        if (UNSUCCESSFUL_STAGE == "null") {
                            UNSUCCESSFUL_STAGE = env.STAGE_NAME
                        }                        
                    }
                }
                failure {
                    echo 'Quality gate not received'
                    script {
                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                    }
                }
            }
        }
        stage('Deploy') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS' 
                }
            }
            parallel {
                stage('Stage') {
                    when {
                        branch 'development'
                    }
                    stages {
                        stage('Build stage image') {
                            steps {
                                echo 'Building stage docker image'
                                sh 'cp /home/alumne/config/local-stage.json ./config'
                                script {
                                    docker.build('fibness/api-stage:latest', '--force-rm \
                                        --build-arg NODE_ENV=stage .')
                                }
                                echo 'Registering stage image'
                                script {
                                    docker.withRegistry('http://localhost:5000') {
                                        image = docker.image('fibness/api-stage:latest')
                                        image.push('latest')
                                    }
                                    
                                }
                            }
                            post {
                                success {
                                    echo 'Stage image successfully built'
                                }
                                failure {
                                    echo 'Failed to build stage image'
                                    script {
                                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                                    }
                                }
                            }
                        }
                        stage('Deploy to stage') {
                            environment {
                                DB_STAGE = credentials('db-stage')
                            }
                            steps {                        
                                echo 'Deploying image to stage'
                                sh 'docker-compose -f docker-compose.stage.yaml config > stage.yaml'
                                sh 'docker stack deploy -c stage.yaml fibness-stage'
                            }
                            post {
                                success {
                                    echo 'Stage image succesfully deployed'
                                }
                                failure {
                                    echo 'Failed to deploy to stage'
                                    script {
                                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                                    }
                                }
                            }
                        }
                    }
                }
                stage('Prod') {
                    when {
                        branch 'master'
                    }
                    stages {
                        stage('Build production image') {
                            steps {
                                echo 'Building production image'
                                sh 'cp /home/alumne/config/local-production.json ./config'
                                script {
                                    docker.build('fibness/api-prod:latest', '--force-rm \
                                        --build-arg NODE_ENV=production .')
                                }
                                echo 'Registering production image'
                                script {
                                    docker.withRegistry('http://localhost:5000') {
                                        image = docker.image('fibness/api-prod:latest')
                                        image.push('latest')
                                    }
                                }
                            }
                            post {
                                success {
                                    echo 'Production image successfully built'
                                }
                                failure {
                                    echo 'Failed to build production image'
                                    script {
                                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                                    }
                                }
                            }
                        }
                        stage('Deploy to production') {
                            environment {
                                DB_PROD = credentials('db-prod')
                            }
                            steps {                        
                                echo 'Deploying image to production'
                                sh 'docker-compose -f docker-compose.prod.yaml config > prod.yaml'
                                sh 'docker stack deploy -c prod.yaml fibness-prod'
                            }
                            post {
                                success {
                                    echo 'Production image successfully deployed'
                                }
                                failure {
                                    echo 'Failed to deploy to production'
                                    script {
                                        UNSUCCESSFUL_STAGE = env.STAGE_NAME
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                def msg = sh(
                    script: 'git --no-pager show -s --format="[%an] **%s**"',
                    returnStdout: true
                ) + "\n"
                def img;
                if (currentBuild.result == "SUCCESS") {
                    msg = msg + "Congratulations, your commit works!"
                    if (env.BRANCH_NAME == "master" || env.BRANCH_NAME == "development") {
                        msg = msg + "\nAnd it's already deployed! "
                    }
                    img = "https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fentries%2Ficons%2Ffacebook%2F000%2F027%2F838%2FUntitled-1.jpg"
                } else if (currentBuild.result == "UNSTABLE") {
                    if (UNSUCCESSFUL_STAGE == "Test") {
                        msg = msg + "Lol, it didn't even pass the tests..."
                    } else if (UNSUCCESSFUL_STAGE == "Quality Gate") {
                        msg = msg + "I'm sorry, sonarqube didn't like your commit..."
                    }
                    img = "https://i.pinimg.com/originals/89/33/dd/8933ddd084a8bbf8d0c994894d49179c.jpg";
                } else if (currentBuild.result == "FAILURE") {
                    msg = msg + "It seems something went wrong at stage ${UNSUCCESSFUL_STAGE}"
                    img = "https://storage.googleapis.com/www-paredro-com/uploads/2019/06/a61005be-20130109.png"
                }
                discordSend(
                    webhookURL: "https://discordapp.com/api/webhooks/702577264373792808/mXotnBpGeUGiX5-QPWVTI2Kd6hWl8zRrZ2IP2tO01BBBkpkkeFhPkhAU3RoPkLnZYQsi",
                    title: "${currentBuild.currentResult} in ${env.JOB_NAME}",
                    link: env.BUILD_URL,
                    result: currentBuild.result,
                    image: img,
                    description: msg
                )
            }
        }
    }
}
