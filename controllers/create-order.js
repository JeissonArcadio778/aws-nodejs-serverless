const AWS = require('aws-sdk');
const uuid = require('uuid');

const createOrder = async (event) => {
  console.log('Create Order Starting!!!');
 
  try {
    AWS.config.update({ region: process.env.REGION });
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const body = JSON.parse(event.body);

    const orderId = uuid.v4();

    console.log("Detalles del pedido:", body);

    const order = {
      orderId,
      clientName: body.client_name, // Nombre del cliente
      clientEmail: body.client_email, // Email del cliente
      address: body.address, // Dirección del cliente
      salchipapas: body.salchipapas.map(item => ({
        type: item.type,
        potatoes: item.potatoes,
        sausages: item.sausages,
        sauces: item.sauces,
        drink: item.drink,
        extras: item.extras || [],
        quantity: item.quantity,
      })), // Detalles de las salchipapas
      totalPrice: body.totalPrice, // Precio total
      createdAt: new Date().toISOString(),
      status: 'PENDING', // Estado inicial del pedido
    };

    console.log("Order:", order);

    // Guardar en DynamoDB
    const registerOrder = {
      TableName: "CompletedOrdersTable",
      Item: order,
    };

    await dynamodb.put(registerOrder).promise();

    // Enviar el pedido a la cola de SQS
    const params = {
      DelaySeconds: 0,
      MessageAttributes: {
        ClientEmail: {
          DataType: "String",
          StringValue: body.client_email,
        },
      },
      MessageBody: JSON.stringify(order),
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/405242296682/PendingOrderQueue",
    };

    const data = await sqs.sendMessage(params).promise();

    if (!data) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Error in create order. Data sendMessage failed.',
        }),
      };
    }

    console.log("Success, message sent. MessageID:", data.MessageId);
    console.log("Success, message sent. Data:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `The order was registered with the order number ${orderId}`,
        order,
      }),
    };

  } catch (error) {
    console.log("Error:", error);

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Error in create order', error }),
    };
  }
};

module.exports = {
  createOrder,
};
