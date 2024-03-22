'use strict'

let AWS = require('aws-sdk');

/**
 * Prepara un pedido para su entrega.
 * 
 * @param {Object} event - El evento que desencadenó la función.
 * @returns {Object} - El resultado de la preparación del pedido.
 * @throws {Object} - El error que ocurrió durante la preparación del pedido.
 */
const prepareOrder = async (event) => {
   
    console.log('Prepare Order Starting!!!');
 
            try {
                
                // [ { messageId: '07fc9614-b018-4e20-8fe7-ac063b2f9b33', receiptHandle: 'AQEBSAd6+mTDgOvK3gGt7rCYOavi+pCYJEfqoDnDfrnL6wDwJD6PeI+QYMYhShJvTkNl2KKRJxKoWCAoNuvz9DwgA3hMvpb2ubifAVO4pM5zibZjpKN/iB3zdLVu9DQANYFFMtOZCkQsJRS9OMXOL2mx4H1CACQ1CjAVt3EBqEeDdQnsaXWwdFfYuZMYZd8KXUsZZrFP/nX6E7GpwNc/NBIwWLlo8lQPIHSDuTk4ZA/B+m/gYqs3Wj4FsQPyxdAJYsVMm7WjKu0MQIsowYpV5oQn05JXAMiP6IGQHVVL8kOwA1PfInz2URtEn/v1u8ezqQewIFeIOwcXTrpnWxMaH6ZfkaH8OfMycXGyOqwhMZ05g+9inqSbjNUGIQ+jBlgG0NweFjS+9sq6NQdgoXCt12QuKg==', body: '{"orderId":"369545d5-32fd-475d-a119-01a9c8bad2a3","name":"Jeisson","address":"Macondo","createdAt":"2023-03-16T23:38:46.686Z"}', attributes: { ApproximateReceiveCount: '1', AWSTraceHeader: 'Root=1-6413a885-4f00bded2982f6dc3c8d5146;Parent=6d04ea95439579b8;Sampled=0', SentTimestamp: '1679009926761', SenderId: 'AROA3PMJEXXL7CAOJP75M:nodejs-aws-order-salchipapas-dev-createOrder', ApproximateFirstReceiveTimestamp: '1679009936761' }, messageAttributes: { Author: [Object] }, md5OfMessageAttributes: 'e34b082ee3f7c1e6e60d1ba3caf83adf', md5OfBody: 'feaf6432b553023476340fb2719f8b1b', eventSource: 'aws:sqs', eventSourceARN: 'arn:aws:sqs:us-east-1:788950990295:PendingOrderQueue', awsRegion: 'us-east-1' } ]

                console.log(event.Records[0].body);

                const order = JSON.parse(event.Records[0].body); 

                order.delivery_status = "READY_FOR_DELIVERY";


                let params = {
                    TableName : "CompletedOrdersTable",
                    Item : order,
                }

                const dynamodb = new AWS.DynamoDB.DocumentClient();
                
                await dynamodb.put(params).promise();

                return {
                    statusCode: 200,
                    message: "order ready for delivery",
                    body: JSON.stringify(order),
                };
                        

            } catch (error) {
                
                console.log(error);

                return {
                    statusCode: 400,
                    message: "order is not ready for delivery",
                    body: JSON.stringify(error),
                };

            }

}


module.exports = {
    prepareOrder
}