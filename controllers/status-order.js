

let AWS = require('aws-sdk');


/**
 * Obtiene el estado de una orden.
 * @param {Object} event - El objeto de evento que contiene los datos de la solicitud.
 * @returns {Object} - El objeto de respuesta que contiene el estado de la orden.
 */
const statusOrder = async (event) => {

    console.log('Start StatusOrder!!!');

            const orderId = event.pathParameters.id

            console.log("The order Id: ", {orderId});

            try {   

                    let params = {
                        TableName: "CompletedOrdersTable",
                        Key: {orderId}
                    };
                    
                    const dynamo = new AWS.DynamoDB.DocumentClient();
                    
                    const data = await dynamo.get(params).promise();
                    
                    return {
                        statusCode: 200,
                        message: "Status Order",
                        body: JSON.stringify(data.Item),
                    };

            } catch (error) {
 
                    console.log({error});

                    return {
                        statusCode: 400,
                        message: "Error Status Order",
                        body: JSON.stringify(error),
                    };
            }
             
           

}   

module.exports = {
    statusOrder
}