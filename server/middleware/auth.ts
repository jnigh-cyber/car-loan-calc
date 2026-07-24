import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ status: 'error', message: 'No cookie exists.' });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }
}