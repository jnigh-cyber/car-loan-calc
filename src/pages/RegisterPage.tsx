import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    async function handleRegister(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            if(!response.ok) {
                setError('Resgistration failed.');
                return;
            }

            const result = await response.json();
            setUser(result);
            navigate('/')
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <div>
            <form onSubmit={handleRegister}>
                {error && <p>{error}</p>}
                <input 
                    type="text"
                    value={username}
                    placeholder='Username'
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="text"
                    value={email}
                    placeholder='Email'
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password"
                    value={password}
                    placeholder='Password'
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button>
                    Submit
                </button>
            </form>
        </div>
    )
}

export default RegisterPage;