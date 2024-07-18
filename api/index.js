require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createPool } = require('mysql2');

const app = express();

// const pool = createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    // origin: process.env.CORS_ORIGIN,
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
}));

// const routes = require('./routes');
// app.use('/', routes); // Use routes as middleware

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.json({ test: 123 });
});

// module.exports = pool;
