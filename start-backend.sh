#!/bin/sh
cd /Users/apple/Desktop/LifeOS-App/backend
exec /Users/apple/.nvm/versions/node/v24.14.1/bin/node \
  /Users/apple/Desktop/LifeOS-App/backend/node_modules/.bin/ts-node-dev \
  --respawn --transpile-only src/main.ts
