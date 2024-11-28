const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const loginUser = async (event) => {
  const { email, password } = JSON.parse(event.body);
  console.log('Logging in user:', email);
  console.log('Cognito client ID:', process.env.COGNITO_CLIENT_ID);
  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const result = await cognito.initiateAuth(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Login successful', token: result.AuthenticationResult }),
    };
  } catch (error) {
    console.error('Error logging in user', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid credentials', error }),
    };
  }
};

module.exports = { loginUser };