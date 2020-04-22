#!/bin/sh
#filename:start.sh

if [ "$NODE_ENV" == "test" ]
then
    ./scripts/wait-for-it.sh pg:5432 -- npm run coverage-jenkins;
elif [ "$NODE_ENV" == "stage" ]
then
	./scripts/wait-for-it.sh pg:54321 -- echo "Database available";
    npm run migrate up;
    npm start;
elif [ "$NODE_ENV" == "production" ]
then
    ./scripts/wait-for-it.sh pg:5432 -- echo "Database available";
    npm run migrate up;
    npm start;
else
    ./scripts/wait-for-it.sh pg:5432 -- echo "Database available";
    npm run migrate up;
    npm run dev;
fi
