/**
 * Validation functions for user data
 */

/**
 * Validates if all required fields are present and valid
 * @param {Object} userData - User data to validate
 * @param {string|number} userData.id - User ID
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {number} userData.age - User age
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateRequiredFields = ({ id, name, email, age }) => {
    if (!id || !name || !email || typeof age !== 'number') {
        return {
            isValid: false,
            error: 'Missing or invalid fields. Required: id, name, email, age (number)'
        };
    }
    return { isValid: true };
};

/**
 * Validates user name format and length
 * @param {string} name - User name to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateName = (name) => {
    if (typeof name !== 'string' || name.trim().length < 2) {
        return {
            isValid: false,
            error: 'Name must be at least 2 characters long'
        };
    }
    return { isValid: true };
};

/**
 * Validates user age
 * @param {number} age - User age to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateAge = (age) => {
    if (typeof age !== 'number' || age <= 0) {
        return {
            isValid: false,
            error: 'Age must be a positive number'
        };
    }
    return { isValid: true };
};

/**
 * Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Invalid email format'
        };
    }
    return { isValid: true };
};

/**
 * Validates if user data has all required properties
 * @param {Array} usersData - Array of users
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateUsersData = (usersData, requiredFields = ['id', 'name', 'email', 'age']) => {
    if (!Array.isArray(usersData) || usersData.length === 0) {
        return {
            isValid: false,
            error: 'No users found'
        };
    }

    const invalidUsers = usersData.filter(
        user => !requiredFields.every(field => user[field] !== undefined && user[field] !== null)
    );

    if (invalidUsers.length > 0) {
        return {
            isValid: false,
            error: 'Invalid user data detected'
        };
    }

    return { isValid: true };
};

/**
 * Checks if a user already exists by id or email
 * @param {Array} usersData - Array of existing users
 * @param {string|number} id - User ID to check
 * @param {string} email - Email to check
 * @returns {Object} Check result with exists boolean and error message
 */
const checkUserExists = (usersData, id, email) => {
    const exists = usersData.some(user => user.id === id || user.email === email);
    if (exists) {
        return {
            exists: true,
            error: 'User with this id or email already exists'
        };
    }
    return { exists: false };
};

/**
 * Checks if an email is already in use by another user (for updates)
 * @param {Array} usersData - Array of existing users
 * @param {string} email - Email to check
 * @param {number} excludeIndex - Index of user to exclude from check
 * @returns {Object} Check result with exists boolean and error message
 */
const checkEmailInUse = (usersData, email, excludeIndex) => {
    const emailExists = usersData.some(
        (user, idx) => user.email === email && idx !== excludeIndex
    );
    if (emailExists) {
        return {
            exists: true,
            error: 'Email already in use by another user'
        };
    }
    return { exists: false };
};

/**
 * Validates complete user data for creation
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateUserForCreation = (userData) => {
    // Check required fields
    const requiredValidation = validateRequiredFields(userData);
    if (!requiredValidation.isValid) {
        return requiredValidation;
    }

    // Validate name
    const nameValidation = validateName(userData.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    // Validate age
    const ageValidation = validateAge(userData.age);
    if (!ageValidation.isValid) {
        return ageValidation;
    }

    // Validate email
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }

    return { isValid: true };
};

/**
 * Validates user data for updates (partial validation)
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateUserForUpdate = (userData) => {
    const { name, email, age } = userData;

    // Validate name if provided
    if (name !== undefined) {
        const nameValidation = validateName(name);
        if (!nameValidation.isValid) {
            return nameValidation;
        }
    }

    // Validate email if provided
    if (email !== undefined) {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return emailValidation;
        }
    }

    // Validate age if provided
    if (age !== undefined) {
        const ageValidation = validateAge(age);
        if (!ageValidation.isValid) {
            return ageValidation;
        }
    }

    return { isValid: true };
};

/**
 * Validates user ID for operations like delete or get by ID
 * @param {string|number} id - User ID to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
const validateUserId = (id) => {
    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
            isValid: false,
            error: 'User ID is required and must be a string or number'
        };
    }

    // Check if ID is a valid number when converted
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
        return {
            isValid: false,
            error: 'User ID must be a valid positive number'
        };
    }

    return { isValid: true };
};

module.exports = {
    validateRequiredFields,
    validateName,
    validateAge,
    validateEmail,
    validateUsersData,
    validateUserId,
    checkUserExists,
    checkEmailInUse,
    validateUserForCreation,
    validateUserForUpdate
};
