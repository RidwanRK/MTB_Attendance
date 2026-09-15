const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Dhaka';

function now() {
  return dayjs().tz(TZ);
}

function todayDate() {
  return now().format('YYYY-MM-DD');
}

function dayName(dateStr) {
  return dayjs.tz(dateStr, TZ).format('dddd');
}

module.exports = { dayjs, TZ, now, todayDate, dayName };
