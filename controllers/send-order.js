let AWS = require('aws-sdk');

/**
 * Función asincrónica que se encarga de enviar un pedido.
 * 
 * @param {Object} event - El evento que desencadenó la función.
 * @returns {Object} - Un objeto con el código de estado, mensaje y cuerpo de la respuesta.
 */
const sendOrder = async (event) => {

    console.log('Send Order was calling...');

    console.log(event.Records[0].dynamodb);

    try {   
         
            const record = event.Records[0];

            console.log({record});

            if (record.eventName === 'INSERT') {
                    
                    console.log('deliverOrder');

                    const orderId = record.dynamodb.Keys.orderId.S;

                    console.log({orderId});

                    let params = {
                        TableName : "CompletedOrdersTable",
                        Key : {
                            orderId
                        },
                        ConditionExpression: 'attribute_exists(orderId)',
                        UpdateExpression: 'set delivery_status = :v',
                        ExpressionAttributeValues: {
                            ":v" : "PREPARING"
                        },
                        ReturnValues: 'ALL_NEW'
                    };

                    const dynamodb = new AWS.DynamoDB.DocumentClient();
                    
                    await dynamodb.update(params).promise();

                    return {
                        statusCode: 200,
                        message: "order delivered",
                        body: JSON.stringify(orderId),
                    };

            } else {
                    console.log('Is not a new record'); 
            }

    } catch (error) {
        console.log({error});
            return {
                statusCode: 400,
                message: "Error In Send Order",
                body: JSON.stringify(error),
            };
    }
  

}   


module.exports = {
    sendOrder
}