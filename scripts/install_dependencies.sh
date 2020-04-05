#!/bin/sh
#filename:install_dependencies.sh

if [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "stage" ]
then
    npm install --production=true;
else
    npm install --production=false;
fi