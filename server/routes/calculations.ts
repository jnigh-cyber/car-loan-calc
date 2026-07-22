import { Router } from 'express';
import { pool } from '../db';
import express from 'express';
import { requireAuth } from '../middleware/auth';
import { JwtPayload } from 'jsonwebtoken';

const router = Router();

router.get('/', requireAuth, async (req,res) => {
    try {
        const userId = ( req.user as JwtPayload ).id;
        const result = await pool.query('SELECT * FROM saved_calculations WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch saved_calculations.' })
    }
})

router.get('/:id', requireAuth, async (req,res) => {
    try {
        const { id } = req.params;
        const userId = (req.user as JwtPayload).id;
        const result = await pool.query(`
            SELECT * FROM saved_calculations 
            WHERE id = $1 AND user_id = $2`, [id, userId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ status: 'error', message: 'Resource does not exist.' });
        } else {
            res.json(result.rows[0]);
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to get called row data.' })
    }
})

router.delete('/:id', requireAuth, async (req,res) => {
    try {
        const { id } = req.params;
        const userId = (req.user as JwtPayload).id;
        const result = await pool.query(`
                DELETE FROM saved_calculations
                WHERE id = $1 AND user_id = $2
                RETURNING *
            `, [id, userId]);
            if (result.rows.length === 0) {
                res.status(404).json({ status: 'error', message: 'Failed to delete resource.' })
            } else {
                res.status(204).send();
                
            }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to delete resource.'

         })
    }
})

router.put('/:id', requireAuth, express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req.user as JwtPayload).id;
        const {
            label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment, 
        } = req.body;

        const result = await pool.query(`
            UPDATE saved_calculations
            SET label = $1, price = $2, trade_in_value = $3, trade_in_owed = $4, doc_fee = $5, dmv_fees = $6, tax_rate = $7, apr = $8, term_months = $9, down_payment = $10, otd = $11, monthly_payment = $12
            WHERE id = $13 AND user_id = $14
            RETURNING *
        `, [label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment, id, userId])
        if (result.rows.length === 0) {
            res.status(404).json({ status: 'error', message: 'Resource does not exist.' })
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed' })
    }
})

router.post('/', requireAuth, express.json(), async (req, res) => {
    try {
        const userId = ( req.user as JwtPayload ).id;
        const {
            label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment, 
        } = req.body;

        const result = await pool.query(`
            INSERT INTO saved_calculations
                (user_id, label, price, trade_in_value, trade_in_owed, doc_fee, dmv_fees, tax_rate, apr, term_months, down_payment, otd, monthly_payment)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING * `, [userId, label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to save calculations.' })
    }
})


export default router;