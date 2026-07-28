import express from 'express';
import { pool } from './db';
import cookieParser from 'cookie-parser';
import calculationsRouter from './routes/calculations';
import authRouter from './routes/auth';
import cors from 'cors';
import path from 'path';
import { PORT, IS_PROD } from './config';
import { apiLimiter } from './middleware/rateLimit';

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.set('trust proxy', 1);

if (!IS_PROD) {
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }));
}

app.use('/api', apiLimiter);

// Health check
app.get('/api/health', async (_req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', dbTime: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Database connection has failed.' });
    }
});

app.use('/api/calculations', calculationsRouter);
app.use('/api/auth', authRouter);
app.use('/api', (_req, res) => {
    res.status(404).json({ status: 'error', message: 'Endpoint not found.' })
});

if (IS_PROD) {
    const clientDist = path.join(__dirname, '../../dist');
    app.use(express.static(clientDist));
    app.use((_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});