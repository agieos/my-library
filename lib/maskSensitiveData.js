/*
data:
{
    "id": "001",
    "name": "james",
    "phone": "0843758345345"
}
SENSITIVE_FIELDS = ["password", "phone"];    
*/
/**
 * Replaces sensitive field values with "******".
 * @param {object|array} data - Data to process.
 * @param {string[]} SENSITIVE_FIELDS - Fields to mask.
 * @returns {object|array} - Data with masked fields.
 */
exports.maskSensitiveData = (data, SENSITIVE_FIELDS) => {
    if (!data) return data;

    // Handles arrays
    if (Array.isArray(data)) {
        if (data.every(item => typeof item !== "object")) return data;
        return data.map(item => exports.maskSensitiveData(item, SENSITIVE_FIELDS));
    }

    // Handles Sequelize ORM
    const obj = data.dataValues ? data.dataValues : data;

    return Object.keys(obj).reduce((masked, key) => {
        if (SENSITIVE_FIELDS.some(item => item.toLowerCase().includes(key.toLowerCase()))) {
            masked[key] = "******";
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            masked[key] = exports.maskSensitiveData(obj[key], SENSITIVE_FIELDS);
        } else {
            masked[key] = obj[key];
        }
        return masked;
    }, {});
};

// const maskedData = maskSensitiveData(user, ["password", "email"]);