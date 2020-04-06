pipeline {
    agent any
    stages {
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
                    sh 'docker-compose -f docker-compose.yaml -f docker-compose.test.yaml up --build api'
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