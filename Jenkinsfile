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
                    echo 'Image successfully build'
                }
                failure {
                    echo 'Failed to build image'
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
                        conditionalCoverageTargets: '80, 50, 0',
                        lineCoverageTargets: '80, 50, 0'
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
                            -Dsonar.projectKey=PES_fibness-backend-$BRANCH_NAME"
                    }
                }
            }
            post {
                failure {
                    echo 'SonarQube analysis failed'
                }
            }
        }
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 15, units: 'MINUTES') {
                        echo 'Waiting for SonarQube quality gate'
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
                }
                failure {
                    echo 'Quality gate not received'
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
                                        echo 'Pushing image to registry'
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
                                        echo 'Pushing image to registry'
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
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
