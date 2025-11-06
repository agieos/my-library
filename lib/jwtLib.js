const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token.
 * @param {object} payload - Data to be encrypted in the token.
 * @param {string} secret - Secret key for signing.
 * @param {string} expiresIn - Token expiry (e.g., "1h", "7d").
 * @returns {string} - JWT token.
 */
exports.generateToken = (payload = {}, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifies a JWT token.
 * @param {string} token - JWT token.
 * @param {string} secret - Secret key for verification.
 * @returns {object} - Token payload if valid.
 * @throws {Error} - If token is invalid or expired.
 */
exports.verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        throw new Error("Invalid or expired token");
    }
};

/**
 * Decodes a token without verification.
 * @param {string} token - JWT token.
 * @returns {object} - Decoded token payload.
 * @throws {Error} - If token is invalid.
 */
exports.decodedToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (err) {
        throw new Error("Invalid token");
    }
};

/*
const token = generateToken({ userId: 123 }, "secret", "1h");
const payload = verifyToken(token, "secret");
*/