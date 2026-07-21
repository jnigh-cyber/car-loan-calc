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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})