import React, { useState } from 'react';
import { Shield, ChevronRight, AlertCircle } from 'lucide-react';

export default function LoanSetup({ onSave }) {
    const [formData, setFormData] = useState({
        principal: 10000,
        interestRate: 5.0,
        monthlyPayment: 200,
        startDate: new Date().toISOString().slice(0, 10)
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || value
        }));
        setError('');
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, startDate: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { principal, interestRate, monthlyPayment } = formData;

        // Validation
        if (principal <= 0) return setError("Kredithöhe muss positiv sein.");

        const monthlyInterest = principal * (interestRate / 100 / 12);
        if (monthlyPayment <= monthlyInterest) {
            return setError(`Rate zu niedrig! Mindestens ${monthlyInterest.toFixed(2)}€ nötig um Zinsen zu decken.`);
        }

        onSave({
            ...formData,
            principal: parseFloat(principal),
            interestRate: parseFloat(interestRate),
            monthlyPayment: parseFloat(monthlyPayment)
        });
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-glow)',
                maxWidth: '480px',
                width: '100%',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        borderRadius: '50%',
                        background: 'var(--bg-card-hover)',
                        marginBottom: '1rem',
                        color: '#a855f7'
                    }}>
                        <Shield size={48} />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Credit Quest</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Starte deine Reise zur Schuldenfreiheit.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Kredithöhe (€)</label>
                        <input
                            type="number"
                            name="principal"
                            value={formData.principal}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--bg-card-hover)',
                                backgroundColor: 'var(--bg-app)',
                                color: 'white',
                                fontSize: '1.1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Zins (% p.a.)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="interestRate"
                                value={formData.interestRate}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--bg-card-hover)',
                                    backgroundColor: 'var(--bg-app)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rate (€/Monat)</label>
                            <input
                                type="number"
                                name="monthlyPayment"
                                value={formData.monthlyPayment}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--bg-card-hover)',
                                    backgroundColor: 'var(--bg-app)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Startdatum</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleDateChange}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--bg-card-hover)',
                                backgroundColor: 'var(--bg-app)',
                                color: 'white',
                                fontSize: '1.1rem',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#f87171',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '1rem',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Quest Starten <ChevronRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
