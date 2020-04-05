#!/bin/sh
#filename:start.sh

docker-compose -f docker-compose.dev.test.yaml up -d;
sleep 2;
npm test;
docker-compose -f docker-compose.dev.test.yaml down;