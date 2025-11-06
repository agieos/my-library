const logger = require("../lib/loggerLib").winstonLogger;

/**
 * Standard success response.
 * @param {object} res - Express response object.
 * @param {string|object} message - Success message.
 * @param {object} data - Additional data (optional).
 */
exports.success = (res, message, data = {}) => {
    logger.info(
        typeof message === "object" ? JSON.stringify(message) :
            message + (Object.keys(data).length ? ` ${JSON.stringify(data)}` : "")
    );
    res.status(200).json({ success: true, message, payload: data });
};

/**
 * Standard error response.
 * @param {object} res - Express response object.
 * @param {string|object} message - Error message.
 * @param {number} statusCode - HTTP status code (default: 500).
 */
exports.error = (res, message, statusCode = 500) => {
    logger.error(typeof message === "object" ? JSON.stringify(message) : message);
    res.status(statusCode).json({ success: false, message });
};

/*
success(res, "Login successful", { user: maskedUser });
error(res, "Email already registered", 400);
*/