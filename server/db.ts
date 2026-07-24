import { DATABASE_URL } from './config';
import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: DATABASE_URL
});