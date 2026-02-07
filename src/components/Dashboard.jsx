import React, { useState, useMemo, useEffect, useRef } from 'react';
import { calculateSchedule, getStats, getYearlyUtilization } from '../utils/finance';
import { CheckCircle, Circle, Plus, Calendar, TrendingUp, Award, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

const GermanDate = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
const Currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export default function Dashboard({ profile }) {
    const [checkedIds, setCheckedIds] = useState([]);
    const [extraPayments, setExtraPayments] = useState([]);
    const [showExtraModal, setShowExtraModal] = useState(false);
    const [extraAmount, setExtraAmount] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial data
    useEffect(() => {
        async function load() {
            const data = await api.loadData();
            if (data) {
                if (data.checkedIds) setCheckedIds(data.checkedIds);
                if (data.extraPayments) setExtraPayments(data.extraPayments);
            }
            setIsLoaded(true);
        }
        load();
    }, []);

    // Save changes
    // Debounce or save on every change? 
    // To ensure consistency with the profile which is also in the same file, we should merge.
    // Ideally we'd use a robust state manager, but for MVP:

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            if (isLoaded) isFirstRun.current = false;
            return;
        }

        // Save functionality
        async function save() {
            // We need to preserve the profile!
            // This is slightly racy if App writes profile at same time, but App only writes on Setup.
            const currentData = await api.loadData() || {};
            await api.saveData({
                ...currentData,
                checkedIds,
                extraPayments
            });
        }
        save();
    }, [checkedIds, extraPayments]);

    const schedule = useMemo(() => {
        return calculateSchedule(
            profile.principal,
            profile.interestRate,
            profile.monthlyPayment,
            profile.startDate,
            extraPayments
        );
    }, [profile, extraPayments]);

    const stats = useMemo(() => {
        return getStats(profile.principal, schedule, checkedIds);
    }, [profile, schedule, checkedIds]);

    const currentYear = new Date().getFullYear();
    const yearlyUtilization = useMemo(() => {
        return getYearlyUtilization(currentYear, extraPayments, profile.principal);
    }, [currentYear, extraPayments, profile]);

    const toggleCheck = (id) => {
        setCheckedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            } else {
                confetti({
                    particleCount: 150,
                    spread: 60,
                    origin: { y: 0.6 }
                });
                return [...prev, id];
            }
        });
    };

    const handleAddExtra = (e) => {
        e.preventDefault();
        if (!extraAmount || parseFloat(extraAmount) <= 0) return;

        const newPayment = {
            id: `extra-${Date.now()}`,
            date: new Date().toISOString(), // Today
            amount: parseFloat(extraAmount)
        };

        setExtraPayments(prev => [...prev, newPayment]);
        setExtraAmount('');
        setShowExtraModal(false);
    };

    // Gamification: Milestones
    const nextMilestone = Math.ceil((stats.progress + 0.1) / 10) * 10;

    const [showArchive, setShowArchive] = useState(false);

    // Split schedule into Archive (past months) and Active (current + future)
    const { archive, active } = useMemo(() => {
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const archive = [];
        const active = [];

        schedule.forEach(item => {
            if (item.date < firstDayCurrentMonth) {
                archive.push(item);
            } else {
                active.push(item);
            }
        });

        return { archive, active };
    }, [schedule]);

    const renderPaymentItem = (item) => {
        const isChecked = checkedIds.includes(item.id);
        const isExtra = item.type === 'extra';

        return (
            <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                background: isExtra ? 'rgba(168, 85, 247, 0.05)' : 'var(--bg-card)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                opacity: isChecked ? 0.6 : 1,
                borderLeft: isExtra ? '4px solid #a855f7' : '4px solid transparent',
                transition: 'all 0.2s'
            }}>
                <button
                    onClick={() => item.type === 'regular' && toggleCheck(item.id)}
                    disabled={item.type === 'extra'}
                    style={{ background: 'none', marginRight: '1rem', color: isChecked || item.type === 'extra' ? '#10b981' : 'var(--text-muted)' }}
                >
                    {isChecked || item.type === 'extra' ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>

                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {GermanDate.format(item.date)}
                        {isExtra && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', background: '#a855f7', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Sondertilgung</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Tilgung: {Currency.format(item.principalPart)} | Zinsen: {Currency.format(item.interestPart)}
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: isExtra ? '#a855f7' : 'var(--text-primary)' }}>
                        {Currency.format(item.payment)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Rest: {Currency.format(item.remaining)}
                    </div>
                </div>
            </div>
        );
    };

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '2rem' }}>Lade Dashboard...</div>;

    return (
        <div style={{ paddingBottom: '4rem' }}>

            {/* Header Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Main Progress Card */}
                <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fortschritt</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.progress.toFixed(1)}%</span>
                        <span style={{ color: 'var(--text-secondary)' }}>abbezahlt</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-card-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${stats.progress}%`, height: '100%', background: 'var(--success-gradient)', transition: 'width 1s ease' }}></div>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Nächster Meilenstein: <strong style={{ color: '#fff' }}>{nextMilestone}%</strong>
                    </p>
                </div>

                {/* Restschuld & Enddatum */}
                <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Restschuld</h3>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>{Currency.format(stats.remainingPrincipal)}</div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="#a855f7" />
                        <span style={{ fontSize: '1.1rem' }}>Frei am: <strong style={{ color: '#a855f7' }}>{GermanDate.format(stats.endDate)}</strong></span>
                    </div>
                </div>

                {/* Yearly Challenge */}
                <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                        <Award size={64} />
                    </div>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Sondertilgung {currentYear}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Currency.format(yearlyUtilization.paid)}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / {Currency.format(yearlyUtilization.max)}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-card-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${yearlyUtilization.percentage}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 1s ease' }}></div>
                    </div>
                    <button
                        onClick={() => setShowExtraModal(true)}
                        style={{
                            marginTop: '1.5rem',
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(168, 85, 247, 0.1)',
                            color: '#a855f7',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                        <Plus size={18} /> Sonderzahlung
                    </button>
                </div>
            </div>

            {/* Payment List */}
            <h3 style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>Zahlungsplan</h3>

            {/* Archive Section */}
            {archive.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setShowArchive(!showArchive)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-muted)',
                            background: 'none',
                            fontSize: '0.9rem',
                            padding: '0.5rem',
                            width: '100%',
                            justifyContent: 'center'
                        }}
                    >
                        {showArchive ? 'Archiv verbergen' : `Vergangene Zahlungen (${archive.length}) anzeigen`}
                        {showArchive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showArchive && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', opacity: 0.7 }}>
                            {archive.map(renderPaymentItem)}
                            <div style={{ textAlign: 'center', margin: '1rem 0', height: '1px', background: 'var(--bg-card-hover)' }}></div>
                        </div>
                    )}
                </div>
            )}

            {/* Active List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {active.map(renderPaymentItem)}
            </div>

            {/* Extra Payment Modal */}
            {showExtraModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 100,
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setShowExtraModal(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card)',
                            padding: '2rem',
                            borderRadius: 'var(--radius-lg)',
                            width: '90%',
                            maxWidth: '400px'
                        }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Sonderzahlung eintragen</h3>

                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Betrag (€)</label>
                        <input
                            autoFocus
                            type="number"
                            value={extraAmount}
                            onChange={e => setExtraAmount(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--bg-card-hover)',
                                backgroundColor: 'var(--bg-app)',
                                color: 'white',
                                fontSize: '1.2rem',
                                marginBottom: '1.5rem',
                                outline: 'none'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowExtraModal(false)}
                                style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
                            >Abbrechen</button>
                            <button
                                onClick={handleAddExtra}
                                style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', color: 'white', fontWeight: '600' }}
                            >Hinzufügen</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
