const Profile = require('../models/Profile');

async function getProfile(req, res) {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const allowed = ['name', 'studentId', 'role', 'institution', 'unit', 'division'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(update);
    } else {
      Object.assign(profile, update);
      await profile.save();
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
}

module.exports = { getProfile, updateProfile };
