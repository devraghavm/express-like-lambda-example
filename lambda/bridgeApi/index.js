// Require the framework and instantiate it
const api = require("lambda-api")()
var requires = require('./libs/requires');

function promiseResponseHandlerStandard(req, requestHandler) {
  return new Promise((resolve, reject) => {
      return requestHandler(req, (err, apiRes) => {
          if (err) {
              return reject(err);
          } else {
              return resolve({
                  "result": apiRes
              });
          }
      });
  });
}

// Define a route
api.put("/customerData", async (req, res) => promiseResponseHandlerStandard(req, requires.customerData.ingestData));
api.get("/customerData/:phonenumber", async (req, res) => promiseResponseHandlerStandard(req, requires.customerData.customerByPhonenumber));
api.put("/createTable", async (req, res) => promiseResponseHandlerStandard(req, requires.createTable.createTable));

api.routes(true);
// Declare your Lambda handler
exports.handler = async (event, context) => {
  return await api.run(event, context)
}
