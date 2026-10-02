const categoryColors = {
  Food: '#5b7cff',
  Transportation: '#2ab673',
  Shopping: '#f7b955',
  Entertainment: '#ff6a65',
  Education: '#7f8cff',
  Subscriptions: '#8c6df5',
  Other: '#5ec7b5',
};

const state = {
  period: 'weekly',
  currency: 'AED',
  darkMode: false,
  transactions: [
    { id: 1, type: 'income', amount: 2200, category: 'Education', description: 'Monthly stipend', date: '2026-09-02' },
    { id: 2, type: 'expense', amount: 180, category: 'Food', description: 'Campus lunch', date: '2026-09-04' },
    { id: 3, type: 'expense', amount: 90, category: 'Transportation', description: 'Metro card top-up', date: '2026-09-06' },
    { id: 4, type: 'expense', amount: 140, category: 'Shopping', description: 'School supplies', date: '2026-09-08' },
    { id: 5, type: 'income', amount: 380, category: 'Other', description: 'Freelance design work', date: '2026-09-10' },
    { id: 6, type: 'expense', amount: 65, category: 'Entertainment', description: 'Movie night', date: '2026-09-11' },
    { id: 7, type: 'expense', amount: 28, category: 'Subscriptions', description: 'Streaming service', date: '2026-09-15' },
    { id: 8, type: 'expense', amount: 200, category: 'Education', description: 'Textbook purchase', date: '2026-09-18' },
    { id: 9, type: 'expense', amount: 75, category: 'Food', description: 'Groceries', date: '2026-09-21' },
    { id: 10, type: 'income', amount: 2100, category: 'Other', description: 'Part-time job', date: '2026-09-24' }
  ],
  budgets: {
    weekly: {
      Food: 220,
      Transportation: 120,
      Shopping: 180,
      Entertainment: 150,
      Education: 200,
      Subscriptions: 60,
      Other: 120
    },
    monthly: {
      Food: 900,
      Transportation: 350,
      Shopping: 500,
      Entertainment: 400,
      Education: 600,
      Subscriptions: 180,
      Other: 350
    }
  },
  goals: [
    { id: 1, name: 'New Phone', target: 1500, saved: 900, color: '#5b7cff' },
    { id: 2, name: 'Gaming PC', target: 2800, saved: 1400, color: '#2ab673' },
    { id: 3, name: 'Travel Fund', target: 1200, saved: 650, color: '#f7b955' }
  ]
};

const moneyFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatMoney(amount) {
  return moneyFormatter.format(amount);
}

function getTotalIncome() {
  return state.transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

function getTotalExpenses() {
  return state.transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

function getCurrentBalance() {
  return getTotalIncome() - getTotalExpenses();
}

function getSavings() {
  const income = getTotalIncome();
  const expenses = getTotalExpenses();
  return Math.max(0, income - expenses);
}

function renderOverview() {
  document.getElementById('balanceDisplay').textContent = formatMoney(getCurrentBalance());
  document.getElementById('incomeDisplay').textContent = formatMoney(getTotalIncome());
  document.getElementById('expenseDisplay').textContent = formatMoney(getTotalExpenses());
  document.getElementById('savingsDisplay').textContent = formatMoney(getSavings());
}

function generateTips() {
  const categoryTotals = {};

  for (const tx of state.transactions.filter((t) => t.type === 'expense')) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
  }

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];
  const totalExpenses = getTotalExpenses();

  const tips = [
    `You spent ${((topCategory[1] / totalExpenses) * 100).toFixed(0)}% of your budget on ${topCategory[0].toLowerCase()}. Consider setting a tighter weekly cap.`,
    `Your spending is balanced, but your food costs are 20% higher than last month. Try meal planning on weekends.`,
    `You can save ${formatMoney(Math.max(200, totalExpenses * 0.12))} by reducing entertainment and subscription costs this month.`
  ];

  const tipsContainer = document.getElementById('tipsList');
  tipsContainer.innerHTML = tips
    .map(
      (tip, index) => `
        <div class="tip-item">
          <span class="tip-score">Tip ${index + 1}</span>
          <p>${tip}</p>
        </div>
      `
    )
    .join('');
}

function renderTransactions() {
  const tableBody = document.getElementById('transactionTableBody');
  const search = document.getElementById('searchTransactions').value.toLowerCase();
  const typeFilter = document.getElementById('transactionFilter').value;
  const sortValue = document.getElementById('transactionSort').value;

  let filtered = [...state.transactions].filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search) ||
      tx.category.toLowerCase().includes(search) ||
      tx.type.toLowerCase().includes(search);

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  filtered.sort((a, b) => {
    if (sortValue === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortValue === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortValue === 'amount-desc') return b.amount - a.amount;
    if (sortValue === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No matching transactions found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered
    .map(
      (tx) => `
        <tr>
          <td><span class="type-badge ${tx.type}">${tx.type}</span></td>
          <td>${tx.category}</td>
          <td>${tx.description}</td>
          <td>${new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
          <td class="amount ${tx.type}">${tx.type === 'income' ? '+' : '-'} ${formatMoney(tx.amount)}</td>
        </tr>
      `
    )
    .join('');
}

function renderBudgets() {
  const budgetList = document.getElementById('budgetList');
  const currentBudgets = state.budgets[state.period];
  const totalBudget = Object.values(currentBudgets).reduce((sum, value) => sum + value, 0);
  const totalSpent = state.transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  budgetList.innerHTML = Object.entries(currentBudgets)
    .map(([category, limit]) => {
      const spent = state.transactions
        .filter((tx) => tx.type === 'expense' && tx.category === category)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      const ratio = Math.min((spent / limit) * 100, 100);
      const progressClass = ratio > 80 ? 'danger' : ratio > 60 ? 'warning' : '';

      return `
        <div class="budget-item">
          <div class="budget-top">
            <div class="budget-head">
              <span class="budget-icon">${getCategoryEmoji(category)}</span>
              <h4>${category}</h4>
            </div>
            <strong>${formatMoney(spent)} / ${formatMoney(limit)}</strong>
          </div>

          <div class="budget-meta">
            <span>${Math.round(ratio)}% used</span>
            <span>${formatMoney(Math.max(limit - spent, 0))} left</span>
          </div>

          <div class="progress">
            <div class="progress-bar ${progressClass}" style="width: ${Math.max(ratio, 8)}%"></div>
          </div>

          <div class="budget-edit">
            <input type="number" min="0" data-category="${category}" data-period="${state.period}" value="${limit}" />
            <button class="primary-btn small" data-update-budget="${category}">Update</button>
          </div>
        </div>
      `;
    })
    .join('');

  const budgetSummary = document.createElement('div');
  budgetSummary.className = 'budget-meta';
  budgetSummary.innerHTML = `<span>Total planned</span><strong>${formatMoney(totalBudget)}</strong>`;
  budgetList.appendChild(budgetSummary);

  bindBudgetActions();
}

function getCategoryEmoji(category) {
  const icons = {
    Food: '🍽️',
    Transportation: '🚇',
    Shopping: '🛍️',
    Entertainment: '🎬',
    Education: '📚',
    Subscriptions: '📺',
    Other: '✨'
  };
  return icons[category] || '💡';
}

function renderGoals() {
  const goalGrid = document.getElementById('goalGrid');
  goalGrid.innerHTML = state.goals
    .map((goal) => {
      const percent = Math.min((goal.saved / goal.target) * 100, 100);
      return `
        <article class="goal-card">
          <div class="goal-top">
            <h4>${goal.name}</h4>
            <span class="goal-pill">${Math.round(percent)}%</span>
          </div>

          <div class="goal-balance">${formatMoney(goal.saved)} / ${formatMoney(goal.target)}</div>

          <div class="goal-progress">
            <div class="progress">
              <div class="progress-bar" style="width: ${percent}%"></div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderChart() {
  const chart = document.getElementById('expenseChart');
  const totals = {};

  for (const tx of state.transactions.filter((item) => item.type === 'expense')) {
    totals[tx.category] = (totals[tx.category] || 0) + Number(tx.amount);
  }

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const maxValue = Math.max(...entries.map(([, value]) => value), 1);

  chart.innerHTML = entries
    .map(([category, value]) => {
      const height = (value / maxValue) * 100;
      return `
        <div class="bar-group">
          <div class="bar-value" style="height: ${height}%; background: linear-gradient(180deg, ${categoryColors[category]}, #4d6ef1);"></div>
          <span>${category.slice(0, 3)}</span>
        </div>
      `;
    })
    .join('');

  const list = document.getElementById('categoryInsightList');
  list.innerHTML = entries
    .map(([category, value]) => `
      <li>
        <div class="category-label">
          <span class="category-dot" style="background:${categoryColors[category]}"></span>
          ${category}
        </div>
        <strong>${formatMoney(value)}</strong>
      </li>
    `)
    .join('');
}

function bindBudgetActions() {
  document.querySelectorAll('[data-update-budget]').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.updateBudget;
      const input = document.querySelector(`input[data-category="${category}"][data-period="${state.period}"]`);
      if (!input) return;
      const value = Number(input.value);
      if (!Number.isFinite(value) || value <= 0) return;

      state.budgets[state.period][category] = value;
      renderBudgets();
    });
  });
}

function handleThemeToggle() {
  const isDark = document.body.classList.toggle('dark');
  state.darkMode = isDark;
  document.getElementById('darkModeToggle').checked = isDark;
}

function bindNavigation() {
  document.querySelectorAll('.nav-item, .mobile-item').forEach((item) => {
    item.addEventListener('click', () => {
      const selected = item.dataset.section;
      document.querySelectorAll('.section').forEach((section) => section.classList.toggle('active', section.id === selected));
      document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.toggle('active', navItem.dataset.section === selected));
      document.querySelectorAll('.mobile-item').forEach((navItem) => navItem.classList.toggle('active', navItem.dataset.section === selected));
    });
  });

  document.querySelectorAll('.segment').forEach((segment) => {
    segment.addEventListener('click', () => {
      state.period = segment.dataset.period;
      document.querySelectorAll('.segment').forEach((item) => item.classList.toggle('active', item.dataset.period === state.period));
      renderBudgets();
    });
  });
}

function bindForm() {
  document.getElementById('transactionForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const record = {
      id: Date.now(),
      type: form.get('type'),
      amount: Number(form.get('amount')),
      category: form.get('category'),
      description: String(form.get('description')).trim(),
      date: form.get('date') || new Date().toISOString().slice(0, 10)
    };

    if (!record.description || !record.amount || record.amount <= 0) return;

    state.transactions.unshift(record);
    event.currentTarget.reset();
    document.getElementById('transactionDate').value = new Date().toISOString().slice(0, 10);
    renderAll();
  });

  document.getElementById('searchTransactions').addEventListener('input', renderTransactions);
  document.getElementById('transactionFilter').addEventListener('change', renderTransactions);
  document.getElementById('transactionSort').addEventListener('change', renderTransactions);

  document.getElementById('currencySelect').addEventListener('change', (event) => {
    state.currency = event.target.value;
    document.querySelector('.currency-pill').textContent = state.currency;
    renderAll();
  });

  document.getElementById('darkModeToggle').addEventListener('change', (event) => {
    document.body.classList.toggle('dark', event.target.checked);
    state.darkMode = event.target.checked;
  });

  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const checked = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', checked);
    document.getElementById('darkModeToggle').checked = checked;
    state.darkMode = checked;
  });

  document.getElementById('addGoalButton').addEventListener('click', () => {
    const name = window.prompt('Goal name', 'Study Abroad');
    const target = Number(window.prompt('Target amount in AED', '5000'));
    if (!name || !Number.isFinite(target) || target <= 0) return;

    state.goals.push({
      id: Date.now(),
      name,
      target,
      saved: 0,
      color: '#5b7cff'
    });

    renderGoals();
  });

  document.getElementById('quickAddIncome').addEventListener('click', () => {
    document.getElementById('transactionType').value = 'income';
    document.querySelector('[data-section="dashboard"]').click();
    document.getElementById('transactionAmount').focus();
  });

  document.getElementById('quickAddExpense').addEventListener('click', () => {
    document.getElementById('transactionType').value = 'expense';
    document.querySelector('[data-section="dashboard"]').click();
    document.getElementById('transactionAmount').focus();
  });
}

function renderAll() {
  renderOverview();
  generateTips();
  renderTransactions();
  renderBudgets();
  renderGoals();
  renderChart();
}

function init() {
  document.body.classList.toggle('dark', state.darkMode);
  document.getElementById('darkModeToggle').checked = state.darkMode;
  document.getElementById('transactionDate').value = new Date().toISOString().slice(0, 10);
  document.querySelector('.currency-pill').textContent = state.currency;

  bindNavigation();
  bindForm();
  renderAll();
}

init();
