const bcrypt = require("bcrypt");

/**
 * Encrypts a password using bcrypt.
 * @param {string} password - The password to be encrypted.
 * @param {number} saltRounds - Number of hashing iterations (default: 10).
 * @returns {Promise<string>} - Hashed password.
 */
exports.hashPassword = async (password, saltRounds = 10) => {
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plaintext password with a stored hash.
 * @param {string} password - Plaintext password.
 * @param {string} hashedPassword - Hashed password from the database.
 * @returns {Promise<boolean>} - `true` if matched, `false` otherwise.
 */
exports.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/*
const hashedPass = await hashPassword("secret123"); // Store in DB
const isValid = await comparePassword("secret123", hashedPass); // true/false
*/