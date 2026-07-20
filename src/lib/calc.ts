interface CalcInputs {
    price: number;
    tradeInValue: number;
    tradeInOwed: number;
    docFee: number;
    dmvFees: number;
    taxRate: number;
}

interface AmortizationInputs {
    amountFinanced: number;
    apr: number;
    termMonths: number;
}

interface AmortizationRow {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
}

export function calcOtd(inputs: CalcInputs): number {
    // 1. taxable amount = price - tradeInValue + docFee
    const taxableAmount = inputs.price - inputs.tradeInValue + inputs.docFee;
    // 2. salesTax = taxable amount * taxRate
    const salesTax = taxableAmount * inputs.taxRate;
    // 3. equity = tradeInValue - tradeInOwed
    const equity = inputs.tradeInValue - inputs.tradeInOwed;
    // 4. base OTD = price + salesTax + docFee + dmvFees
    const baseOTD = inputs.price + salesTax + inputs.docFee + inputs.dmvFees;
    // 5. OTD = base OTD - equity  (subtracting equity handles both cases:
    return baseOTD - equity;
}

export function calcMonthlyPayment(inputs: AmortizationInputs): number {
    const monthlyRate = inputs.apr / 12;
    if (inputs.apr === 0 ) {
        return inputs.amountFinanced / inputs.termMonths
    }
    const factor = Math.pow(1 + monthlyRate, inputs.termMonths);
    const monthlyPayment = inputs.amountFinanced * ( monthlyRate * factor ) / ( factor - 1 );
    return Number(monthlyPayment.toFixed(2));
}

export function calcAmortizationSchedule(
    inputs: AmortizationInputs,
    monthlyPayment: number
): AmortizationRow[] {
    const schedule: AmortizationRow[] = [];
    let balance = inputs.amountFinanced;
    const monthlyRate = inputs.apr / 12;

    for (let month = 1; month <= inputs.termMonths; month++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;
        balance = balance - principal;
        schedule.push({ month, payment: monthlyPayment, principal, interest, balance });
    }

    return schedule
}
