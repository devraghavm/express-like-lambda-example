/***
 **Module Name: connectDynamoDB
 **File Name :  connectDynamoDB.js
 **Project :     DL S3 to DynamoDB 
 **Copyright(c) : Dish Wireless.
 **Organization : Dish Wireless
 **author :  Srikanth Bukkapatnam
 **license :
 **version :  1.0.0
 **Created on :
 **Created on: March 24 2021
 **Description : This is to establish a dyanamoDB database connection***/
global.AWS = require('aws-sdk');
let docClient;
let dynamodb;
module.exports = {
    GetdbConnection: (dbGlobalCallback) => {
        let awsConfig = {
            region: process.env.region || 'us-east-1'
        };
        AWS.config.update(awsConfig);
        docClient = new AWS.DynamoDB.DocumentClient();
        dynamodb = new AWS.DynamoDB();
        if (typeof dbGlobalCallback === 'function') {
            return dbGlobalCallback(null, docClient);
        }
        return dynamodb;
    }
};