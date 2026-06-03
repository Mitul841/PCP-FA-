// Validate student record
const validateStudentRecord = (record, index) => {
  const errors = [];

  // Check required fields
  if (!record.firstName || typeof record.firstName !== 'string' || record.firstName.trim().length < 2) {
    errors.push('First name is required and must be at least 2 characters');
  }

  if (!record.lastName || typeof record.lastName !== 'string' || record.lastName.trim().length < 2) {
    errors.push('Last name is required and must be at least 2 characters');
  }

  if (!record.email || typeof record.email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(record.email)) {
    errors.push('Invalid email format');
  }

  // Password is optional during sync but if provided must be strong
  if (record.password && typeof record.password !== 'string') {
    errors.push('Password must be a string');
  }

  // Validate role if provided
  if (record.role && !['Admin', 'placement_officer', 'student'].includes(record.role)) {
    errors.push('Invalid role');
  }

  return {
    valid: errors.length === 0,
    errors,
    index,
  };
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Normalize student record
const normalizeStudentRecord = (record) => {
  return {
    firstName: record.firstName?.trim() || '',
    lastName: record.lastName?.trim() || '',
    email: record.email?.toLowerCase().trim() || '',
    password: record.password || 'DefaultPass@123', // Default password for synced records
    role: record.role || 'student',
    isActive: record.isActive !== undefined ? record.isActive : true,
    source: record.source || 'api_sync',
    externalId: record.id || record.externalId || null, // Track original ID from source
  };
};

// Validate pagination parameters
const validatePaginationParams = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return { page: pageNum, limit: limitNum };
};

module.exports = {
  validateStudentRecord,
  isValidEmail,
  normalizeStudentRecord,
  validatePaginationParams,
};
