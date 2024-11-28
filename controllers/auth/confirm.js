const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const confirmUser = async (event) => {
  const { email, confirmation_code: confirmationCode } = JSON.parse(event.body);

  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    };

    await cognito.confirmSignUp(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User confirmed successfully' }),
    };
  } catch (error) {
    console.error('Error confirming user', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Error confirming user', error }),
    };
  }
};

module.exports = { confirmUser };