import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import Header from './Header';

export default function ProtectedRoute() {
    const { user, setUser }  = useAuth();
    const [ loading, setLoading ] = useState(true);
    
    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch('http://localhost:3001/api/auth/me', {
                    credentials: 'include'
                });

                if(response.ok) {
                    const result = await response.json();
                    setUser(result);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.log(err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    if(loading) return <p> Loading... </p>
    if(!user) return <Navigate to='/login' replace />

    return (
        <>
            <Header />
            <Outlet />
        </>
    );
    

}

