const AWS = require('aws-sdk');
const uuid = require('uuid');

/**
 * Crea una orden de pedido.
 * 
 * @param {Object} event - El objeto de evento que contiene los datos de la solicitud.
 * @returns {Object} - El objeto de respuesta que indica el resultado de la creación de la orden.

CREATE TABLE CompletedOrdersTable (
    orderId UUID PRIMARY KEY,
    name TEXT,
    address TEXT,
    pizzas LIST<TEXT>,
    createdAt TIMESTAMP
);
*/
const createOrder = async (event) => {  

    console.log('Create Order Starting!!!');
 
      try {

            AWS.config.update({region: process.env.REGION});

            const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

            const orderId = uuid.v4()
            
            const body = JSON.parse(event.body);

            console.log("PIZZAS::", body.pizzas);
  
            const order = {
              orderId,
              name: body.name,
              address: body.address,
              pizzas: body.pizzas,
              createdAt: new Date()
            };

            console.log("Order: ", {order});


          let registerOrder = {
              TableName : "CompletedOrdersTable",
              Item : order
          }

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