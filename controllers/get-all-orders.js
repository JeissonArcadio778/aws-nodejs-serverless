const AWS = require('aws-sdk');

const getAllOrders = async (event) => {
  console.log('Get All Orders Starting!!!');

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { startDate, endDate, status, clientEmail } = event.queryStringParameters || {};
    console.log('Filters:', { startDate, endDate, status, clientEmail });

    let params = {
      TableName: 'CompletedOrdersTable',
    };
    
    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};
    
    if (startDate || endDate) {
      filterExpressions.push('#createdAt BETWEEN :startDate AND :endDate');
      expressionAttributeValues[':startDate'] = startDate || '1970-01-01T00:00:00Z';
      expressionAttributeValues[':endDate'] = endDate || new Date().toISOString();
      expressionAttributeNames['#createdAt'] = 'createdAt';
    }
    
    if (status) {
      filterExpressions.push('#status = :status');
      expressionAttributeValues[':status'] = status;
      expressionAttributeNames['#status'] = 'status';
    }
    
    if (clientEmail) {
      filterExpressions.push('clientEmail = :clientEmail');
      expressionAttributeValues[':clientEmail'] = clientEmail;
    }
    
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
      params.ExpressionAttributeNames = expressionAttributeNames;
    }
    
    console.log('Scan params:', params);
    
    const result = await dynamodb.scan(params).promise();
    
    const orders = result.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Orders fetched successfully',
        orders,
      }),
    };
  } catch (error) {
    console.error('Error fetching orders:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching orders',
        error: error.message,
      }),
    };
  }
};

module.exports = {
  getAllOrders,
};
