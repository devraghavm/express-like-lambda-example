var AWS = require('aws-sdk');
module.exports = {
    createTable: function(appName, callback) {
        // callback(null, "Seccess");
        // Set the region 
        AWS.config.update({
            region: process.env.region
        });
        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({
            apiVersion: '2012-08-10'
        });
        var params = {
            AttributeDefinitions: [{
                AttributeName: 'ID',
                AttributeType: 'S'
            }, {
                AttributeName: 'SUBSCRIBER_NO',
                AttributeType: 'S'
            }],
            KeySchema: [{
                AttributeName: 'ID',
                KeyType: 'HASH'
            }],
            GlobalSecondaryIndexes: [{
                IndexName: 'SUBSCRIBER_NO-index',
                KeySchema: [{
                    AttributeName: 'SUBSCRIBER_NO',
                    KeyType: 'HASH'
                }],
                Projection: {
                    // NonKeyAttributes: [
                    // ],
                    ProjectionType: 'ALL'
                },
                ProvisionedThroughput: {
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            }],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            TableName: process.env.tableName,
            StreamSpecification: {
                StreamEnabled: false
            }
        };
        // Call DynamoDB to create the table
        ddb.createTable(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                return callback(err.module);
            } else {
                console.log("Table Created", data);
                return callback(null, data);
            }
        });
    }
}