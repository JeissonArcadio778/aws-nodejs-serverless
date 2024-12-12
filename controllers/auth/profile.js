const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const getUserProfile = async (event) => {
  const { email } = event.queryStringParameters;

  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: email,
  };

  try {
    const result = await cognito.adminGetUser(params).promise();
    const userAttributes = result.UserAttributes.reduce((acc, attr) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User profile fetched successfully', userAttributes }),
    };
  } catch (error) {
    console.error('Error fetching user profile', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching user profile', error }),
    };
  }
};

const updateUserProfile = async (event) => {
  const { email, name, address, phoneNumber } = JSON.parse(event.body);

  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: email,
    UserAttributes: [
      { Name: 'name', Value: name },
      { Name: 'address', Value: address },
      { Name: 'phone_number', Value: phoneNumber },
    ],
  };

  try {
    await cognito.adminUpdateUserAttributes(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User profile updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating user profile', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating user profile', error }),
    };
  }
};

module.exports = { getUserProfile, updateUserProfile };