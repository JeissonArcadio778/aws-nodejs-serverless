const AWS = require('aws-sdk');

const getPurchaseHistory = async (event) => {
  console.log('Get Purchase History Starting!!!');

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { email } = event.queryStringParameters;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Email is required to fetch purchase history',
        }),
      };
    }

    console.log(`Fetching orders for email: ${email}`);

    const params = {
      TableName: 'CompletedOrdersTable',
      IndexName: 'clientEmailIndex',
      KeyConditionExpression: 'clientEmail = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };

    // Consultar DynamoDB
    const result = await dynamodb.query(params).promise();

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No orders found for this email',
        }),
      };
    }

    // Respuesta exitosa con el historial de compras
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Purchase history fetched successfully',
        orders: result.Items,
      }),
    };
  } catch (error) {
    console.error('Error fetching purchase history:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching purchase history',
        error: error.message,
      }),
    };
  }
};

module.exports = {
  getPurchaseHistory,
};
