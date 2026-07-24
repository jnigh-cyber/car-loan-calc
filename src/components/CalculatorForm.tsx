import { useState } from 'react'
import { calcOtd, calcMonthlyPayment, calcAmortizationSchedule, type AmortizationInputs, type LoanInputs, type AmortizationRow } from '../lib/calc'
import { API_URL } from '../lib/config';

function toNumber(value: string): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}
 

function CalculateForm() {
    const [ price, setPrice ] = useState<string>('');
    const [ tradeInValue, setTradeInValue ] = useState<string>('');
    const [ tradeInOwed, setTradeInOwed ] = useState<string>('');
    const [ docFee, setDocFee ] = useState<string>('');
    const [ dmvFees, setDmvFees ] = useState<string>('');
    const [ taxRate, setTaxRate ] = useState<string>('');
    const [ apr, setApr ] = useState<string>('');
    const [ termMonths, setTermMonths ] = useState<string>('');
    const [ downPayment, setDownPayment ] = useState<string>('');
    const [ otd, setOtd ] = useState<number>(0);
    const [ monthlyPayment, setMonthlyPayment ] = useState<number>(0);
    const [ schedule, setSchedule ] = useState<AmortizationRow[]>([]);
    const [ showResults, setShowResults ] = useState<boolean>(false);
    const [ label, setLabel ] = useState<string>('');
    const [ saveError, setSaveError ] = useState<string>('');


    async function handleCalculate(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaveError('');
    
        // Percent at the input boundary, fraction everywhere past it.
        const inputs: LoanInputs = {
            price: toNumber(price),
            tradeInValue: toNumber(tradeInValue),
            tradeInOwed: toNumber(tradeInOwed),
            docFee: toNumber(docFee),
            dmvFees: toNumber(dmvFees),
            taxRate: toNumber(taxRate) / 100,
            apr: toNumber(apr) / 100,
            termMonths: toNumber(termMonths),
            downPayment: toNumber(downPayment),
        };
    
        const calculatedOtd = calcOtd(inputs);
        const amountFinanced = calculatedOtd - inputs.downPayment;
        const amortizationInputs: AmortizationInputs = {
            amountFinanced,
            apr: inputs.apr,
            termMonths: inputs.termMonths,
        };
        const calculatedPayment = calcMonthlyPayment(amortizationInputs);
        const calculatedSchedule = calcAmortizationSchedule(amortizationInputs, calculatedPayment);
    
        setOtd(calculatedOtd);
        setMonthlyPayment(calculatedPayment);
        setSchedule(calculatedSchedule);
        setShowResults(true);
    
        // Don't persist junk rows.
        if (inputs.price <= 0 || inputs.termMonths <= 0) return;
    
        try {
            const response = await fetch(`${API_URL}/api/calculations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...inputs,
                    label: label.trim() || `Calculation — ${new Date().toLocaleDateString()}`,
                    otd: calculatedOtd,
                    monthlyPayment: calculatedPayment,
                }),
            });
    
            if (!response.ok) {
                setSaveError('Failed to save calculation.');
            }
        } catch (err) {
            console.error(err);
            setSaveError('Could not reach the server — calculation not saved.');
        }
    }
    

    return (
        <div className='flex min-h-screen items-center justify-center bg-paper p-8'>
            <div className='w-full max-w-2xl'>
                <form onSubmit={handleCalculate} className='max-w-2xl space-y-6'>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                    <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Name for saved Calculation.
                            </label>
                            <input 
                                type="text" 
                                value={label}
                                placeholder='Name'
                                onChange={(e) => setLabel(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Vehicle Sales Price: 
                            </label>
                            <input 
                                type="number" 
                                value={price}
                                placeholder='Vehicle Sales Price'
                                onChange={(e) => setPrice(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Trade-in Value: 
                            </label>
                            <input 
                                type="number" 
                                value={tradeInValue}
                                placeholder='Trade-in Value'
                                onChange={(e) => setTradeInValue(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Amount Owed on Trade-in: 
                            </label>
                            <input 
                                type="number" 
                                value={tradeInOwed}
                                placeholder='Trade-in Amount Owed'
                                onChange={(e) => setTradeInOwed(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                DOC Fee: 
                            </label>
                            <input 
                                type="number" 
                                value={docFee}
                                placeholder='DOC Fee'
                                onChange={(e) => setDocFee(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                DMV Fees: 
                            </label>
                            <input 
                                type="number" 
                                value={dmvFees}
                                placeholder='DMV Fees'
                                onChange={(e) => setDmvFees(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Sales Tax Rate: 
                            </label>
                            <input 
                                type="number" 
                                value={taxRate}
                                placeholder='Sales Tax Rate'
                                onChange={(e) => setTaxRate(String(e.target.value))} 
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                APR: 
                            </label>
                            <input 
                                type="number" 
                                value={apr}
                                placeholder='Annual Percentage Rate'
                                onChange={(e) => setApr(String(e.target.value))}
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors' 
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Length of Term: 
                            </label>
                            <input 
                                type="number" 
                                value={termMonths}
                                placeholder='Months to Finance'
                                onChange={(e) => setTermMonths(String(e.target.value))}
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Down Payment: 
                            </label>
                            <input 
                                type="number" 
                                value={downPayment}
                                placeholder='Down payment'
                                onChange={(e) => setDownPayment(String(e.target.value))}
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <button className='mt-2 border-2 border-ink px-6 py-2 font-body text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper'>
                            Calculate
                        </button>
                    </div>
                </form>
                {saveError && (
                    <section>
                        <p>{saveError}</p>
                    </section>
                )}
                {showResults && (
                    <section className="mt-8 max-w-2xl border border-line bg-paper p-6">
                        <div className="flex items-center justify-between border-b border-line py-3">
                            <span className="font-body text-sm uppercase tracking-wide text-muted">
                                Monthly Payment
                            </span>
                            <span className="font-mono text-lg text-ink">${monthlyPayment.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t-2 border-ink py-4">
                            <span className="font-body text-sm font-semibold uppercase tracking-wide text-ink">
                                Out-the-Door Total
                            </span>
                            <span className="font-mono text-2xl font-bold text-accent">${otd.toFixed(2)}</span>
                        </div>
                    </section>
                )}
                {showResults && (
                    <div className="mt-6 max-h-96 overflow-y-auto border border-line">
                        <table className="w-full font-mono text-sm">
                        <thead className="sticky top-0 bg-paper">
                            <tr className="border-b-2 border-ink text-xs uppercase tracking-wide text-muted">
                            <th className="px-3 py-2 text-left font-body font-semibold">Month</th>
                            <th className="px-3 py-2 text-right font-body font-semibold">Payment</th>
                            <th className="px-3 py-2 text-right font-body font-semibold">Principal</th>
                            <th className="px-3 py-2 text-right font-body font-semibold">Interest</th>
                            <th className="px-3 py-2 text-right font-body font-semibold">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((row) => (
                            <tr key={row.month} className="border-b border-line text-ink">
                                <td className="px-3 py-1.5">{row.month}</td>
                                <td className="px-3 py-1.5 text-right">${row.payment.toFixed(2)}</td>
                                <td className="px-3 py-1.5 text-right">${row.principal.toFixed(2)}</td>
                                <td className="px-3 py-1.5 text-right">${row.interest.toFixed(2)}</td>
                                <td className="px-3 py-1.5 text-right">${row.balance.toFixed(2)}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CalculateForm