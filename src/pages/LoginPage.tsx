import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if(!response.ok) {
                setError('Login failed. Incorret email or password.');
                return;
            }

            const result = await response.json();
            setUser(result);
            navigate('/');

        } catch (err) {
            console.log(err);
        }
    }

    

    return (
        <div className='flex min-h-screen items-center justify-center bg-paper p-8'>
            <div className='w-full max-w-md'>
                <h1 className='mb-8 text-center font-display text-3xl text-ink'>
                    Log In
                </h1>
                <form onSubmit={handleLogin} className='space-y-6'>
                    {error && (
                        <p className='border border-line bg-paper px-3 py-2 font-body text-sm text-accent'>
                            {error}
                        </p>
                    )}
                    <div className='space-y-1'>
                        <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            placeholder='you@example.com'
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                        />
                    </div>
                    <div className='space-y-1'>
                        <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            placeholder='••••••••'
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                        />
                    </div>
                    <button className='w-full border-2 border-ink px-6 py-2 font-body text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper'>
                        Log In
                    </button>
                </form>
                <p className='mt-6 text-center font-body text-sm text-muted'>
                    Don't have an account?{' '}
                    <Link to='/register' className='text-ink underline hover:text-accent'>
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;