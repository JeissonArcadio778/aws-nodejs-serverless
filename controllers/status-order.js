let AWS = require("aws-sdk");
const { authorize } = require('../middlewares/authorize');

const statusOrder = async (event) => {
  console.log("Start StatusOrder!!!");

  const orderId = event.pathParameters.id;

  console.log("The order Id: ", { orderId });

  try {
    let params = {
      TableName: "CompletedOrdersTable",
      Key: { orderId },
    };

    const dynamo = new AWS.DynamoDB.DocumentClient();

    const data = await dynamo.get(params).promise();

    return {
      statusCode: 200,
      message: "Status Order",
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    console.log({ error });

    return {
      statusCode: 400,
      message: "Error Status Order",
      body: JSON.stringify(error),
    };
  }
};

module.exports = {
  statusOrder: authorize(['Clients'])(statusOrder)
};
