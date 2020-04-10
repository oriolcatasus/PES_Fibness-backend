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
                    sh 'docker-compose -f docker-compose.test.yaml down -v'
                    sh 'docker-compose -f docker-compose.test.yaml up -V api-test'
                }
            }
            post {
                always {
                    sh 'docker-compose -f docker-compose.test.yaml down -v --rmi local'
                }
                success {
                    echo 'Tests executed succesfully'
                }
                unsuccessful {
                    echo 'Tests failed'
                }
            }
        }
        stage('Deploy') {
            parallel {
                stage('Stage') {
                    when {
                        branch 'development'
                    }
                    stages {
                        stage('Build stage image') {
                            steps {
                                echo 'Building stage docker image'
                                sh 'rm -f config/local-*'
                                sh 'cp /home/alumne/config/local-stage.json ./config'
                                script {
                                    docker.build('fibness/api-stage:latest', '--build-arg NODE_ENV=stage .')
                                }
                                echo 'Registering stage docker image'
                                script {
                                    docker.withRegistry('http://localhost:5000') {
                                        image = docker.image('fibness/api-stage:latest')
                                        image.push('latest')
                                    }   
                                }
                            }
                            post {
                                always {
                                    sh 'rm -f config/local-*'
                                }
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
                                always {
                                    sh 'rm -f stage.yaml'
                                }
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
                                sh 'rm -f config/local-*'
                                sh 'cp /home/alumne/config/local-production.json ./config'
                                script {
                                    docker.build('fibness/api-prod:latest', '--build-arg NODE_ENV=production .')
                                }
                                echo 'Registering production docker image'
                                script {
                                    docker.withRegistry('http://localhost:5000') {
                                        image = docker.image('fibness/api-prod:latest')
                                        image.push('latest')
                                    }
                                }
                            }
                            post {
                                always {
                                    sh 'rm -f config/local-*'
                                }
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
                                always {
                                    sh 'rm -f prod.yaml'
                                }
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