pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building docker image'
                sh "echo $env.BUILD_ID"
                script {
                    docker.build("fibness/api:1.0.0")
                }
            }
            post {
                unsuccesful {
                    echo 'Unsuccesful build of docker image'
                }
            }
        }
        stage('Test') {
            environment: {
                POSTGRES_PASSWORD = "fibness"
                POSTGRES_USER = "fibness"
                POSTGRES_DB = "test"
            }
            steps {
                sh 'echo "Starting test stage"'
                script {
                    docker.image('postgres:12').withRun('-e POSTGRES_PASSWORD -e POSTGRES_USER -e POSTGRES_DB') { pcg
                        docker.image("fibness/api:1.0.0").inside {
                            npm test
                        }
                    }
                }
            }
            post {
                unsuccesful {
                    echo 'Tests failed'
                }
            }
        }
    }
}