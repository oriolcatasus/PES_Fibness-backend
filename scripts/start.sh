#!/bin/sh
#filename:start.sh

if [ "$NODE_ENV" == "test" ]
then
    sleep 5;
    node node_modules/mocha/bin/mocha --reporter tap;
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