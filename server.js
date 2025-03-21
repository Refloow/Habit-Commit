const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'data', 'workouts.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/data', (req, res) => {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        res.json(JSON.parse(data));
    } else {
        res.json({ year: new Date().getFullYear(), workouts: {} });
    }
});

app.post('/data', (req, res) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(req.body, null, 2));
    res.json({ status: 'success' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
