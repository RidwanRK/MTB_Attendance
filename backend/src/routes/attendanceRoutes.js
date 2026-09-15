const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  markAbsent,
  getRecords,
  updateRecord,
  deleteRecord,
} = require('../controllers/attendanceController');

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.post('/absent', markAbsent);
router.get('/records', getRecords);
router.put('/records/:id', updateRecord);
router.delete('/records/:id', deleteRecord);

module.exports = router;
