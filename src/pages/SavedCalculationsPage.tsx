import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type SavedCalculation = {
    id: number;
    label: string;
    price: number;
    trade_in_value: number;
    trade_in_owed: number;
    doc_fee: number;
    dmv_fees: number;
    tax_rate: number;
    apr: number;
    term_months: number;
    down_payment: number;
    otd: number;
    monthly_payment: number;
    created_at: string;
    user_id: number;
};

function SavedCalculationsPage() {
    const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function fetchCalculations() {
            try {
                const response = await fetch('http://localhost:3001/api/calculations', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const result = await response.json();
                    setCalculations(result);
                } else {
                    setError('Failed to fetch saved calculations.');
                }

            } catch (err) {
                setError('Failed to fetch saved calculations');
            } finally {
                setLoading(false);
            }
        }

        fetchCalculations();
    }, []);

    async function handleDelete(id: number) {
        try {
            const response = await fetch(`http://localhost:3001/api/calculations/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setCalculations(prev => prev.filter(calc => calc.id !== id));
            } else {
                setError('Failed to remove')
            }
        } catch (err) {
            setError('Failed to remove requested calculation.')
        }
    }

    if (loading) return (
        <div className='flex min-h-screen items-center justify-center bg-paper'>
            <p className='font-body text-muted'>Loading...</p>
        </div>
    );

    return (
        <div className='min-h-screen bg-paper p-8'>
            <div className='mx-auto w-full max-w-2xl'>
                <h1 className='mb-8 font-display text-3xl text-ink'>
                    Saved Calculations
                </h1>
                <Link to='/' className='mb-8 inline-block font-body text-sm uppercase tracking-wide text-muted hover:text-ink transition-colors'>
                    ← Back to Calculator
                </Link>

                {error && (
                    <p className='mb-6 border border-line bg-paper px-3 py-2 font-body text-sm text-accent'>
                        {error}
                    </p>
                )}

                {calculations.length === 0 && (
                    <p className='font-body text-muted'>No saved calculations yet.</p>
                )}

                <div className='space-y-4'>
                    {calculations.map((calc) => (
                        <div
                            key={calc.id}
                            className='border border-line bg-paper p-6'
                        >
                            <div className='flex items-center justify-between border-b border-line pb-3'>
                                <span className='font-display text-lg text-ink'>
                                    {calc.label}
                                </span>
                                <button
                                    onClick={() => handleDelete(calc.id)}
                                    className='border-2 border-ink px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper'
                                >
                                    Delete
                                </button>
                            </div>
                            <div className='mt-3 flex items-center justify-between py-1'>
                                <span className='font-body text-sm uppercase tracking-wide text-muted'>
                                    Monthly Payment
                                </span>
                                <span className='font-mono text-lg text-ink'>
                                    ${Number(calc.monthly_payment).toFixed(2)}
                                </span>
                            </div>
                            <div className='flex items-center justify-between border-t-2 border-ink pt-3'>
                                <span className='font-body text-sm font-semibold uppercase tracking-wide text-ink'>
                                    Out-the-Door Total
                                </span>
                                <span className='font-mono text-xl font-bold text-accent'>
                                    ${Number(calc.otd).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SavedCalculationsPage;