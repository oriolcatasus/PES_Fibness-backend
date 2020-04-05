#!/bin/sh
#filename:start.sh

if [ "$NODE_ENV" == "development" ]
then
    sleep 2
    npm run dev
elif [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "stage" ]
then
    sleep 5;
    npm start;
elif [ "$NODE_ENV" == "test" ]
then
    sleep 5;
    npm test;
fi