#!/bin/sh
#filename:install_dependencies.sh

if [ "$NODE_ENV" == "production" ] || [ "$NODE_ENV" == "stage" ]
then
    npm ci --only=production;
else
    npm ci;
fi