import { Router } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';
import { JWT_SECRET, cookieOptions, clearCookieOptions } from '../config'


const router = Router();

router.get('/me', requireAuth, async (req, res) => {
    try {
        const { id, username } = req.user as JwtPayload;
        res.json({ id, username });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch authd user.' })
    }
})

router.post('/register', async (req, res) => {
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

            const token = jwt.sign(
                { id: newUser.rows[0].id, username: newUser.rows[0].username },
                process.env.JWT_SECRET!,
                {expiresIn: '1h'}
            
            );
            res.cookie('token', token, cookieOptions)
            res.status(201).json(newUser.rows[0]);

        } else {
            res.status(409).json({ status: 'error', message: 'Email is already registered.' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to register user.' });
    }
})

router.post('/login', async (req, res) => {
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
                const token = jwt.sign(
                    { id: results.rows[0].id, username: results.rows[0].username },
                    process.env.JWT_SECRET!,
                    { expiresIn: '1h'}
                );

                //REMINDER Set secure: 'true' for prod.
                res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 3600000});
                res.json({ id: results.rows[0].id, username: results.rows[0].username });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to log in.' });
    }
})

router.post('/logout', async (req, res) => {
    res.clearCookie('token', clearCookieOptions);
    res.status(200).json({ status: 'success', message: 'Successfully logged out.' });
})

export default router;