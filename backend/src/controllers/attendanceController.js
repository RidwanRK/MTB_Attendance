const AttendanceRecord = require('../models/AttendanceRecord');
const { dayjs, TZ, now, todayDate, dayName } = require('../utils/dayjs');

const LATE_CUTOFF_HOUR = 10; // 10:00 AM

async function checkIn(req, res) {
  try {
    const date = todayDate();
    const day = dayName(date);
    const current = now();

    let record = await AttendanceRecord.findOne({ date });
    if (record && record.checkIn) {
      return res.status(409).json({
        message: `Already checked in at ${record.checkIn}`,
        record,
      });
    }

    const lateCutoff = dayjs.tz(`${date} ${LATE_CUTOFF_HOUR}:00`, 'YYYY-MM-DD H:mm', TZ);
    const late = current.isAfter(lateCutoff) ? 'Yes' : 'No';
    const status = late === 'Yes' ? 'Late' : 'Present';

    const update = {
      date,
      day,
      checkIn: current.format('h:mm A'),
      late,
      status,
    };

    record = await AttendanceRecord.findOneAndUpdate(
      { date },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to check in', error: err.message });
  }
}

async function checkOut(req, res) {
  try {
    const date = todayDate();
    const record = await AttendanceRecord.findOne({ date });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You must check in before checking out' });
    }
    if (record.checkOut) {
      return res.status(409).json({
        message: `Already checked out at ${record.checkOut}`,
        record,
      });
    }

    record.checkOut = now().format('h:mm A');
    await record.save();

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to check out', error: err.message });
  }
}

async function markAbsent(req, res) {
  try {
    const date = req.body.date || todayDate();
    const note = req.body.note || '';
    const day = dayName(date);

    const record = await AttendanceRecord.findOneAndUpdate(
      { date },
      {
        $set: {
          date,
          day,
          status: 'Absent',
          late: 'No',
          checkIn: null,
          checkOut: null,
          notes: note,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark absent', error: err.message });
  }
}

async function getRecords(req, res) {
  try {
    const { start, end } = req.query;
    const filter = {};
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = start;
      if (end) filter.date.$lte = end;
    }
    const records = await AttendanceRecord.find(filter).sort({ date: 1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch records', error: err.message });
  }
}

async function updateRecord(req, res) {
  try {
    const { id } = req.params;
    const allowed = ['remarks', 'notes', 'status', 'late', 'checkIn', 'checkOut', 'date'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (update.date) {
      update.day = dayName(update.date);
    }

    const record = await AttendanceRecord.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update record', error: err.message });
  }
}

async function deleteRecord(req, res) {
  try {
    const { id } = req.params;
    const record = await AttendanceRecord.findByIdAndDelete(id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json({ message: 'Record deleted', record });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete record', error: err.message });
  }
}

module.exports = {
  checkIn,
  checkOut,
  markAbsent,
  getRecords,
  updateRecord,
  deleteRecord,
};
