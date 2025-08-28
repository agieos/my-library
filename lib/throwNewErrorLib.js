const logger = require("../lib/loggerLib").winstonLogger;

/**
 * Throws a new error and logs it.
 * @param {string} message - Error message.
 * @throws {Error} - New error.
 */
exports.throwNewError = (message) => {
    logger.error(message);
    throw new Error(message);
};

// if (!user) throwNewError("User not found");