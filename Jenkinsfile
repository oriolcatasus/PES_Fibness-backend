pipeline {
    agent any
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
                    echo 'Build stage: SUCCESS'
                }
                unsuccessful {
                    echo 'Build stage: FAILURE'
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Starting tests'                
                script {
                    sh 'mkdir -p reports'
                    sh 'docker-compose -f docker-compose.test.yaml down -v'
                    sh 'docker-compose -f docker-compose.test.yaml up -V api-test'
                }
            }
            post {
                always {
                    sh 'docker-compose -f docker-compose.test.yaml down -v --rmi local'
                    archiveArtifacts 'reports/junit.xml, \
                        reports/generic-execution-data.xml \
                        reports/cobertura-coverage.xml, \
                        reports/clover.xml \
                        reports/lcov.info'
                    junit(testResults: 'reports/junit.xml',
                        allowEmptyResults:false,
                        healthScaleFactor: 2.0,
                        keepLongStdio: true)
                    cobertura(
                        autoUpdateHealth: true,
                        autoUpdateStability: true,
                        coberturaReportFile: 'reports/cobertura-coverage.xml',
                        failNoReports: true,
                        failUnhealthy: false,
                        failUnstable: false,                        
                        onlyStable: false,
                        enableNewApi: true,
                        maxNumberOfBuilds: 0
                        //conditionalCoverageTargets: '90, 80, 70',
                        //fileCoverageTargets: '90, 80, 70',
                        //lineCoverageTargets: '90, 80, 70',
                        //methodCoverageTargets: '90, 80, 70'
                    )
                    step([
                        $class: 'CloverPublisher',
                        cloverReportDir: 'reports',
                        cloverReportFileName: 'clover.xml'
                        //healthyTarget: [methodCoverage: 90, conditionalCoverage: 90, statementCoverage: 90],
                        //unhealthyTarget: [methodCoverage: 80, conditionalCoverage: 80, statementCoverage: 80],
                        //failingTarget: [methodCoverage: 70, conditionalCoverage: 70, statementCoverage: 70]
                    ])
                }
                success {
                    echo 'Tests executed succesfully'
                }
                unsuccessful {
                    echo 'Tests failed'
                }
            }
        }
        stage('SonarQube analysis') {
            environment {
                scannerHome = tool 'SonarScanner'
            }
            steps {
                nodejs(nodeJSInstallationName: 'node12') {
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=PES_fibness-backend-$BRANCH_NAME \
                            -Dsonar.testExecutionReportPaths=reports/generic-execution-data.xml \
                            -Dsonar.javascript.lcov.reportPaths=reports/lcov.info \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=test/**/*,routes/**/*,app.js,index.js \
                            -Dsonar.tests=test"
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true                
                }
            }
            post {
                success {
                    echo 'Quality gate passed'
                }
                unsuccessful {
                    echo 'Quality gate failed'
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
                                echo 'Registering stage docker image'
                                script {
                                    docker.withRegistry('http://localhost:5000') {
                                        image = docker.image('fibness/api-stage:latest')
                                        echo 'Pushing docker image to docker registry'
                                        image.push('latest')
                                    }   
                                }
                            }
                            post {
                                success {
                                    echo 'Stage docker image built successfully'
                                }
                                unsuccessful {
                                    echo 'Failed to build stage docker image'
                                }
                            }
                        }
                        stage('Deploy to stage') {
                            environment {
                                DB_STAGE = credentials('db-stage')
                            }
                            steps {                        
                                echo 'Deploying docker image to stage'
                                sh 'docker-compose -f docker-compose.stage.yaml config > stage.yaml'
                                sh 'docker stack deploy -c stage.yaml api-stage'
                            }
                            post {
                                success {
                                    echo 'Deployed to stage succesfully'
                                }
                                unsuccessful {
                                    echo 'Failed to deploy to stage'
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
                                echo 'Building production docker image'
                                sh 'cp /home/alumne/config/local-production.json ./config'
                                script {
                                    docker.build('fibness/api-prod:latest', '--build-arg NODE_ENV=production .')
                                }
                                echo 'Registering production docker image'
                                script {
                                    docker.withRegistry('http://localhost:5000') {
                                        image = docker.image('fibness/api-prod:latest')
                                        echo 'Pushing docker image to docker registry'
                                        image.push('latest')
                                    }
                                }
                            }
                            post {
                                success {
                                    echo 'Stage docker image built successfully'
                                }
                                unsuccessful {
                                    echo 'Failed to build stage docker image'
                                }
                            }
                        }
                        stage('Deploy to production') {
                            environment {
                                DB_PROD = credentials('db-prod')
                            }
                            steps {                        
                                echo 'Deploying docker image to production'
                                sh 'docker-compose -f docker-compose.prod.yaml config > prod.yaml'
                                sh 'docker stack deploy -c prod.yaml api-prod'
                            }
                            post {
                                success {
                                    echo 'Deployed to prod succesfully'
                                }
                                unsuccessful {
                                    echo 'Failed to deploy to prod'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}