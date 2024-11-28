const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const registerUser = async (event) => {
  const { email, password, role } = JSON.parse(event.body);

  console.log('Registering user', email, role);
  console.log('Cognito client id', process.env.COGNITO_CLIENT_ID);

  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID, // Usar variable de entorno
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
      ],
    };

    const result = await cognito.signUp(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User registered successfully. Please check your email to confirm your account.', result }),
    };
  } catch (error) {
    console.error('Error registering user', error);

    if (error.code === 'UsernameExistsException') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'User already exists', error }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error registering user', error }),
    };
  }
};

module.exports = { registerUser };