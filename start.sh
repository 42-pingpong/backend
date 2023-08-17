#! /bin/bash

cd /app

env > .env.dev
npm install
npm run start:dev
