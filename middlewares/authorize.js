const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_c3IHhSQ6w/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

const authorize = (allowedRoles) => (handler) => async (event) => {
  try {
    console.log('Authorizing...');
    console.log('Event:', event);

    // Extraer el token de autorización del encabezado
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token);

    // Verificar el formato del token JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Verificar y decodificar el token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {}, (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            console.error('Token expired at', err.expiredAt);
            reject({ statusCode: 401, message: 'Token expired' });
          } else if (err.name === 'JsonWebTokenError') {
            console.error('Token verification error', err.message);
            reject({ statusCode: 401, message: 'Invalid token' });
          } else {
            console.error('Token verification error', err);
            reject({ statusCode: 401, message: 'Unauthorized' });
          }
        } else {
          resolve(decoded);
        }
      });
    });

    console.log('Decoded:', decoded);

    // Verificar si el usuario pertenece a uno de los roles permitidos
    if (!allowedRoles.includes(decoded['cognito:groups'][0])) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Access denied' }),
      };
    }

    console.log('Authorized');
    return handler(event);
  } catch (error) {
    console.error('Authorization error', error);
    return {
      statusCode: error.statusCode || 401,
      body: JSON.stringify({ message: error.message || 'Unauthorized' }),
    };
  }
};

module.exports = { authorize };