/**
 * @fileoverview JWT utility functions.
 * Handles token generation, verification, and the convenience
 * method that sets an httpOnly cookie + JSON response.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a signed JWT containing the user's ID.
 *
 * @param {string} id  Mongoose ObjectId of the user
 * @returns {string}   Signed JWT string
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

/**
 * Verify a JWT and return its decoded payload.
 *
 * @param {string} token  JWT string
 * @returns {Object}      Decoded payload ({ id, iat, exp })
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Generate a JWT, set it as an httpOnly cookie, and send a
 * JSON response containing the token and sanitised user object.
 *
 * @param {Object}                    user        Mongoose user document
 * @param {number}                    statusCode  HTTP status code
 * @param {import('express').Response} res        Express response
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + config.jwt.cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,                          // Not accessible via JS
    secure: config.env === 'production',     // HTTPS only in prod
    sameSite: 'strict',                      // CSRF protection
  };

  // Strip password from the user object before sending
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: userObj,
      },
    });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse,
};
