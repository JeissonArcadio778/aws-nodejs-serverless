const AWS = require('aws-sdk');
const uuid = require('uuid');

const createOrder = async (event) => {

    console.log('Create Order Starting!');

      try {

            AWS.config.update({region: process.env.REGION});
            const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

            const createdAt = new Date();
            const orderId = uuid.v4();

            const { name, address, pizzas } = event.body;

            console.log({name, address, pizzas, event})


            const newOrder = { name, address, pizzas, createdAt, orderId}

            const params = {
              DelaySeconds: 10,
              MessageAttributes: {
                Author: {
                  DataType: "String",
                  StringValue: "Jeisson Arcadio",
                },
              },
              MessageBody: JSON.stringify({name, address, pizzas, createdAt, orderId}),
              QueueUrl: "https://sqs.us-east-1.amazonaws.com/788950990295/PendingOrderQueue"
            };
            

            const data = await sqs.sendMessage(params).promise();

            if (!data) {
              return {
                statusCode: 400,
                body: JSON.stringify(
                  {
                    message: 'Error in create order. Data sendMessage failed.'
                  }, null, 2 ),
              }
            }

            console.log("Success, message sent. MessageID:", data.MessageId);

            console.log("Success, message sent. Data:", data);
            
          
            return {
              statusCode: 200,
              body: JSON.stringify({ message: `The order was register with the order number ${orderId}`, data}, null, 2 ),
            };

      } catch (error) {
        
            console.log("Error", error);

            return {
              statusCode: 400,
              body: JSON.stringify(
                {
                  message: 'Error in create order'
                }, null, 2 ),
            }

    }
};


module.exports = {
  createOrder
}