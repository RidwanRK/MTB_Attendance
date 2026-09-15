const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    day: { type: String, required: true }, // full weekday name, server-derived
    checkIn: { type: String, default: null }, // h:mm A
    checkOut: { type: String, default: null }, // h:mm A
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },
    late: { type: String, enum: ['Yes', 'No'], default: 'No' },
    remarks: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
