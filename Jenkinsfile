pipeline {
    agent any
    stages {
        stage('Build') {
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
                        branch 'development'
                    }
                    steps {
                        echo 'Deploying to Stage'
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