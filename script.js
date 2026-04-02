// Complete Money Manager App JavaScript - OOP Implementation

// Transaction Class - Represents individual transaction
class Transaction {
    constructor(id, amount, date, category, subCategory, description = '') {
        this.id = id;
        this.amount = parseFloat(amount);
        this.date = date;
        this.category = category;
        this.subCategory = subCategory;
        this.description = description;
        this.createdAt = new Date().toISOString();
    }

    // Convert transaction to display format
    toDisplayFormat() {
        return {
            id: this.id,
            amount: this.amount.toFixed(2),
            date: this.date,
            category: this.category,
            subCategory: this.subCategory,
            description: this.description || '-'
        };
    }

    // Validate transaction data
    static validate(data) {
        const errors = {};

        // Amount validation
        if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
            errors.amount = 'Amount must be a positive number';
        }

        // Date validation
        if (!data.date) {
            errors.date = 'Date is required';
        } else {
            const selectedDate = new Date(data.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            if (selectedDate > today) {
                errors.date = 'Date cannot be in the future';
            }
        }

        // Category validation
        if (!data.category) {
            errors.category = 'Category is required';
        }

        // Sub-category validation
        if (!data.subCategory) {
            errors.subCategory = 'Sub-category is required';
        }

        // Description validation (optional but max 100 chars)
        if (data.description && data.description.length > 100) {
            errors.description = 'Description cannot exceed 100 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

// TransactionManager Class - Manages all transactions and business logic
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.budget = 0;
        this.categories = {
            Income: ['Salary', 'Allowances', 'Bonus', 'Investment', 'Other Income'],
            Expense: ['Rent', 'Food', 'Shopping', 'Entertainment', 'Transportation', 'Bills', 'Health', 'Travel', 'Other Expense']
        };
        this.loadData();
    }

    // Generate unique ID for transactions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new transaction
    addTransaction(transactionData) {
        try {
            const validation = Transaction.validate(transactionData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const id = this.generateId();
            const transaction = new Transaction(
                id,
                transactionData.amount,
                transactionData.date,
                transactionData.category,
                transactionData.subCategory,
                transactionData.description
            );

            this.transactions.push(transaction);
            this.saveData();

            return { success: true, transaction: transaction };
        } catch (error) {
            console.error('Error adding transaction:', error);
            return { success: false, errors: { general: 'Failed to add transaction' } };
        }
    }

    // Update existing transaction
    updateTransaction(id, transactionData) {
        try {
            const validation = Transaction.validate(transactionData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const index = this.transactions.findIndex(t => t.id === id);
            if (index === -1) {
                return { success: false, errors: { general: 'Transaction not found' } };
            }

            // Update transaction properties
            this.transactions[index].amount = parseFloat(transactionData.amount);
            this.transactions[index].date = transactionData.date;
            this.transactions[index].category = transactionData.category;
            this.transactions[index].subCategory = transactionData.subCategory;
            this.transactions[index].description = transactionData.description;

            this.saveData();
            return { success: true, transaction: this.transactions[index] };
        } catch (error) {
            console.error('Error updating transaction:', error);
            return { success: false, errors: { general: 'Failed to update transaction' } };
        }
    }

    // Delete transaction
    deleteTransaction(id) {
        try {
            const index = this.transactions.findIndex(t => t.id === id);
            if (index === -1) {
                return { success: false, error: 'Transaction not found' };
            }

            this.transactions.splice(index, 1);
            this.saveData();
            return { success: true };
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return { success: false, error: 'Failed to delete transaction' };
        }
    }

    // Get transaction by ID
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    // Get all transactions with optional filters
    getTransactions(filters = {}) {
        try {
            let filteredTransactions = [...this.transactions];

            // Category (Income/Expense) filter
            if (filters.category) {
                filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
            }

            // Sub-category (Category in new UI labels) filter
            if (filters.subCategory) {
                filteredTransactions = filteredTransactions.filter(t => t.subCategory === filters.subCategory);
            }

            // Sort transactions
            if (filters.sortBy) {
                filteredTransactions.sort((a, b) => {
                    switch (filters.sortBy) {
                        case 'date-desc':
                            return new Date(b.date) - new Date(a.date);
                        case 'date-asc':
                            return new Date(a.date) - new Date(b.date);
                        case 'amount-desc':
                            return b.amount - a.amount;
                        case 'amount-asc':
                            return a.amount - b.amount;
                        default:
                            return new Date(b.date) - new Date(a.date);
                    }
                });
            } else {
                filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            return filteredTransactions;
        } catch (error) {
            console.error('Error filtering transactions:', error);
            return [];
        }
    }

    // Calculate financial summary
    calculateSummary() {
        try {
            const income = this.transactions
                .filter(t => t.category === 'Income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = this.transactions
                .filter(t => t.category === 'Expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const balance = income - expenses;

            return {
                totalIncome: income,
                totalExpenses: expenses,
                netBalance: balance
            };
        } catch (error) {
            console.error('Error calculating summary:', error);
            return { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
        }
    }

    // Set and save budget
    setBudget(amount) {
        this.budget = parseFloat(amount) || 0;
        this.saveData();
    }

    // Get current month's expenses for budget tracking
    getCurrentMonthExpenses() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.transactions
            .filter(t => {
                const d = new Date(t.date);
                return t.category === 'Expense' &&
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Get sub-categories for a given category
    getSubCategories(category) {
        return this.categories[category] || [];
    }

    // Save all data to localStorage
    saveData() {
        try {
            const data = {
                transactions: this.transactions,
                budget: this.budget
            };
            localStorage.setItem('moneyManagerData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }

    // Load all data from localStorage
    loadData() {
        try {
            const data = localStorage.getItem('moneyManagerData');
            if (data) {
                const parsed = JSON.parse(data);
                this.transactions = (parsed.transactions || []).map(t => {
                    return new Transaction(t.id, t.amount, t.date, t.category, t.subCategory, t.description);
                });
                this.budget = parsed.budget || 0;
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            this.transactions = [];
            this.budget = 0;
        }
    }

    // Get data for Income vs Expense chart (grouped by month)
    getMonthlyStats() {
        const stats = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            stats[key] = { income: 0, expense: 0 };
        }

        this.transactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            if (stats[key]) {
                if (t.category === 'Income') stats[key].income += t.amount;
                else stats[key].expense += t.amount;
            }
        });

        return {
            labels: Object.keys(stats),
            incomeData: Object.values(stats).map(s => s.income),
            expenseData: Object.values(stats).map(s => s.expense)
        };
    }

    // Get expense distribution for pie chart
    getExpenseDistribution() {
        const expenseTransactions = this.transactions.filter(t => t.category === 'Expense');
        if (expenseTransactions.length === 0) return null;

        const distribution = {};
        expenseTransactions.forEach(t => {
            distribution[t.subCategory] = (distribution[t.subCategory] || 0) + t.amount;
        });

        const labels = Object.keys(distribution);
        const data = Object.values(distribution);
        const total = data.reduce((sum, amount) => sum + amount, 0);

        return {
            labels,
            data,
            total
        };
    }

    // Export to CSV
    exportToCSV() {
        if (this.transactions.length === 0) return null;
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...this.transactions.map(t => [
                t.date,
                t.category,
                t.subCategory,
                `"${(t.description || '').replace(/"/g, '""')}"`,
                t.amount.toFixed(2)
            ].join(','))
        ].join('\n');
        return csvContent;
    }
}

// UI Controller Class - Manages UI interactions and updates
class UIController {
    constructor(transactionManager) {
        this.transactionManager = transactionManager;
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.expenseChart = null;
        this.overviewChart = null;
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
        this.setDefaultDate();
    }

    initializeElements() {
        // Modals
        this.transactionModal = document.getElementById('transactionModal');
        this.budgetModal = document.getElementById('budgetModal');
        this.deleteModal = document.getElementById('deleteModal');

        // Forms
        this.transactionForm = document.getElementById('transactionForm');
        this.budgetForm = document.getElementById('budgetForm');

        // Summary elements
        this.totalIncomeEl = document.getElementById('totalIncome');
        this.totalExpensesEl = document.getElementById('totalExpenses');
        this.netBalanceEl = document.getElementById('netBalance');

        // Budget elements
        this.monthlyBudgetVal = document.getElementById('monthlyBudgetVal');
        this.spentVal = document.getElementById('spentVal');
        this.remainingVal = document.getElementById('remainingVal');
        this.budgetProgressBar = document.getElementById('budgetProgressBar');
        this.budgetWarning = document.getElementById('budgetWarning');

        // Table & Empty States
        this.transactionTableBody = document.getElementById('transactionTableBody');
        this.noTransactionsEl = document.getElementById('noTransactions');

        // Chart elements
        this.expenseChartCanvas = document.getElementById('expenseChart');
        this.overviewChartCanvas = document.getElementById('overviewChart');
        this.noChartDataEl = document.getElementById('noChartData');
        this.noOverviewDataEl = document.getElementById('noOverviewData');

        // Filters
        this.categoryFilter = document.getElementById('categoryFilter');
        this.subCategoryFilter = document.getElementById('subCategoryFilter');
        this.sortBy = document.getElementById('sortBy');
    }

    attachEventListeners() {
        // Transactions
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.openTransactionModal());
        this.transactionForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.querySelector('.close').addEventListener('click', () => this.closeTransactionModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeTransactionModal());

        // Budget
        document.getElementById('setBudgetBtn').addEventListener('click', () => this.openBudgetModal());
        this.budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        document.querySelector('.close-budget').addEventListener('click', () => this.closeBudgetModal());
        document.getElementById('cancelBudgetBtn').addEventListener('click', () => this.closeBudgetModal());

        // Dynamic Sub-categories
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.updateSubCategories(e.target.value));
        });

        // Filters
        this.categoryFilter.addEventListener('change', () => {
            this.updateSubCategoryFilter();
            this.updateTransactionTable();
        });
        this.subCategoryFilter.addEventListener('change', () => this.updateTransactionTable());
        this.sortBy.addEventListener('change', () => this.updateTransactionTable());
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());

        // Delete
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());

        // Description Count
        document.getElementById('description').addEventListener('input', (e) => {
            document.getElementById('charCount').textContent = `${e.target.value.length}/100`;
        });

        // Close Modals on click outside
        window.addEventListener('click', (e) => {
            if (e.target === this.transactionModal) this.closeTransactionModal();
            if (e.target === this.budgetModal) this.closeBudgetModal();
            if (e.target === this.deleteModal) this.closeDeleteModal();
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // Modal Methods
    openTransactionModal(id = null) {
        this.currentEditId = id;
        const title = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('saveBtn');

        if (id) {
            title.textContent = 'Edit Transaction';
            saveBtn.textContent = 'Update Transaction';
            this.populateForm(id);
        } else {
            title.textContent = 'Add Transaction';
            saveBtn.textContent = 'Save Transaction';
            this.transactionForm.reset();
            this.setDefaultDate();
        }
        this.transactionModal.style.display = 'block';
    }

    closeTransactionModal() {
        this.transactionModal.style.display = 'none';
        this.transactionForm.reset();
        this.clearErrors();
    }

    openBudgetModal() {
        document.getElementById('budgetAmount').value = this.transactionManager.budget || '';
        this.budgetModal.style.display = 'block';
    }

    closeBudgetModal() {
        this.budgetModal.style.display = 'none';
    }

    openDeleteModal(id) {
        this.currentDeleteId = id;
        this.deleteModal.style.display = 'block';
    }

    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
    }

    // Handle Submits
    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.transactionForm);
        const data = {
            amount: formData.get('amount'),
            date: formData.get('date'),
            category: formData.get('category'),
            subCategory: formData.get('subCategory'),
            description: formData.get('description')
        };

        const result = this.currentEditId
            ? this.transactionManager.updateTransaction(this.currentEditId, data)
            : this.transactionManager.addTransaction(data);

        if (result.success) {
            this.closeTransactionModal();
            this.updateUI();
            showSuccessMessage(this.currentEditId ? 'Transaction updated!' : 'Transaction added!');
        } else {
            this.displayErrors(result.errors);
        }
    }

    handleBudgetSubmit(e) {
        e.preventDefault();
        const amount = document.getElementById('budgetAmount').value;
        this.transactionManager.setBudget(amount);
        this.closeBudgetModal();
        this.updateBudgetUI();
        showSuccessMessage('Monthly budget updated!');
    }

    confirmDelete() {
        if (this.currentDeleteId) {
            this.transactionManager.deleteTransaction(this.currentDeleteId);
            this.updateUI();
            showSuccessMessage('Transaction deleted');
        }
        this.closeDeleteModal();
    }

    // UI Updates
    updateUI() {
        this.updateSummary();
        this.updateBudgetUI();
        this.updateTransactionTable();
        this.updateCharts();
    }

    updateSummary() {
        const { totalIncome, totalExpenses, netBalance } = this.transactionManager.calculateSummary();
        this.totalIncomeEl.textContent = `₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        this.totalExpensesEl.textContent = `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        this.netBalanceEl.textContent = `₹${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }

    updateBudgetUI() {
        const budget = this.transactionManager.budget;
        const spent = this.transactionManager.getCurrentMonthExpenses();
        const remaining = Math.max(0, budget - spent);
        const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

        this.monthlyBudgetVal.textContent = `₹${budget.toLocaleString('en-IN')}`;
        this.spentVal.textContent = `₹${spent.toLocaleString('en-IN')}`;
        this.remainingVal.textContent = `₹${remaining.toLocaleString('en-IN')}`;
        this.budgetProgressBar.style.width = `${percent}%`;

        // Color transition for progress bar
        if (percent > 90) this.budgetProgressBar.style.background = 'var(--danger)';
        else if (percent > 70) this.budgetProgressBar.style.background = 'var(--warning)';
        else this.budgetProgressBar.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';

        this.budgetWarning.style.display = (budget > 0 && spent > budget) ? 'flex' : 'none';
    }

    updateTransactionTable() {
        const filters = {
            category: this.categoryFilter.value,
            subCategory: this.subCategoryFilter.value,
            sortBy: this.sortBy.value
        };
        const transactions = this.transactionManager.getTransactions(filters);

        if (transactions.length === 0) {
            this.transactionTableBody.innerHTML = '';
            this.noTransactionsEl.style.display = 'flex';
            return;
        }

        this.noTransactionsEl.style.display = 'none';
        this.transactionTableBody.innerHTML = transactions.map(t => `
            <tr>
                <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                    <span class="type-tag ${t.category.toLowerCase()}">
                        <i class="fas ${t.category === 'Income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i> ${t.category}
                    </span>
                </td>
                <td>${t.subCategory}</td>
                <td><span class="text-muted">${t.description || '-'}</span></td>
                <td class="font-bold ${t.category === 'Income' ? 'text-success' : 'text-danger'}">
                    ${t.category === 'Income' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td>
                    <div class="action-cell">
                        <button class="edit-btn" onclick="uiController.openTransactionModal('${t.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="uiController.openDeleteModal('${t.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCharts() {
        this.updateExpenseChart();
        this.updateOverviewChart();
    }

    updateExpenseChart() {
        const dist = this.transactionManager.getExpenseDistribution();
        if (!dist) {
            this.expenseChartCanvas.style.display = 'none';
            this.noChartDataEl.style.display = 'flex';
            return;
        }

        this.expenseChartCanvas.style.display = 'block';
        this.noChartDataEl.style.display = 'none';

        const data = {
            labels: dist.labels,
            datasets: [{
                data: dist.data,
                backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                borderWidth: 0,
                hoverOffset: 15
            }]
        };

        if (this.expenseChart) this.expenseChart.destroy();
        this.expenseChart = new Chart(this.expenseChartCanvas, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20, usePointStyle: true } }
                }
            }
        });
    }

    updateOverviewChart() {
        const stats = this.transactionManager.getMonthlyStats();
        if (stats.labels.length === 0) {
            this.overviewChartCanvas.style.display = 'none';
            this.noOverviewDataEl.style.display = 'flex';
            return;
        }

        this.overviewChartCanvas.style.display = 'block';
        this.noOverviewDataEl.style.display = 'none';

        if (this.overviewChart) this.overviewChart.destroy();
        this.overviewChart = new Chart(this.overviewChartCanvas, {
            type: 'bar',
            data: {
                labels: stats.labels,
                datasets: [
                    { label: 'Income', data: stats.incomeData, backgroundColor: '#10b981', borderRadius: 6 },
                    { label: 'Expense', data: stats.expenseData, backgroundColor: '#ef4444', borderRadius: 6 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true } }
                }
            }
        });
    }

    // Helpers
    updateSubCategories(category) {
        const select = document.getElementById('subCategory');
        select.innerHTML = '<option value="">Select Category</option>';
        if (category) {
            this.transactionManager.getSubCategories(category).forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub; opt.textContent = sub;
                select.appendChild(opt);
            });
        }
    }

    updateSubCategoryFilter() {
        const cat = this.categoryFilter.value;
        this.subCategoryFilter.innerHTML = '<option value="">All Categories</option>';
        if (cat) {
            this.transactionManager.getSubCategories(cat).forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub; opt.textContent = sub;
                this.subCategoryFilter.appendChild(opt);
            });
        }
    }

    populateForm(id) {
        const t = this.transactionManager.getTransaction(id);
        if (!t) return;
        document.getElementById('amount').value = t.amount;
        document.getElementById('date').value = t.date;
        document.querySelector(`input[name="category"][value="${t.category}"]`).checked = true;
        this.updateSubCategories(t.category);
        setTimeout(() => document.getElementById('subCategory').value = t.subCategory, 0);
        document.getElementById('description').value = t.description;
    }

    clearFilters() {
        this.categoryFilter.value = '';
        this.subCategoryFilter.value = '';
        this.sortBy.value = 'date-desc';
        this.updateSubCategoryFilter();
        this.updateTransactionTable();
    }

    displayErrors(errors) {
        Object.keys(errors).forEach(f => {
            const err = document.getElementById(`${f}Error`);
            if (err) err.textContent = errors[f];
        });
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }
}

// Global Notification System
function showNotification(msg, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${msg}</span>
    `;

    // Inline styles for notification (since I changed the CSS structure)
    Object.assign(notification.style, {
        position: 'fixed', bottom: '30px', right: '30px',
        background: type === 'success' ? 'var(--success)' : 'var(--danger)',
        color: 'white', padding: '16px 24px', borderRadius: '16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: '2000',
        animation: 'slideIn 0.3s ease-out'
    });

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to head
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    .text-success { color: var(--success) !important; }
    .text-danger { color: var(--danger) !important; }
    .text-muted { color: var(--text-muted) !important; }
    .font-bold { font-weight: 700; }
    .type-tag { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
    .type-tag.income { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .type-tag.expense { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
`;
document.head.appendChild(style);

const showSuccessMessage = (msg) => showNotification(msg, 'success');
const showErrorMessage = (msg) => showNotification(msg, 'error');

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    const manager = new TransactionManager();
    window.uiController = new UIController(manager);

    // Add CSV feature to new UI
    const exportBtn = document.createElement('button');
    exportBtn.className = 'secondary-btn';
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export CSV';
    exportBtn.onclick = () => {
        const csv = manager.exportToCSV();
        if (csv) {
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'transactions.csv';
            a.click();
            showSuccessMessage('Export successful!');
        } else {
            showErrorMessage('No transactions to export');
        }
    };
    document.querySelector('.filter-actions').appendChild(exportBtn);
});

// Global error handler
window.addEventListener('error', function (event) {
    console.error('Global error:', event.error);
    showErrorMessage('An unexpected error occurred. Please try again.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorMessage('An unexpected error occurred. Please try again.');
});

// Export functions for use in other files (if needed)
window.MoneyManagerApp = {
    showErrorMessage,
    showSuccessMessage,
    showNotification
};