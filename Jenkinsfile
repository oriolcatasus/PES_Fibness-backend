pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building docker image'
                script {
                    docker.build("fibness/api:${env.BUILD_ID}")
                }
            }
            post {
                unsuccessful {
                    echo 'Unsuccesful build of docker image'
                }
            }
        }
        stage('Test') {
            environment {
                POSTGRES_PASSWORD = 'fibness'
                POSTGRES_USER = 'fibness'
                POSTGRES_DB = 'test'
                NODE_ENV = 'test'
            }
            steps {
                echo 'Starting test stage'
                script {
                    sh 'docker-compose -f docker-compose.yaml -f docker-compose.test.yaml up --build'
                }
            }
            post {
                always {
                    sh 'docker-compose down'
                }
                unsuccessful {
                    echo 'Tests failed'
                }
            }
        }
    }
}