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
 * @param {string[]} SENSITIVE_FIELDS - Fields to mask, all lowered case.
 * @returns {object|array} - Data with masked fields.
 */
exports.maskSensitiveData = (data, SENSITIVE_FIELDS) => {
    if (!data) return data;
    const arr_check = SENSITIVE_FIELDS.map(field => field.toLowerCase());
    // Handles arrays
    if (Array.isArray(data)) {
        if (data.every(item => typeof item !== "object")) return data;
        return data.map(item => exports.maskSensitiveData(item, arr_check));
    }

    // Handles Sequelize ORM
    const obj = data.dataValues ? data.dataValues : data;

    return Object.keys(obj).reduce((masked, key) => {
        if (arr_check.includes(key.toLowerCase())) {
            masked[key] = "******";
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            masked[key] = exports.maskSensitiveData(obj[key], arr_check);
        } else {
            masked[key] = obj[key];
        }
        return masked;
    }, {});
};

// const maskedData = maskSensitiveData(user, ["password", "email"]);