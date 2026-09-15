const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Marzia Hossain' },
    studentId: { type: String, default: '2022-2-10-259' },
    role: { type: String, default: 'Intern' },
    institution: { type: String, default: 'East West University' },
    unit: { type: String, default: 'Process Re-engineering and Optimization Unit' },
    division: { type: String, default: 'Digital Banking Division' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
