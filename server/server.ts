import express from 'express';
import { pool } from './db';
import calculationsRouter from './routes/calculations';
import authRouter from './routes/auth';

const app = express();
const PORT = 3001;

//Health check
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', dbTime: result.rows[0].now });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Database connection has failed.' });
    }
    
});

app.use('/api/calculations', calculationsRouter);

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})