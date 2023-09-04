#! /bin/bash

cd /app

env > .env.dev
npm install
npm i nodemailer dotenv
npm run start:dev
