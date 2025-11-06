const { v4: uuidv4 } = require("uuid");

/**
 * Retrieves or creates a unique device ID (stored in localStorage).
 * @returns {string} - Device ID.
 */
exports.getDeviceId = () => {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
        deviceId = uuidv4(); // Generate UUID v4
        localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
};

// const deviceId = getDeviceId(); // "a1b2c3d4-e5f6-..."