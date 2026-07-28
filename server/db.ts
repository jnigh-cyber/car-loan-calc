import { DATABASE_URL, IS_PROD } from './config';
import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: IS_PROD ? { rejectUnauthorized: false } : false,
});