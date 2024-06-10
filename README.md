
# ACTUVIDAD 6 - Desarrollo de Aplicaciones

# AWS Serverless Order Pizzas

Este es una aplicación para ordenar, preparar y enviar una orden de Pizzas para un local de venta de Pizzas.

   ![image](https://user-images.githubusercontent.com/95374726/233537028-52e12fa1-c8c4-48cf-b3ed-ddf22b48e210.png)

## Servicios utilizados

La aplicación se construye utilizando arquitectura serverless con los siguientes servicios de AWS:

- Lambda
- API Gateway
- DynamoDB
- SQS
- DynamoStreams

## Arquitectura

La arquitectura se basa en eventos que son disparados por el API Gateway. Cuando un usuario envía una solicitud POST al API Gateway, se activa una función Lambda para crear una orden. Esta misma función envía información sobre la orden a una cola de SQS, incluyendo detalles como el usuario que creó la orden, quien la recibió, el tipo de salchipapas y la información del cliente como número de teléfono y dirección.

Otra función Lambda espera a que la cola reciba una orden. Cuando la cola recibe la orden, esta función prepara la orden tal y como fue solicitada y escribe un registro en DynamoDB. El registro incluye el número de la orden, la información del cliente y una marca que indica que la orden ha sido completada.

Usando DynamoStreams, otra función Lambda es activada cuando la marca de orden completada está establecida en verdadero. Esta función envía la orden al cliente.

## Endpoints de la API

El API Gateway tiene dos endpoints:

- **POST /order** - Crea una nueva orden y la agrega a la cola
- **GET /order/{id}** - Obtiene el estado de una orden específica identificada por su ID.

Este es el resumen general de la aplicación AWS Serverless Order Salchipapas.
