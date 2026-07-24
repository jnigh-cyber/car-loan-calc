import type React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const { setUser } = useAuth();
    const navigate = useNavigate();


    async function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        try {
            await fetch('http://localhost:3001/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            setUser(null);
            navigate('/login');

        } catch (err) {
            console.log(err);
        }
    }


    return (
        <header className='flex items-center justify-between border-b border-line bg-paper px-8 py-4'>
            <Link to='/' className='font-display text-lg text-ink'>
                Loan Calculator
            </Link>
            <nav className='flex items-center gap-6'>
                <Link
                    to='/saved'
                    className='font-body text-sm uppercase tracking-wide text-muted hover:text-ink transition-colors'
                >
                    Saved Calculations
                </Link>
                <button
                    onClick={handleLogout}
                    className='border-2 border-ink px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper'
                >
                    Log Out
                </button>
            </nav>
        </header>
    )
}

export default Header; 