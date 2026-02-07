import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 80;
const DATA_FILE = path.join(__dirname, '../data', 'db.json'); // Adjusted path slightly if needed, but relative to server.js is fine.
// Wait, in Docker, WORKDIR /app. 
// Server code is in /app/server. 
// Data mount is /app/data.
// So from /app/server/server.js, data is ../data/db.json. 
// Previous code was: path.join(__dirname, 'data', 'db.json') which meant /app/server/data/db.json
// But volume mount in compose is /app/data.
// So I should fix the path too!
// Docker compose: - credit_data:/app/data
// Dockerfile: CMD ["node", "server/server.js"] (running from /app)
// If running from /app, process.cwd() is /app.
// But __dirname is /app/server.
// So correct path to data volume is path.join(__dirname, '../data', 'db.json').
// Let's verify standard structure. 
// If I use process.cwd() ('/app'), then 'data/db.json' works.
// If I use __dirname ('/app/server'), then '../data/db.json' works.
// I will use imports and fix path.

app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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
// Dist is in /app/dist
// __dirname is /app/server
// so dist is ../dist
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Fallback
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
