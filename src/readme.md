# Device Rent System

## Overview

The **Device Rent System** is a Node.js-based backend system that allows users to rent devices. It uses TypeORM with PostgreSQL for data management and RabbitMQ for messaging services.

## Features

- User management (Create User, you can list users as well)
- Device management (Create device entries, List devices)
- Rent and return devices.
- Notification for overdue devices.
- Uses RabbitMQ for background processing.

## Prerequisites

- Node.js v14+ 
- PostgreSQL
- RabbitMQ
- TypeORM



### Steps:
Add enviroment variable
Add npm dependency on the prject ny install all module- npm install
create a db in your postgres instance name-   device-rent-system
run the migrations by using command-   npm run migration:run
after that check the migration is successfully run or not
Run the project - npm run dev
 
### NOTE
For notification I have send message to rabbitMq and then I am consuming that message but instead of sending email I am simply console that data to make thing easy.
And for the 5 days reminder the API is available I have'nt added any cron/ worker to automate that.  