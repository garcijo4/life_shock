import { useState } from 'react';
import { UserCircle, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import BudgetBuilder from './components/BudgetBuilder';
import LifeShock from './components/LifeShock';
import SummaryReport from './components/SummaryReport';

// Define initial personas
const personas = [
  {
    id: 1,
    title: 'Entry-Level Marketer',
    netIncome: 3200,
    fixedCosts: { Rent: 1200, CarPayment: 300, Phone: 80, Insurance: 120 },
    wants: { Streaming: 40, DiningOut: 0, Entertainment: 0 },
    savingsGoal: 400
  },
  {
    id: 2,
    title: 'Gig Economy Worker',
    netIncome: 2800,
    fixedCosts: { Rent: 1000, CarMaintenance: 200, Phone: 100, Insurance: 150 },
    wants: { Streaming: 20, DiningOut: 0, Entertainment: 0 },
    savingsGoal: 200
  },
  {
    id: 3,
    title: 'Junior Developer',
    netIncome: 4500,
    fixedCosts: { Rent: 1800, StudentLoan: 400, Phone: 90, Insurance: 160 },
    wants: { Streaming: 60, DiningOut: 0, Entertainment: 0 },
    savingsGoal: 600
  }
];

// Define shocks
const shocks = [
  { id: 1, title: 'Car Breakdown', amount: 400, description: 'Your car needs a new alternator immediately.' },
  { id: 2, title: 'Medical Bill', amount: 350, description: 'Surprise out-of-network charge from a recent checkup.' },
  { id: 3, title: 'Hours Cut', amount: 300, description: 'Your boss cut your hours by 10% this month.' },
];

function App() {
  const [step, setStep] = useState('PERSONA_DRAW'); // PERSONA_DRAW, BUDGET_BUILD, LIFE_SHOCK, REBALANCE, SUMMARY
  const [persona, setPersona] = useState(null);
  const [initialBudget, setInitialBudget] = useState(null);
  const [shock, setShock] = useState(null);
  const [finalBudget, setFinalBudget] = useState(null);
  const [defense, setDefense] = useState({ cut: '', protected: '' });

  const handleDrawPersona = () => {
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];
    setPersona(randomPersona);
    setStep('BUDGET_BUILD');
  };

  const handleBudgetLock = (budgetData) => {
    setInitialBudget(budgetData);
    // Draw a random shock
    const randomShock = shocks[Math.floor(Math.random() * shocks.length)];
    setShock(randomShock);
    setStep('LIFE_SHOCK');
  };

  const handleAcknowledgeShock = () => {
    setStep('REBALANCE');
  };

  const handleRebalanceComplete = (newBudgetData, defenseData) => {
    setFinalBudget(newBudgetData);
    setDefense(defenseData);
    setStep('SUMMARY');
  };

  const handleReset = () => {
    setStep('PERSONA_DRAW');
    setPersona(null);
    setInitialBudget(null);
    setShock(null);
    setFinalBudget(null);
    setDefense({ cut: '', protected: '' });
  };

  return (
    <div className="container">
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet /> Zero-Based Simulator
          </h1>
          <p className="text-secondary">7.1 Persona Budget Build + Life-Shock</p>
        </div>
        {persona && (
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCircle size={20} className="text-accent-primary" />
            <span style={{ fontWeight: 600 }}>{persona.title}</span>
            <span className="text-secondary">| Net: ${persona.netIncome}</span>
          </div>
        )}
      </header>

      <main className="animate-fade-in">
        {step === 'PERSONA_DRAW' && (
          <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '4rem 2rem', textAlign: 'center' }}>
            <UserCircle size={64} className="text-accent-primary" style={{ marginBottom: '1rem' }} />
            <h2>Welcome to the Simulator</h2>
            <p className="text-secondary" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
              In this exercise, you'll practice zero-based budgeting. You'll be assigned a random persona with a specific income and fixed costs. 
              Your job is to allocate every dollar until your balance is exactly zero. But beware... life happens.
            </p>
            <button className="btn btn-primary" onClick={handleDrawPersona}>
              Draw Your Persona
            </button>
          </div>
        )}

        {step === 'BUDGET_BUILD' && (
          <BudgetBuilder 
            persona={persona} 
            onLock={handleBudgetLock} 
          />
        )}

        {step === 'LIFE_SHOCK' && (
          <LifeShock 
            shock={shock} 
            onAcknowledge={handleAcknowledgeShock} 
          />
        )}

        {step === 'REBALANCE' && (
          <BudgetBuilder 
            persona={persona} 
            initialBudget={initialBudget}
            shock={shock}
            isRebalance={true}
            onComplete={handleRebalanceComplete} 
          />
        )}

        {step === 'SUMMARY' && (
          <SummaryReport 
            persona={persona}
            initialBudget={initialBudget}
            shock={shock}
            finalBudget={finalBudget}
            defense={defense}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

export default App;
