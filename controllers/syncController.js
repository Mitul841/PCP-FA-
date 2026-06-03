const axios = require('axios');
const User = require('../models/User');
const SyncLog = require('../models/SyncLog');
const {
  validateStudentRecord,
  normalizeStudentRecord,
} = require('../utils/syncValidators');

// Fetch data from private API
const fetchFromPrivateAPI = async (apiUrl, apiKey = null) => {
  try {
    const headers = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await axios.get(apiUrl, {
      headers,
      timeout: 30000, // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch from API: ${error.message}`);
  }
};

// Check for duplicate records
const checkDuplicate = async (email, externalId = null) => {
  try {
    // Check by email
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return { isDuplicate: true, reason: 'email', existingId: emailExists._id };
    }

    // Check by external ID if provided
    if (externalId) {
      const externalExists = await User.findOne({
        'externalId': externalId,
      });
      if (externalExists) {
        return { isDuplicate: true, reason: 'externalId', existingId: externalExists._id };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    throw new Error(`Duplicate check failed: ${error.message}`);
  }
};

// Sync students from private API
exports.syncStudents = async (req, res, next) => {
  let syncLog = null;

  try {
    const { apiUrl, apiKey, page = 1, limit = 100 } = req.body;

    if (!apiUrl) {
      return res.status(400).json({
        success: false,
        message: 'API URL is required',
      });
    }

    // Create sync log entry
    syncLog = new SyncLog({
      syncType: 'students',
      status: 'in_progress',
      sourceUrl: apiUrl,
    });
    await syncLog.save();

    // Fetch data from API
    let apiData;
    try {
      apiData = await fetchFromPrivateAPI(apiUrl, apiKey);
    } catch (error) {
      syncLog.status = 'failed';
      syncLog.summary.failed = 1;
      syncLog.errors.push({
        recordIndex: 0,
        message: error.message,
      });
      await syncLog.save();

      return res.status(400).json({
        success: false,
        message: 'Failed to fetch from API',
        error: error.message,
        syncLogId: syncLog._id,
      });
    }

    // Ensure data is an array
    const records = Array.isArray(apiData) ? apiData : apiData.data || [];
    syncLog.summary.total = records.length;

    // Validate, normalize, and deduplicate
    const validRecords = [];
    const summary = {
      total: records.length,
      synced: 0,
      duplicates: 0,
      invalid: 0,
      failed: 0,
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // Validate record
      const validation = validateStudentRecord(record, i);
      if (!validation.valid) {
        summary.invalid++;
        syncLog.errors.push({
          recordIndex: i,
          message: validation.errors.join('; '),
          data: record,
        });
        continue;
      }

      // Normalize record
      const normalizedRecord = normalizeStudentRecord(record);

      // Check for duplicates
      try {
        const duplicate = await checkDuplicate(
          normalizedRecord.email,
          record.id || record.externalId
        );

        if (duplicate.isDuplicate) {
          summary.duplicates++;
          continue;
        }
      } catch (error) {
        summary.failed++;
        syncLog.errors.push({
          recordIndex: i,
          message: error.message,
          data: record,
        });
        continue;
      }

      // Add to valid records
      validRecords.push(normalizedRecord);
    }

    // Persist valid records to MongoDB
    const insertedRecords = [];
    for (const validRecord of validRecords) {
      try {
        const newUser = new User(validRecord);
        const savedUser = await newUser.save();
        insertedRecords.push(savedUser._id);
        summary.synced++;
      } catch (error) {
        summary.failed++;
        syncLog.errors.push({
          recordIndex: records.indexOf(validRecord),
          message: error.message,
          data: validRecord,
        });
      }
    }

    // Update sync log
    const endTime = new Date();
    syncLog.status = 'completed';
    syncLog.summary = summary;
    syncLog.completedAt = endTime;
    syncLog.duration = endTime - syncLog.startedAt;
    await syncLog.save();

    // Return sync summary
    return res.status(200).json({
      success: true,
      message: 'Sync completed successfully',
      data: {
        syncLogId: syncLog._id,
        summary: {
          total: summary.total,
          synced: summary.synced,
          duplicates: summary.duplicates,
          invalid: summary.invalid,
          failed: summary.failed,
          successRate: `${((summary.synced / summary.total) * 100).toFixed(2)}%`,
        },
        duration: `${syncLog.duration}ms`,
        insertedRecords: insertedRecords.length,
        errors: syncLog.errors.slice(0, 10), // First 10 errors
        totalErrors: syncLog.errors.length,
      },
    });
  } catch (error) {
    // Update sync log with error
    if (syncLog) {
      syncLog.status = 'failed';
      await syncLog.save();
    }

    next(error);
  }
};

// Get sync history
exports.getSyncHistory = async (req, res, next) => {
  try {
    const { syncType = 'students', page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const syncLogs = await SyncLog.find({ syncType })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SyncLog.countDocuments({ syncType });

    return res.status(200).json({
      success: true,
      message: 'Sync history retrieved',
      data: {
        syncLogs: syncLogs.map((log) => ({
          id: log._id,
          syncType: log.syncType,
          status: log.status,
          sourceUrl: log.sourceUrl,
          summary: log.summary,
          duration: `${log.duration}ms`,
          completedAt: log.completedAt,
          createdAt: log.createdAt,
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get specific sync log details
exports.getSyncLogDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const syncLog = await SyncLog.findById(id);
    if (!syncLog) {
      return res.status(404).json({
        success: false,
        message: 'Sync log not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sync log details retrieved',
      data: {
        id: syncLog._id,
        syncType: syncLog.syncType,
        status: syncLog.status,
        sourceUrl: syncLog.sourceUrl,
        summary: syncLog.summary,
        duration: `${syncLog.duration}ms`,
        startedAt: syncLog.startedAt,
        completedAt: syncLog.completedAt,
        errors: syncLog.errors,
        successRate: `${(
          (syncLog.summary.synced / syncLog.summary.total) *
          100
        ).toFixed(2)}%`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Test sync API endpoint (uses mock data)
exports.testSync = async (req, res, next) => {
  try {
    // Mock data for testing
    const mockData = [
      {
        id: 'ext-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.sync@example.com',
        password: 'TestPass@123',
        role: 'student',
      },
      {
        id: 'ext-002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith.sync@example.com',
        role: 'student',
      },
      {
        id: 'ext-003',
        firstName: 'Invalid',
        // Missing lastName - will be invalid
        email: 'invalid@example.com',
      },
      {
        id: 'ext-004',
        firstName: 'Duplicate',
        lastName: 'Email',
        email: 'john.doe.sync@example.com', // Duplicate email
      },
      {
        id: 'ext-005',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        role: 'placement_officer',
      },
    ];

    // Create a temporary API endpoint simulation
    const mockApiUrl = 'mock://test-api/students';

    // Call sync with mock data logic
    const syncLog = new SyncLog({
      syncType: 'students',
      status: 'in_progress',
      sourceUrl: mockApiUrl,
    });
    await syncLog.save();

    const summary = {
      total: mockData.length,
      synced: 0,
      duplicates: 0,
      invalid: 0,
      failed: 0,
    };

    const validRecords = [];

    for (let i = 0; i < mockData.length; i++) {
      const record = mockData[i];

      // Validate
      const validation = validateStudentRecord(record, i);
      if (!validation.valid) {
        summary.invalid++;
        syncLog.errors.push({
          recordIndex: i,
          message: validation.errors.join('; '),
          data: record,
        });
        continue;
      }

      // Normalize
      const normalizedRecord = normalizeStudentRecord(record);

      // Check duplicate
      const duplicate = await checkDuplicate(
        normalizedRecord.email,
        record.id
      );
      if (duplicate.isDuplicate) {
        summary.duplicates++;
        continue;
      }

      validRecords.push(normalizedRecord);
    }

    // Persist
    const insertedRecords = [];
    for (const validRecord of validRecords) {
      try {
        const newUser = new User(validRecord);
        const savedUser = await newUser.save();
        insertedRecords.push(savedUser._id);
        summary.synced++;
      } catch (error) {
        summary.failed++;
        syncLog.errors.push({
          message: error.message,
          data: validRecord,
        });
      }
    }

    // Update log
    const endTime = new Date();
    syncLog.status = 'completed';
    syncLog.summary = summary;
    syncLog.completedAt = endTime;
    syncLog.duration = endTime - syncLog.startedAt;
    await syncLog.save();

    return res.status(200).json({
      success: true,
      message: 'Test sync completed successfully',
      data: {
        syncLogId: syncLog._id,
        summary: {
          total: summary.total,
          synced: summary.synced,
          duplicates: summary.duplicates,
          invalid: summary.invalid,
          failed: summary.failed,
          successRate: `${((summary.synced / summary.total) * 100).toFixed(2)}%`,
        },
        duration: `${syncLog.duration}ms`,
        insertedRecords: insertedRecords.length,
        errors: syncLog.errors,
        note: 'This is a test sync using mock data. Replace with actual API URL for production.',
      },
    });
  } catch (error) {
    next(error);
  }
};
