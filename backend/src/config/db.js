const mongoose = require('mongoose');
const Profile = require('../models/Profile');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance';
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${uri}`);
  await seedProfile();
}

async function seedProfile() {
  const existing = await Profile.findOne();
  if (!existing) {
    await Profile.create({});
    console.log('Seeded default Profile document');
  }
}

module.exports = connectDB;
