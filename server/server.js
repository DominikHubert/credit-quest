const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 80; // Docker internal port
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return {}; // Default empty state
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return {};
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API Endpoints
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/api/data', (req, res) => {
    const newData = req.body;
    writeData(newData);
    res.json({ success: true });
});

// Serve Static Files (React App)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
