export function calculateSchedule(principal, interestRate, monthlyPayment, startDateStr, extraPayments = []) {
    let remaining = principal;
    const ratePerMonth = interestRate / 100 / 12;
    const schedule = [];
    let currentDate = new Date(startDateStr);
    let idCounter = 1;

    // Sort extra payments by date
    const sortedExtras = [...extraPayments].sort((a, b) => new Date(a.date) - new Date(b.date));
    let extraIndex = 0;

    // Safety break to prevent infinite loops in bad configs (though we validate in UI)
    let safety = 0;

    while (remaining > 0.01 && safety < 1200) { // Max 100 years
        // 1. Check for extra payments in this month/before next payment
        // Simple approach: Apply extra payments that happen "before" this month's due date 
        // OR just mix them in. 
        // Let's assume repayment date is always the same day of month.

        // Actually, simply iterate months.
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Calculate Interest for this period
        const interest = remaining * ratePerMonth;
        let principalPayment = monthlyPayment - interest;

        // Handle last payment
        if (principalPayment > remaining) {
            principalPayment = remaining;
        }

        // Check if we hit 0 or negative (overpaid) - logic handled by loop condition mainly

        remaining -= principalPayment;

        schedule.push({
            id: `m-${year}-${month}`,
            date: new Date(currentDate), // clone
            type: 'regular',
            payment: principalPayment + interest,
            interestPart: interest,
            principalPart: principalPayment,
            remaining: Math.max(0, remaining),
            year,
            month
        });

        // Check for extra payments that fall in this month
        // We match extra payments by Month/Year roughly or just by date order
        // Let's say extra payments happen 'after' the regular payment for simplicity of calculation order
        // or 'at any time'.
        // For the schedule list, we just need to ensure the math is right.
        // Let's process extra payments that are effectively in this month.

        while (extraIndex < sortedExtras.length) {
            const extra = sortedExtras[extraIndex];
            const eDate = new Date(extra.date);
            if (eDate <= currentDate || (eDate.getFullYear() === year && eDate.getMonth() === month)) {
                // Apply extra
                // Extra payment goes 100% to principal usually (assumed)
                let eAmount = extra.amount;
                if (eAmount > remaining) eAmount = remaining;

                remaining -= eAmount;

                // Inject into schedule
                schedule.push({
                    id: extra.id,
                    date: eDate,
                    type: 'extra',
                    payment: eAmount,
                    interestPart: 0,
                    principalPart: eAmount,
                    remaining: Math.max(0, remaining),
                    year: eDate.getFullYear(),
                    month: eDate.getMonth()
                });

                extraIndex++;
                if (remaining < 0.01) break;
            } else {
                break;
            }
        }

        // Next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        safety++;
    }

    return schedule;
}

export function getStats(initialPrincipal, schedule, checkedIds) {
    // Calculate total paid based on Checked Regular + All Extra (assuming extras are 'real')
    // Wait, schedule contains future extras too if they are in the list.
    // The user 'enters' extra payments, so they are likely done or planned.
    // Let's assume all 'extra' items in schedule are considered 'done' for calculation 
    // IF the date is passed or they are explicitly added. 
    // Requirement: "Sonderzahlungen eintragen".

    let paidPrincipal = 0;

    schedule.forEach(item => {
        if (item.type === 'regular') {
            if (checkedIds.includes(item.id)) {
                paidPrincipal += item.principalPart;
            }
        } else if (item.type === 'extra') {
            // Assume extra payments entered are valid/paid
            paidPrincipal += item.principalPart;
        }
    });

    // Cap at initial principal to avoid >100%
    if (paidPrincipal > initialPrincipal) paidPrincipal = initialPrincipal;

    const progress = (paidPrincipal / initialPrincipal) * 100;

    const lastItem = schedule[schedule.length - 1];
    const endDate = lastItem ? lastItem.date : new Date();

    return {
        paidPrincipal,
        remainingPrincipal: initialPrincipal - paidPrincipal,
        progress,
        endDate
    };
}

export function getYearlyUtilization(year, extraPayments, initialPrincipal) {
    const max = initialPrincipal * 0.05;
    const paidInYear = extraPayments
        .filter(p => new Date(p.date).getFullYear() === year)
        .reduce((sum, p) => sum + p.amount, 0);

    return {
        year,
        paid: paidInYear,
        max,
        percentage: Math.min(100, (paidInYear / max) * 100),
        isMaxed: paidInYear >= max
    };
}
