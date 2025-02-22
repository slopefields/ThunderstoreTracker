const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const dbPath = './modmetrics.db';

// Connect to modmetrics.db
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err =>
{
    if (err)
        console.error("Failed to connect to modmetrics.db", err.message);
    else   
        console.log("Successfully connected to modmetrics.db");
});

// Enable CORS, cross-origin resource sharing
app.use(cors());

app.get('/data', (req, res) => {
    // Destructure query parameters from request
    const { start_date, end_date } = req.query;
    
    // Debugging
    console.log(`Received start_date: ${start_date}, end_date: ${end_date}`);

    // Ensure both start date and end date are valid
    if (!start_date && !end_date)
        return res.status(400).json({error : 'Start date and end date both required.'});

    const [startYear, startMonth, startDay] = start_date.split('-');
    const [endYear, endMonth, endDay] = end_date.split('-');

    // Debugging
    console.log(`startYear: ${startYear}, startMonth: ${startMonth}, startDay: ${startDay}`);
    console.log(`endYear: ${endYear}, endMonth: ${endMonth}, endDay: ${endDay}`);

    const query = `
        SELECT year, month, day, downloads
        FROM metrics
        WHERE (year > ? OR (year = ? AND (month > ? OR (month = ? AND day >= ?))))
        AND (year < ? OR (year = ? AND (month < ? OR (month = ? AND day <= ?))))
        ORDER BY year ASC, month ASC, day ASC
    `;

    db.all(query, [startYear, startYear, startMonth, startMonth, startDay, endYear, endYear, endMonth, endMonth, endDay], (err, rows) =>
    {
        if (err)
            return res.status(500).json({error : 'Error querying database: ' + err.message});

        // Log query results
        console.log("Query Results:", rows.length, "records found");
        console.log(rows);

        // Get rows as a json
        res.json(rows);
    });
});

// Start server
app.listen(port, () =>
{
    console.log(`Server running with port ${port}`);
});