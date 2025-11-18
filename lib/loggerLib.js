const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");

const SENSITIVE_FIELDS = ["password", "newpassword"];

// Masks sensitive data
const maskSensitiveData = (data) => {
    if (!data || typeof data !== "object") return data;
    SENSITIVE_FIELDS = SENSITIVE_FIELDS.map(field => field.toLowerCase());
    return JSON.parse(
        JSON.stringify(data, (key, value) =>
            SENSITIVE_FIELDS.includes(key.toLowerCase()) ? "******" : value
        )
    );
};

// Log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level} : ${message}`;
});

// Logger configuration
const winstonLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winstonDaily({
            filename: "logs/%DATE%-app.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "7d",
            zippedArchive: true,
            format: winston.format.combine(winston.format.uncolorize()),
        }),
    ],
});

// Middleware for request/response logging
const requestLogger = (req, res, next) => {
    const { method, url, headers, body } = req;
    const start = Date.now();

    winstonLogger.info(`Request: ${method} ${url}`);
    winstonLogger.info(`Headers: ${JSON.stringify(maskSensitiveData(headers))}`);
    if (body && Object.keys(body).length) {
        winstonLogger.info(`Body: ${JSON.stringify(maskSensitiveData(body))}`);
    }

    // Intercepts response
    const chunks = [];
    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk) {
        chunks.push(chunk);
        originalWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
        if (chunk) chunks.push(chunk);

        try {
            const responseBody = Buffer.isBuffer(chunks[0])
                ? Buffer.concat(chunks).toString("utf8")
                : chunks.join('');

            const duration = Date.now() - start;

            winstonLogger.info(`Response: ${method} ${url} ${res.statusCode} (${duration}ms)`);

            // Try to parse as JSON, otherwise log as string
            try {
                const parsedBody = JSON.parse(responseBody);
                winstonLogger.info(`Response Body: ${JSON.stringify(maskSensitiveData(parsedBody))}`);
            } catch {
                // Truncate long non-JSON responses
                const truncatedBody = responseBody.length > 500
                    ? responseBody.substring(0, 500) + '...'
                    : responseBody;
                winstonLogger.info(`Response Body: ${truncatedBody}`);
            }
        } catch (error) {
            winstonLogger.error(`Error logging response: ${error.message}`);
        }

        originalEnd.apply(res, arguments);
    };

    next();
};

module.exports = { winstonLogger, requestLogger };

/*
app.use(requestLogger); // Use in Express
winstonLogger.info("Sample log message");
*/