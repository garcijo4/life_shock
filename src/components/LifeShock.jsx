import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function LifeShock({ shock, onAcknowledge }) {
  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '60vh' }}>
      <div className="glass-panel shock-alert" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(239, 68, 68, 0.2)', padding: '24px', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <AlertTriangle size={64} className="text-danger" />
        </div>
        
        <h1 className="text-danger" style={{ fontSize: '3rem', marginBottom: '1rem', background: 'none', WebkitTextFillColor: 'var(--danger)' }}>
          LIFE SHOCK
        </h1>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h2 style={{ marginBottom: '12px' }}>{shock.title}</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{shock.description}</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>
            Cost: ${shock.amount}
          </div>
        </div>

        <p className="text-secondary" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Your budget is now deeply in the red. You must re-balance to zero.
        </p>

        <button className="btn btn-danger" onClick={onAcknowledge} style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
          Face Reality <ArrowRight />
        </button>
      </div>
    </div>
  );
}
