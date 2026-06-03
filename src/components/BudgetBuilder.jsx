import { useState, useEffect } from 'react';
import { PieChart, Save, AlertCircle, CreditCard } from 'lucide-react';

export default function BudgetBuilder({ persona, initialBudget, shock, isRebalance, onLock, onComplete }) {
  const [allocations, setAllocations] = useState(() => {
    if (initialBudget) return initialBudget;
    
    // Initialize allocations from persona
    return {
      Needs: {
        Rent: persona.fixedCosts.Rent || 0,
        Transport: persona.fixedCosts.CarPayment || persona.fixedCosts.CarMaintenance || 0,
        Utilities: persona.fixedCosts.Phone || 0,
        Insurance: persona.fixedCosts.Insurance || 0,
        Groceries: 0,
      },
      Wants: {
        Streaming: persona.wants.Streaming || 0,
        DiningOut: persona.wants.DiningOut || 0,
        Entertainment: persona.wants.Entertainment || 0,
        Shopping: 0,
      },
      Savings: {
        EmergencyBuffer: 0,
      },
      Debt: {
        CreditCard: 0,
      }
    };
  });

  const [defense, setDefense] = useState({ cut: '', protected: '' });

  // Calculate totals
  const totalIncome = persona.netIncome;
  let totalExpenses = 0;
  
  Object.keys(allocations).forEach(group => {
    Object.values(allocations[group]).forEach(val => {
      totalExpenses += (Number(val) || 0);
    });
  });

  if (isRebalance && shock) {
    totalExpenses += shock.amount; // The shock is a forced expense
  }

  // If they use the Credit Card line, it actually ADDS to their available funds (it's debt financing)
  // Or, more simply, we treat CreditCard as an expense line that is NEGATIVE? No, that's confusing.
  // Better approach: They have to cover the shock. If they don't have enough cuts, they put the remaining deficit into "Credit Card Balance Used".
  // Actually, standard zero-based budgeting: Income - Expenses = 0.
  // If Expenses > Income, they must either cut expenses, OR allocate the deficit to "Credit Card Debt".
  // Let's say: Total Funds = Income + Credit Card Debt Used. Total Uses = Expenses + Shock.
  const creditCardUsed = Number(allocations.Debt.CreditCard) || 0;
  const totalFunds = totalIncome + creditCardUsed;
  const balance = totalFunds - totalExpenses;

  // 50/30/20 Math (excluding credit card debt from income for the guideline)
  const needsTotal = Object.values(allocations.Needs).reduce((a, b) => a + (Number(b) || 0), 0);
  const wantsTotal = Object.values(allocations.Wants).reduce((a, b) => a + (Number(b) || 0), 0);
  const savingsTotal = Object.values(allocations.Savings).reduce((a, b) => a + (Number(b) || 0), 0);

  const needsPct = Math.round((needsTotal / totalIncome) * 100) || 0;
  const wantsPct = Math.round((wantsTotal / totalIncome) * 100) || 0;
  const savingsPct = Math.round((savingsTotal / totalIncome) * 100) || 0;

  const handleUpdate = (group, category, value) => {
    setAllocations(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [category]: Number(value)
      }
    }));
  };

  const handleFinish = () => {
    if (balance !== 0) return;
    if (isRebalance) {
      if (!defense.cut || !defense.protected) {
        alert("Please write your defense statements before submitting.");
        return;
      }
      onComplete(allocations, defense);
    } else {
      onLock(allocations);
    }
  };

  return (
    <div className="grid-2">
      {/* Left Column: Budget Inputs */}
      <div className="glass-panel">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isRebalance ? <AlertCircle className="text-warning" /> : <PieChart className="text-accent-primary" />}
          {isRebalance ? 'Re-balance Your Budget' : 'Build Your Budget'}
        </h2>
        
        {isRebalance && (
          <div className="glass-panel shock-alert" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)' }}>
            <h3 className="text-danger" style={{ margin: 0 }}>Life Shock: {shock.title} (${shock.amount})</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{shock.description}</p>
            <p style={{ marginTop: '8px', fontWeight: 'bold' }}>You must adjust your categories below to absorb this cost and return your balance to $0.</p>
          </div>
        )}

        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px' }}>
          {Object.keys(allocations).map(group => {
            // Hide Debt section initially unless rebalancing
            if (group === 'Debt' && !isRebalance) return null;

            return (
              <div key={group} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', color: group === 'Debt' ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {group}
                </h3>
                {Object.keys(allocations[group]).map(category => (
                  <div key={category} className="flex-between" style={{ marginTop: '12px' }}>
                    <label style={{ color: 'var(--text-secondary)' }}>{category}</label>
                    <div style={{ position: 'relative', width: '120px' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }}>$</span>
                      <input 
                        type="number" 
                        min="0"
                        value={allocations[group][category]}
                        onChange={(e) => handleUpdate(group, category, e.target.value)}
                        style={{ paddingLeft: '24px', borderColor: group === 'Debt' && allocations[group][category] > 0 ? 'var(--danger)' : '' }}
                      />
                    </div>
                  </div>
                ))}
                {group === 'Debt' && creditCardUsed > 0 && (
                  <p className="text-danger" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                    ⚠️ Warning: Using a credit card converts a one-time shock into long-term debt compounding at ~24% APR!
                  </p>
                )}
              </div>
            );
          })}

          {isRebalance && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Trade-off Defense</h3>
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>What did you cut, and why?</label>
                <textarea 
                  rows="2" 
                  value={defense.cut}
                  onChange={(e) => setDefense({ ...defense, cut: e.target.value })}
                  placeholder="e.g. I cut streaming to free up cash..."
                ></textarea>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>What did you protect no matter what?</label>
                <textarea 
                  rows="2"
                  value={defense.protected}
                  onChange={(e) => setDefense({ ...defense, protected: e.target.value })}
                  placeholder="e.g. I protected my savings buffer because..."
                ></textarea>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Visuals & Balance */}
      <div>
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Zero-Based Balance</p>
            <h1 style={{ 
              fontSize: '3.5rem', 
              color: balance === 0 ? 'var(--success)' : (balance < 0 ? 'var(--danger)' : 'var(--text-primary)'),
              margin: '10px 0'
            }}>
              ${Math.abs(balance).toFixed(2)}
            </h1>
            <p style={{ fontWeight: 600, color: balance === 0 ? 'var(--success)' : (balance < 0 ? 'var(--danger)' : 'var(--warning)') }}>
              {balance === 0 ? 'Perfectly Balanced!' : (balance < 0 ? 'You are over budget!' : 'You have unassigned dollars.')}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span>Total Income</span>
              <span style={{ fontWeight: 'bold' }}>${totalIncome}</span>
            </div>
            {isRebalance && (
              <div className="flex-between text-danger" style={{ marginBottom: '8px' }}>
                <span>Life Shock Cost</span>
                <span style={{ fontWeight: 'bold' }}>-${shock.amount}</span>
              </div>
            )}
             {creditCardUsed > 0 && (
              <div className="flex-between text-warning" style={{ marginBottom: '8px' }}>
                <span>Credit Card Debt Used</span>
                <span style={{ fontWeight: 'bold' }}>+${creditCardUsed}</span>
              </div>
            )}
            <div className="flex-between" style={{ marginBottom: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
              <span>Total Expenses</span>
              <span style={{ fontWeight: 'bold' }}>${totalExpenses - (isRebalance && shock ? shock.amount : 0)}</span>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '12px' }}>50/30/20 Guideline Check</h4>
            
            <div style={{ marginBottom: '12px' }}>
              <div className="flex-between text-secondary" style={{ fontSize: '0.9rem' }}>
                <span>Needs (Target: ~50%)</span>
                <span>{needsPct}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${Math.min(needsPct, 100)}%`, background: needsPct > 60 ? 'var(--warning)' : 'var(--accent-primary)' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div className="flex-between text-secondary" style={{ fontSize: '0.9rem' }}>
                <span>Wants (Target: ~30%)</span>
                <span>{wantsPct}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${Math.min(wantsPct, 100)}%`, background: wantsPct > 40 ? 'var(--warning)' : 'var(--accent-secondary)' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div className="flex-between text-secondary" style={{ fontSize: '0.9rem' }}>
                <span>Savings (Target: ~20%)</span>
                <span>{savingsPct}%</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${Math.min(savingsPct, 100)}%`, background: savingsPct < 10 ? 'var(--danger)' : 'var(--success)' }}></div>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            disabled={balance !== 0}
            onClick={handleFinish}
          >
            {isRebalance ? <><Save /> Submit Revised Budget</> : <><Save /> Lock Budget & Proceed</>}
          </button>
          {balance !== 0 && (
            <p className="text-secondary" style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '12px' }}>
              Your balance must be exactly $0 to proceed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
