let AWS = require('aws-sdk');
let connectDynamoDB = require('./connectDynamoDB');
let forEach = require('async-foreach').forEach;
let randomstring = require('randomstring')
module.exports = {
    ingestData: async function(event, callback) {
        let params = event.queryString || event.query;
        let buketName = params.buketName;
        let filePath = params.filePath;
        let filePathArr = filePath.split(".");
        let ext = filePathArr[filePathArr.length - 1];
        if (!buketName || !filePath) {
            return callback("Invalid params", null);
        }
        if (ext != 'dat') {
            return callback("File not allowed", null);
        }
        // Set the region 
        AWS.config.update({
            region: process.env.region
        });

        var roleToAssume = {RoleArn: 'arn:aws:iam::715052932111:role/retail-wirless-boost-S3-role',
                            RoleSessionName: 'awssdk',
                            DurationSeconds: 900,};

        // Create the STS service object    
        var sts = new AWS.STS({apiVersion: '2011-06-15'});

        //Assume Role
        sts.assumeRole(roleToAssume, function(err, data) {
            if (err) console.log(err, err.stack);
            else{
                console.log(data);
                roleCreds = {accessKeyId: data.Credentials.AccessKeyId,
                    secretAccessKey: data.Credentials.SecretAccessKey,
                    sessionToken: data.Credentials.SessionToken};
                let s3 = new AWS.S3(roleCreds);
                let s3params = {
                    Bucket: buketName,
                    Key: filePath
                };
                s3.getObject(s3params, function(err, data) {
                    if (err) {
                        console.log(err.message);
                        callback(err.message, null)
                    } // an error occurred
                    else {
                        let customerData = Buffer.from(data.Body).toString('utf8');
                        let customerDataArr = customerData.split("\n");
                        let lastIndex = customerDataArr.length - 1;
                        connectDynamoDB.GetdbConnection(function(connectError, dbConnection) {
                            if (connectError) {
                                callback(connectError, null);
                            } else {
                                forEach(customerDataArr, function(item, index, arr) {
                                    let done = this.async();
                                    let CurrentTime = new Date();
                                    console.log("index:", index);
                                    if (index > 0) {
                                        let itemArr = item.split("|");
                                        let Doc = {
                                            "ID": randomstring.generate(12),
                                            "BAL_DATE": itemArr[0],
                                            "BAN": itemArr[1],
                                            "PTN": itemArr[2],
                                            "BALANCE": itemArr[3],
                                            "FILE_NAME": itemArr[4],
                                            "SUBSCRIBER_NO": itemArr[5],
                                            "EXPIRE_DATE": itemArr[6],
                                            "CANCEL_DATE": itemArr[7],
                                            "LOAD_DATE": itemArr[8],
                                            "PTN_STATUS": itemArr[9],
                                            "NETWORK_IND": itemArr[10],
                                            "NEXT_MRC_DUE_DATE": itemArr[11],
                                            "SUBSCRIBER_STATUS": itemArr[12],
                                            "REASON_CODE": itemArr[13],
                                            "LAST_MRC_ATTEMPT_DATE": itemArr[14],
                                            "LAST_MRC_ATTEMPT_RESULT": itemArr[15],
                                            "STATUS_DATE": itemArr[16],
                                            "PRICE_PLAN": itemArr[17],
                                            "PRICE_PLAN_FAMILY": itemArr[18],
                                            "SUB_MARKET": itemArr[19],
                                            "IMSI": itemArr[20],
                                            "INIT_ACTIVATION_DATE": itemArr[21],
                                            "BAR_FLAG": itemArr[22],
                                            "RBT_FLAG": itemArr[23],
                                            "CHAT_FLAG": itemArr[24],
                                            "DEMO_FLAG": itemArr[25],
                                            "INTWTTXT_FLAG": itemArr[26],
                                            "PTN_STATUS_DATE": itemArr[27],
                                            "BRAND_CODE": itemArr[28],
                                            "PPF_PRIMARY_SBSCR_NBR": itemArr[29],
                                            "BARRING_SOC_EFF_DATE": itemArr[30],
                                            "BARRING_SOC_NUM_DAYS": itemArr[31],
                                            "ACTIVE_PRECHURN_FLAG": itemArr[32],
                                            "PRECHURN_SOC_EFF_DATE": itemArr[33],
                                            "PRECHURN_SOC_NUM_DAYS": itemArr[34],
                                            "RISE_CHURN": itemArr[35],
                                            "IB_INDICATOR": itemArr[36],
                                            "CREATED_ON": CurrentTime.toISOString()
                                        };
                                        let paramsOfJob = {
                                            TableName: process.env.tableName || 'bridge-customer',
                                            Item: Doc
                                        };
                                        console.log(index, " ==> paramsOfJob : ", paramsOfJob);
                                        dbConnection.put(paramsOfJob, function(error_insert, result_insert) {
                                            if (error_insert) {
                                                console.log('error in insert ' + JSON.stringify(error_insert))
                                            }
                                            done();
                                            if (index === lastIndex) {
                                                console.log("Completed");
                                                return callback(null, customerDataArr.length - 1 + " records inserted")
                                            }
                                        });
                                    } else {
                                        done();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    customerByPhonenumber: function(event, callback) {
        let eventParams = event.params || {};
        let pathParams = event.pathParams || {};
        let phonenumber = pathParams.phonenumber || eventParams.phonenumber;
        if (!phonenumber) {
            return callback("Invalid params");
        }
        connectDynamoDB.GetdbConnection(function(connectError, dbConnection) {
            var KeyConditionExpression = "#SUBSCRIBER_NO = :SUBSCRIBER_NO";
            var ExpressionAttributeNames = {
                "#SUBSCRIBER_NO": "SUBSCRIBER_NO"
            };
            var ExpressionAttributeValues = {
                ":SUBSCRIBER_NO": phonenumber
            };
            var IndexName = "SUBSCRIBER_NO-index";
            var selector = {
                TableName: process.env.tableName ,
                KeyConditionExpression: KeyConditionExpression,
                IndexName: IndexName,
                ExpressionAttributeNames: ExpressionAttributeNames,
                ExpressionAttributeValues: ExpressionAttributeValues
            };
            dbConnection.query(selector, function(err, result) {
                if (err) {
                    console.log(err)
                    return callback(err, null);
                } else {
                    if (result.Count > 0) {
                        return callback(null, result.Items);
                    } else {
                        return callback("Subscriber not found", null);
                    }
                }
            });
        });
        //callback(null, "Success PH: " + phonenumber)
    }
}