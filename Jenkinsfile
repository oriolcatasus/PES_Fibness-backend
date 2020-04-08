pipeline {
    agent any
    stages {
        stage('Build test image') {
            steps {
                echo 'Starting build stage'
                script {
                    sh 'docker-compose -f docker-compose.test.yaml build \
                        --build-arg NODE_ENV=test --force-rm --no-cache --parallel --pull'
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
                echo 'Starting test stage'
                script {
                    sh 'docker-compose -f docker-compose.test.yaml down -v'
                    sh 'docker-compose -f docker-compose.test.yaml up \
                        --force-recreate -V --no-color api-test'
                }
            }
            post {
                always {
                    sh 'docker-compose -f docker-compose.test.yaml down -v'
                }
                success {
                    echo 'Test stage: SUCCESS'
                }
                unsuccessful {
                    echo 'Test stage: FAILURE'
                }
            }
        }
        stage('Deploy') {
            parallel {
                stage('Stage') {
                    when {
                        branch 'docker'
                    }
                    steps {
                        echo 'Building stage docker image'
                        docker.image('fibness/api-stage:latest', '--build-arg NODE_ENV=stage')
                        echo 'Deploying stage docker image'
                        sh 'docker-compose -f docker-compose.stage.yaml config > stage.yaml'
                        sh 'docker stack deploy -c stage.yaml pg-stage'
                        sh 'docker stack deploy -c stage.yaml api-stage'
                    }
                    post {
                        always {
                            sh 'rm -f stage.yaml'
                        }
                        success {
                            echo 'Stage deployed succesfully'
                        }
                        unsuccessful {
                            echo 'Failed to deploy stage'
                        }
                    }
                }
                stage('Production') {
                    when {
                        branch 'master'
                    }
                    steps {
                        echo 'Deploying to production'
                    }
                }
            }
        }
    }
}