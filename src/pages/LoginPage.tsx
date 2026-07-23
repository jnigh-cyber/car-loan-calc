import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';

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
        <div>
            <form onSubmit={handleLogin}>
                {error && <p>{error}</p>}
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

export default LoginPage;