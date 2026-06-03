const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema(
  {
    syncType: {
      type: String,
      enum: ['students', 'placements', 'companies'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    summary: {
      total: { type: Number, default: 0 },
      synced: { type: Number, default: 0 },
      duplicates: { type: Number, default: 0 },
      invalid: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    errors: [
      {
        recordIndex: Number,
        message: String,
        data: mongoose.Schema.Types.Mixed,
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    duration: Number, // in milliseconds
  },
  { timestamps: true }
);

module.exports = mongoose.model('SyncLog', syncLogSchema);
