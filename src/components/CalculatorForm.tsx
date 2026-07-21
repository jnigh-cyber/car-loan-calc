import { useState } from 'react'
import { calcOtd, calcMonthlyPayment, calcAmortizationSchedule, type AmortizationInputs, type CalcInputs, type AmortizationRow } from '../lib/calc'


function CalculateForm() {
    const [ price, setPrice ] = useState<number>(0);
    const [ tradeInValue, setTradeInValue ] = useState<number>(0);
    const [ tradeInOwed, setTradeInOwed ] = useState<number>(0);
    const [ docFee, setDocFee ] = useState<number>(0);
    const [ dmvFees, setDmvFees ] = useState<number>(0);
    const [ taxRate, setTaxRate ] = useState<number>(0);
    const [ apr, setApr ] = useState<number>(0);
    const [ termMonths, setTermMonths ] = useState<number>(0);
    const [ downPayment, setDownPayment ] = useState<number>(0);
    const [ otd, setOtd ] = useState<number>(0);
    const [ monthlyPayment, setMonthlyPayment ] = useState<number>(0);
    const [ schedule, setSchedule ] = useState<AmortizationRow[]>([]);
    const [ showResults, setShowResults ] = useState<boolean>(false);


    function handleCalculate(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const otdInputs: CalcInputs = {
            price,
            tradeInValue,
            tradeInOwed,
            docFee,
            dmvFees,
            taxRate: taxRate / 100,
        };

        const calculatedOtd = calcOtd(otdInputs);
        const amountFinanced = calculatedOtd - downPayment;
        const amortizationInputs: AmortizationInputs = { amountFinanced, apr: apr / 100, termMonths};
        const calculatedPayment = calcMonthlyPayment(amortizationInputs);
        const calculateSchedule = calcAmortizationSchedule(amortizationInputs, calculatedPayment);

        setOtd(calculatedOtd);
        setMonthlyPayment(calculatedPayment);
        setSchedule(calculateSchedule);
        setShowResults(true);
        
    }
    

    return (
        <div className='flex min-h-screen items-center justify-center bg-paper p-8'>
            <div className='w-full max-w-2xl'>
                <form onSubmit={handleCalculate} className='max-w-2xl space-y-6'>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                        <div className='max-w-md space-y-1'>
                            <label className='block text-xs font-semibold uppercase tracking-wide text-muted font-body'>
                                Vehicle Sales Price: 
                            </label>
                            <input 
                                type="number" 
                                value={price}
                                placeholder='Vehicle Sales Price'
                                onChange={(e) => setPrice(Number(e.target.value))} 
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
                                onChange={(e) => setTradeInValue(Number(e.target.value))} 
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
                                onChange={(e) => setTradeInOwed(Number(e.target.value))} 
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
                                onChange={(e) => setDocFee(Number(e.target.value))} 
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
                                onChange={(e) => setDmvFees(Number(e.target.value))} 
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
                                onChange={(e) => setTaxRate(Number(e.target.value))} 
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
                                onChange={(e) => setApr(Number(e.target.value))}
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
                                onChange={(e) => setTermMonths(Number(e.target.value))}
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
                                onChange={(e) => setDownPayment(Number(e.target.value))}
                                className='w-full border-b-2 border-line bg-transparent py-2 font-mono text-lg text-ink outline-none focus:border-accent transition-colors'
                            />
                        </div>
                        <button className='mt-2 border-2 border-ink px-6 py-2 font-body text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper'>
                            Calculate
                        </button>
                    </div>
                </form>
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
            </div>
        </div>
    )
}

export default CalculateForm