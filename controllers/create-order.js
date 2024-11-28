const AWS = require('aws-sdk');
const uuid = require('uuid');
const { authorize } = require('../middlewares/authorize');

const createOrder = async (event) => {  
  console.log('Create Order Starting!!!');
 
  try {
    AWS.config.update({region: process.env.REGION});

    const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

    const orderId = uuid.v4();
    const body = JSON.parse(event.body);

    console.log("SALCHIPAPAS::", body.salchipapas);
  
    const order = {
      orderId,
      name: body.name,
      address: body.address,
      salchipapas: body.salchipapas,
      createdAt: new Date()
    };

    console.log("Order: ", {order});

    let registerOrder = {
      TableName : "CompletedOrdersTable",
      Item : order
    };

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    await dynamodb.put(registerOrder).promise();
    
    const params = {
      DelaySeconds: 60,
      MessageAttributes: {
        Author: {
          DataType: "String",
          StringValue: "Jeisson Arcadio",
        },
      },
      MessageBody: JSON.stringify(order),
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/405242296682/PendingOrderQueue"
    };

    const data = await sqs.sendMessage(params).promise();

    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Error in create order. Data sendMessage failed.' }, null, 2),
      };
    }

    console.log("Success, message sent. MessageID:", data.MessageId);
    console.log("Success, message sent. Data:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `The order was registered with the order number ${orderId}`, data }, null, 2),
    };

  } catch (error) {
    console.log("Error", error);

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Error in create order' }, null, 2),
    };
  }
};

module.exports = {
  createOrder: authorize(['Clients'])(createOrder)
};