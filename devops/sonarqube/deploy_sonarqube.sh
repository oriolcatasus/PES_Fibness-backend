#!/bin/sh
#filename:deploy_sonarqube.sh

echo 'Deploying stack to swarm'
docker-compose config > sonarqube.yaml
docker stack deploy -c sonarqube.yaml sonarqube

echo 'Cleaning up'
rm -f sonarqube.yaml