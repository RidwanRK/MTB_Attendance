const express = require('express');
const cors = require('cors');

const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin:
      allowedOrigins.includes('*')
        ? true
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              return callback(null, true);
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`));
          },
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', attendanceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/report', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
