import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';

const app = express();
const PORT = 3001;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', dbTime: result.rows[0].now });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Database connection has failed.' });
    }
    
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})