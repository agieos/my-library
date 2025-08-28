const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");

const SENSITIVE_FIELDS = ["password", "phone", "token", "ssn"];

// Masks sensitive data
const maskSensitiveData = (data) => {
    if (!data || typeof data !== "object") return data;
    return JSON.parse(
        JSON.stringify(data, (key, value) =>
            SENSITIVE_FIELDS.includes(key) ? "***MASKED***" : value
        )
    );
};

// Log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
    const caller = getCaller();
    return `[${timestamp}] ${level} [${caller}] : ${message}`;
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
        const responseBody = Buffer.concat(chunks).toString("utf8");
        const duration = Date.now() - start;

        winstonLogger.info(`Response: ${method} ${url} ${res.statusCode} (${duration}ms)`);
        try {
            const parsedBody = JSON.parse(responseBody);
            winstonLogger.info(`Response Body: ${JSON.stringify(maskSensitiveData(parsedBody))}`);
        } catch {
            winstonLogger.info(`Response Body: ${responseBody.substring(0, 500)}`);
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

const getCaller = () => {
    try {
        const stack = new Error().stack.split('\n');
        if (stack.length > 3) {
            const callerLine = stack[3].trim();
            // Match format: "at Class.method (file:line:column)"
            const match = callerLine.match(/at (?:(.+?)\.)?([^\.]+?) \(/);
            return match ? (match[1] ? `${match[1]}.${match[2]}` : match[2]) : 'anonymous';
        }
        return 'unknown';
    } catch (e) {
        return 'error_getting_caller';
    }
};