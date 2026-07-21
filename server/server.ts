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

app.post('/api/calculations', express.json(), async ( req, res ) => {
    try {
        const {
            label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment, 
        } = req.body;

        const result = await pool.query(`
            INSERT INTO saved_calculations
                (label, price, trade_in_value, trade_in_owed, doc_fee, dmv_fees, tax_rate, apr, term_months, down_payment, otd, monthly_payment)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING * `, [label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to save calculations.' })
    }
})

app.put('/api/calculations/:id', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment, 
        } = req.body;

        const result = await pool.query(`
            UPDATE saved_calculations
            SET label = $1, price = $2, trade_in_value = $3, trade_in_owed = $4, doc_fee = $5, dmv_fees = $6, tax_rate = $7, apr = $8, term_months = $9, down_payment = $10, otd = $11, monthly_payment = $12
            WHERE id = $13
            RETURNING *
        `, [label, price, tradeInValue, tradeInOwed, docFee, dmvFees, taxRate, apr, termMonths, downPayment, otd, monthlyPayment, id])
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

app.get('/api/calculations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM saved_calculations ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch saved_calculations.' })
    }
})

app.get('/api/calculations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM saved_calculations 
            WHERE id = $1`, [id]
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
 
app.delete('/api/calculations/:id', async (req,res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
                DELETE FROM saved_calculations
                WHERE id = $1
                RETURNING *
            `, [id]);
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})