import { Router } from 'express';
import { pool } from '../db';
import express from 'express';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/register', express.json(), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = await pool.query(`
                INSERT INTO users (username, email, password_hash)
                VALUES ($1, $2, $3) 
                RETURNING id, username, email`, [username, email, passwordHash]    
            );
            
            res.status(201).json(newUser.rows[0]);
            
        } else {
            res.status(409).json({ status: 'error', message: 'Email is already registered.' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to register user.' });
    }
})

router.post('/login', express.json(), async (req, res) => {
    try {
        const { email, password } = req.body;
        const results = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (results.rows.length === 0) {
            res.status(401).json({ status: 'Unauthorized', message: 'Invalid credentials.' });
        } else {
            const compPass = await bcrypt.compare(password, results.rows[0].password_hash);
            if (!compPass) {
                res.status(401).json({ status: 'Unauthorized', message: 'Invalid credentials.' });
            } else {
                //ISSUE JWT 
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to log in.' });
    }
})

export default router;