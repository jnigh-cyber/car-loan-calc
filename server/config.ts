import 'dotenv/config';

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set.`);
    return value;
}

export const JWT_SECRET = required('JWT_SECRET');
export const DATABASE_URL = required('DATABASE_URL');
export const PORT = Number(process.env.PORT) || 3001;
export const IS_PROD = process.env.NODE_ENV === 'production';

export const cookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: 3600000,
} as const;

const { maxAge: _maxAge, ...clearCookieOptions } = cookieOptions;
export { clearCookieOptions };