#!/bin/sh
#filename:start.sh

./scripts/wait-for-it.sh pg:5432 -t 60 -- echo "Database available";
npm run migrate up;

if [ "$NODE_ENV" == "stage" ] || [ "$NODE_ENV" == "production" ]
then
    npm start;
else
    npm run dev-docker;
fi
