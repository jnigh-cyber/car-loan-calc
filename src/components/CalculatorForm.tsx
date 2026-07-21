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
        setSchedule(calculateSchedule)
        
    }
    

    return (
        <div>
            <form onSubmit={handleCalculate}>
                <input 
                    type="number" 
                    value={price}
                    placeholder='Vehicle Sales Price'
                    onChange={(e) => setPrice(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={tradeInValue}
                    placeholder='Trade-in Value'
                    onChange={(e) => setTradeInValue(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={tradeInOwed}
                    placeholder='Trade-in Amount Owed'
                    onChange={(e) => setTradeInOwed(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={docFee}
                    placeholder='DOC Fee'
                    onChange={(e) => setDocFee(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={dmvFees}
                    placeholder='DMV Fees'
                    onChange={(e) => setDmvFees(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={taxRate}
                    placeholder='Sales Tax Rate'
                    onChange={(e) => setTaxRate(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={apr}
                    placeholder='Annual Percentage Rate'
                    onChange={(e) => setApr(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={termMonths}
                    placeholder='Months to Finance'
                    onChange={(e) => setTermMonths(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    value={downPayment}
                    placeholder='Down payment'
                    onChange={(e) => setDownPayment(Number(e.target.value))} 
                />
                
                <button>
                    Submit
                </button>
            </form>
            <section>
                <span>{otd}, {monthlyPayment}</span>
            </section>
        </div>
    )
}

export default CalculateForm