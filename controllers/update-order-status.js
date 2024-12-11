const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const updateOrderStatus = async (event) => {
  try {
    const { orderId } = JSON.parse(event.body);
    console.log(`Updating status for order: ${orderId}`);

    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'OrderId is required' }),
      };
    }

    const params = {
      TableName: 'CompletedOrdersTable',
      Key: { orderId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'DELIVERED',
      },
      ReturnValues: 'ALL_NEW',
    };

    const result = await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order status updated successfully', order: result.Attributes }),
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update order status', error: error.message }),
    };
  }
};

module.exports = { updateOrderStatus };
