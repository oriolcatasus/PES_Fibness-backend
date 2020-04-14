#!/bin/sh
#filename:start.sh

if [ "$NODE_ENV" == "test" ]
then
    sleep 5;
    npm run coverage-jenkins
elif [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "stage" ]
then
    sleep 5;
    npm run migrate up;
    npm start;
else
    sleep 2;
    npm run migrate up;
    npm run dev;
fi