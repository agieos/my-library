const logger = require("./responseLib");

/**
 * Middleware for request validation.
 * @param {object} schema - Joi validation schema.
 * @param {string} property - Request part to validate ("body", "params", "query").
 * @returns {function} - Express middleware.
 */
const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return logger.error(res, errorMessages, 400);
    }
    next();
  };
};

module.exports = validateRequest;

// router.post("/login", validateRequest(loginSchema), loginController);