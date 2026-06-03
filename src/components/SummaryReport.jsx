import { CheckCircle, Download, RefreshCcw } from 'lucide-react';

export default function SummaryReport({ persona, initialBudget, shock, finalBudget, defense, onReset }) {
  const getCategoryTotal = (budget, group) => {
    return Object.values(budget[group]).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const initialSavings = getCategoryTotal(initialBudget, 'Savings');
  const finalSavings = getCategoryTotal(finalBudget, 'Savings');
  const creditUsed = finalBudget.Debt ? Number(finalBudget.Debt.CreditCard) || 0 : 0;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <CheckCircle size={64} className="text-success" style={{ margin: '0 auto 1rem' }} />
        <h1>Simulation Complete</h1>
        <p className="text-secondary">You survived the stress test. Here is your final report.</p>
      </div>

      <div className="grid-2">
        <div className="glass-panel">
          <h3><span className="text-secondary">Persona:</span> {persona.title}</h3>
          <p>Net Income: ${persona.netIncome}</p>
          <div style={{ margin: '2rem 0', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)' }}>
            <h4 className="text-danger">The Life Shock</h4>
            <p><strong>{shock.title} (${shock.amount})</strong></p>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{shock.description}</p>
          </div>
          
          <h4 style={{ marginBottom: '1rem' }}>Your Defense</h4>
          <div style={{ marginBottom: '1rem' }}>
            <strong className="text-secondary">What you cut:</strong>
            <p style={{ fontStyle: 'italic', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginTop: '4px' }}>"{defense.cut}"</p>
          </div>
          <div>
            <strong className="text-secondary">What you protected:</strong>
            <p style={{ fontStyle: 'italic', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginTop: '4px' }}>"{defense.protected}"</p>
          </div>
        </div>

        <div className="glass-panel">
          <h3>Financial Impact</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Initial Savings</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${initialSavings}</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <span className="text-secondary" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Final Savings</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: finalSavings < initialSavings ? 'var(--warning)' : 'inherit' }}>
                ${finalSavings}
              </div>
            </div>
          </div>

          {creditUsed > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px' }}>
              <h4 className="text-warning">The Debt Trap Triggered</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>You put <strong>${creditUsed}</strong> on a credit card. At 24% APR, if you only make minimum payments, this one-time emergency will cost you significantly more over the next few months.</p>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h4>Category Shifts</h4>
            {['Needs', 'Wants'].map(group => {
              const init = getCategoryTotal(initialBudget, group);
              const fin = getCategoryTotal(finalBudget, group);
              const diff = fin - init;
              return (
                <div key={group} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <span>{group}</span>
                  <span style={{ color: diff < 0 ? 'var(--danger)' : (diff > 0 ? 'var(--warning)' : 'inherit') }}>
                    {diff > 0 ? '+' : ''}{diff === 0 ? '-' : `$${diff}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-center" style={{ gap: '1rem', marginTop: '3rem' }}>
        <button className="btn btn-outline" onClick={() => window.print()}>
          <Download size={18} /> Export / Print
        </button>
        <button className="btn btn-primary" onClick={onReset}>
          <RefreshCcw size={18} /> Start New Simulation
        </button>
      </div>
    </div>
  );
}
