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
                    def pgc = docker.image('postgres:12').withRun('-e POSTGRES_PASSWORD -e POSTGRES_USER -e POSTGRES_DB')
                    docker.image("fibness/api:${env.BUILD_ID}").inside('-e NODE_ENV --link ${pgc.id}:pg')
                }
            }
            post {
                unsuccessful {
                    echo 'Tests failed'
                }
            }
        }
    }
}