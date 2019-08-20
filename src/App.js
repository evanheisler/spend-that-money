import React, {useState, useEffect } from 'react';
import './App.css';

const formatValue = number => Number.isInteger(number) && `$${(number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

// https://usehooks.com/useLocalStorage/
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

function App() {
  const [cash, setCash] = useLocalStorage('cash', 0);
  const [cashAvailable, setCashAvailable] = useState(0);
  const [monthlySavings, setMonthlySavings] = useLocalStorage('monthlySavings', 2000);
  const [spendItForm, setSpendItForm] = useState({ item: '', invested: 0 });
  const [expenses, setExpenses] = useLocalStorage('expenses', []);

  const handleSpendIt = event => {
    event.preventDefault();
    setExpenses([...expenses, spendItForm]);
  }

  const handleGetExpense = (event, node) => {
    const { target: { value, name } } = event;
    return expenses.map(expense => {
    if (expense.item === node.item) {
      return {
        ...expense,
        [name]: value
      }
    }
    return expense;
  })}

  const handleExpenses = (event, node) => {
    setExpenses(handleGetExpense(event, node));
  }

  const setBreakEven = () => {
    let months = cashAvailable / monthlySavings;
    if (months >= 0 || isNaN(months) || months === Infinity) {
      return `You're good`;
    }
    return `about ${Math.round(Math.abs(cashAvailable / monthlySavings))} months`;
  }

  useEffect(() => {
    let currentCash = cash;
    expenses.forEach(expense => { currentCash = currentCash - expense.invested });
    setCashAvailable(currentCash);
  }, [cash, expenses])

  return (
    <div className="App">

      <div className="row cash-info">
        <div className="column result">
          <h6>Break even in:</h6>
          <h1>{setBreakEven()}</h1>
        </div>
      </div>

      <div className="row cash-info">
        <div className="column">
          <form>
            <fieldset>
            <legend>Starting Budget</legend>
            <input type="number" value={cash} onChange={e => setCash(e.target.value)} />
            </fieldset>
          </form>
        </div>
        <div className="column">
          <form>
            <fieldset>
            <legend>Monthly Savings</legend>
            <input type="number" value={monthlySavings} onChange={e => setMonthlySavings(e.target.value)} />
            </fieldset>
          </form>
        </div>
      </div>

      <form onSubmit={handleSpendIt}>
        <fieldset>
          <legend>Ways to Spend that money</legend>
          <div className="row">
            <div className="column"><input type="text" placeholder="Item" value={spendItForm.item} onChange={e => setSpendItForm({...spendItForm, item: e.target.value})} /></div>
            <div className="column"><input type="number" placeholder="Invested" value={spendItForm.invested} onChange={e => setSpendItForm({...spendItForm, invested: parseInt(e.target.value)})} /></div>
            <div className="column"><button type="submit"><span role="img" aria-label="emoji">💸</span>SPEND IT <span role="img" aria-label="emoji">💸</span></button></div>
          </div>
        </fieldset>
      </form>
      <div className="row">
        {expenses.map(expense =>
          <div className="column" key={expense.item}>
            <div className="card">
              <h3>{expense.item}</h3>
              <input type="number" name="invested" onChange={e => handleExpenses(e, expense)} value={expense.invested} />
            </div>
          </div>
        )}
      </div>

      <div className="row cash-info">
        <div className="column">
          <h6>Balance:</h6>
          <h1>{formatValue(cashAvailable)}</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
