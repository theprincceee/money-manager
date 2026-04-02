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
        this.categories = {
            Income: ['Salary', 'Allowances', 'Bonus', 'Petty Cash', 'Other Income'],
            Expense: ['Rent', 'Food', 'Shopping', 'Entertainment', 'Transportation', 'Bills', 'Other Expense']
        };
        this.loadTransactions();
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
            this.saveTransactions();
            
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

            this.saveTransactions();
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
            this.saveTransactions();
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

            // Category filter
            if (filters.category) {
                filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
            }

            // Sub-category filter
            if (filters.subCategory) {
                filteredTransactions = filteredTransactions.filter(t => t.subCategory === filters.subCategory);
            }

            // Date range filter
            if (filters.dateFrom) {
                filteredTransactions = filteredTransactions.filter(t => t.date >= filters.dateFrom);
            }

            if (filters.dateTo) {
                filteredTransactions = filteredTransactions.filter(t => t.date <= filters.dateTo);
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
                // Default sort by date (newest first)
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
            return {
                totalIncome: 0,
                totalExpenses: 0,
                netBalance: 0
            };
        }
    }

    // Get sub-categories for a given category
    getSubCategories(category) {
        return this.categories[category] || [];
    }

    // Save transactions to localStorage
    saveTransactions() {
        try {
            const data = JSON.stringify(this.transactions);
            localStorage.setItem('moneyManagerTransactions', data);
        } catch (error) {
            console.error('Error saving transactions to localStorage:', error);
        }
    }

    // Load transactions from localStorage
    loadTransactions() {
        try {
            const data = localStorage.getItem('moneyManagerTransactions');
            if (data) {
                const parsedData = JSON.parse(data);
                this.transactions = parsedData.map(t => {
                    return new Transaction(t.id, t.amount, t.date, t.category, t.subCategory, t.description);
                });
            }
        } catch (error) {
            console.error('Error loading transactions from localStorage:', error);
            this.transactions = [];
        }
    }

    // Export transactions to CSV format
    exportToCSV() {
        try {
            if (this.transactions.length === 0) {
                return null;
            }

            const headers = ['Date', 'Category', 'Sub-Category', 'Description', 'Amount'];
            const csvContent = [
                headers.join(','),
                ...this.transactions.map(t => [
                    t.date,
                    t.category,
                    t.subCategory,
                    `"${t.description.replace(/"/g, '""')}"`,
                    t.amount.toFixed(2)
                ].join(','))
            ].join('\n');

            return csvContent;
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            return null;
        }
    }

    // Get expense distribution for pie chart
    getExpenseDistribution() {
        try {
            const expenseTransactions = this.transactions.filter(t => t.category === 'Expense');
            
            if (expenseTransactions.length === 0) {
                return null;
            }

            const distribution = {};
            
            // Group expenses by sub-category
            expenseTransactions.forEach(transaction => {
                if (distribution[transaction.subCategory]) {
                    distribution[transaction.subCategory] += transaction.amount;
                } else {
                    distribution[transaction.subCategory] = transaction.amount;
                }
            });

            // Convert to array format for Chart.js
            const labels = Object.keys(distribution);
            const data = Object.values(distribution);
            const total = data.reduce((sum, amount) => sum + amount, 0);

            return {
                labels,
                data,
                total,
                percentages: data.map(amount => ((amount / total) * 100).toFixed(1))
            };
        } catch (error) {
            console.error('Error calculating expense distribution:', error);
            return null;
        }
    }
}

// UI Controller Class - Manages UI interactions and updates
class UIController {
    constructor(transactionManager) {
        this.transactionManager = transactionManager;
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.expenseChart = null; // Chart.js instance
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
        this.setDefaultDate();
    }

    // Initialize DOM elements
    initializeElements() {
        // Modals
        this.transactionModal = document.getElementById('transactionModal');
        this.deleteModal = document.getElementById('deleteModal');
        
        // Forms
        this.transactionForm = document.getElementById('transactionForm');
        
        // Summary elements
        this.totalIncomeEl = document.getElementById('totalIncome');
        this.totalExpensesEl = document.getElementById('totalExpenses');
        this.netBalanceEl = document.getElementById('netBalance');
        
        // Table
        this.transactionTableBody = document.getElementById('transactionTableBody');
        this.noTransactionsEl = document.getElementById('noTransactions');
        
        // Chart elements
        this.expenseChartCanvas = document.getElementById('expenseChart');
        this.noChartDataEl = document.getElementById('noChartData');
        
        // Filters
        this.categoryFilter = document.getElementById('categoryFilter');
        this.subCategoryFilter = document.getElementById('subCategoryFilter');
        this.dateFromFilter = document.getElementById('dateFromFilter');
        this.dateToFilter = document.getElementById('dateToFilter');
        this.sortBy = document.getElementById('sortBy');
    }

    // Attach event listeners
    attachEventListeners() {
        // Add transaction button
        document.getElementById('addTransactionBtn').addEventListener('click', () => {
            this.openTransactionModal();
        });

        // Modal close buttons
        document.querySelector('.close').addEventListener('click', () => {
            this.closeTransactionModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeTransactionModal();
        });

        // Form submission
        this.transactionForm.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Category radio buttons change
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateSubCategories(e.target.value);
            });
        });

        // Character count for description
        document.getElementById('description').addEventListener('input', (e) => {
            this.updateCharCount(e.target.value.length);
        });

        // Filter and sort controls
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        this.categoryFilter.addEventListener('change', () => {
            this.updateSubCategoryFilter();
        });

        // Delete modal controls
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.transactionModal) {
                this.closeTransactionModal();
            }
            if (e.target === this.deleteModal) {
                this.closeDeleteModal();
            }
        });
    }

    // Set default date to today
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // Open transaction modal for adding/editing
    openTransactionModal(transactionId = null) {
        this.currentEditId = transactionId;
        const modal = document.getElementById('transactionModal');
        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('saveBtn');

        if (transactionId) {
            // Edit mode
            modalTitle.textContent = 'Edit Transaction';
            saveBtn.textContent = 'Update Transaction';
            this.populateForm(transactionId);
        } else {
            // Add mode
            modalTitle.textContent = 'Add Transaction';
            saveBtn.textContent = 'Save Transaction';
            this.transactionForm.reset();
            this.setDefaultDate();
            this.clearErrors();
        }

        modal.style.display = 'block';
    }

    // Close transaction modal
    closeTransactionModal() {
        this.transactionModal.style.display = 'none';
        this.currentEditId = null;
        this.transactionForm.reset();
        this.clearErrors();
    }

    // Populate form with transaction data for editing
    populateForm(transactionId) {
        const transaction = this.transactionManager.getTransaction(transactionId);
        if (!transaction) return;

        document.getElementById('amount').value = transaction.amount;
        document.getElementById('date').value = transaction.date;
        document.querySelector(`input[name="category"][value="${transaction.category}"]`).checked = true;
        
        this.updateSubCategories(transaction.category);
        setTimeout(() => {
            document.getElementById('subCategory').value = transaction.subCategory;
        }, 0);
        
        document.getElementById('description').value = transaction.description;
        this.updateCharCount(transaction.description.length);
    }

    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        this.clearErrors();

        const formData = new FormData(this.transactionForm);
        const transactionData = {
            amount: formData.get('amount'),
            date: formData.get('date'),
            category: formData.get('category'),
            subCategory: formData.get('subCategory'),
            description: formData.get('description') || ''
        };

        let result;
        if (this.currentEditId) {
            result = this.transactionManager.updateTransaction(this.currentEditId, transactionData);
        } else {
            result = this.transactionManager.addTransaction(transactionData);
        }

        if (result.success) {
            this.closeTransactionModal();
            this.updateUI();
        } else {
            this.displayErrors(result.errors);
        }
    }

    // Update sub-categories based on selected category
    updateSubCategories(category) {
        const subCategorySelect = document.getElementById('subCategory');
        subCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';

        if (category) {
            const subCategories = this.transactionManager.getSubCategories(category);
            subCategories.forEach(subCat => {
                const option = document.createElement('option');
                option.value = subCat;
                option.textContent = subCat;
                subCategorySelect.appendChild(option);
            });
        }
    }

    // Update character count for description
    updateCharCount(count) {
        const charCountEl = document.getElementById('charCount');
        charCountEl.textContent = `${count}/100`;
        charCountEl.style.color = count > 100 ? '#dc3545' : '#666';
    }

    // Display validation errors
    displayErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorEl = document.getElementById(`${field}Error`);
            const inputEl = document.getElementById(field) || document.querySelector(`input[name="${field}"]`);
            
            if (errorEl) {
                errorEl.textContent = errors[field];
            }
            
            if (inputEl) {
                inputEl.classList.add('invalid');
            }
        });
    }

    // Clear all error messages
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.invalid').forEach(el => {
            el.classList.remove('invalid');
        });
    }

    // Update entire UI
    updateUI() {
        this.updateSummary();
        this.updateTransactionTable();
        this.updateExpenseChart();
    }

    // Update financial summary
    updateSummary() {
        const summary = this.transactionManager.calculateSummary();
        
        this.totalIncomeEl.textContent = `₹${summary.totalIncome.toFixed(2)}`;
        this.totalExpensesEl.textContent = `₹${summary.totalExpenses.toFixed(2)}`;
        this.netBalanceEl.textContent = `₹${summary.netBalance.toFixed(2)}`;
        
        // Change color based on balance
        if (summary.netBalance >= 0) {
            this.netBalanceEl.style.color = '#28a745';
        } else {
            this.netBalanceEl.style.color = '#dc3545';
        }
    }

    // Update transaction table
    updateTransactionTable() {
        const filters = this.getFilterValues();
        const transactions = this.transactionManager.getTransactions(filters);
        
        if (transactions.length === 0) {
            this.transactionTableBody.innerHTML = '';
            this.noTransactionsEl.style.display = 'block';
            return;
        }

        this.noTransactionsEl.style.display = 'none';
        
        this.transactionTableBody.innerHTML = transactions.map(transaction => {
            const rowClass = transaction.category === 'Income' ? 'income-row' : 'expense-row';
            const amountColor = transaction.category === 'Income' ? '#28a745' : '#dc3545';
            const amountPrefix = transaction.category === 'Income' ? '+' : '-';
            
            return `
                <tr class="${rowClass}">
                    <td>${this.formatDate(transaction.date)}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.subCategory}</td>
                    <td>${transaction.description || '-'}</td>
                    <td style="color: ${amountColor}; font-weight: bold;">
                        ${amountPrefix}₹${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" onclick="uiController.openTransactionModal('${transaction.id}')">
                                Edit
                            </button>
                            <button class="delete-btn" onclick="uiController.openDeleteModal('${transaction.id}')">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Get current filter values
    getFilterValues() {
        return {
            category: this.categoryFilter.value,
            subCategory: this.subCategoryFilter.value,
            dateFrom: this.dateFromFilter.value,
            dateTo: this.dateToFilter.value,
            sortBy: this.sortBy.value
        };
    }

    // Apply filters
    applyFilters() {
        this.updateTransactionTable();
    }

    // Clear all filters
    clearFilters() {
        this.categoryFilter.value = '';
        this.subCategoryFilter.value = '';
        this.dateFromFilter.value = '';
        this.dateToFilter.value = '';
        this.sortBy.value = 'date-desc';
        this.updateSubCategoryFilter();
        this.updateTransactionTable();
    }

    // Update sub-category filter based on category filter
    updateSubCategoryFilter() {
        const category = this.categoryFilter.value;
        this.subCategoryFilter.innerHTML = '<option value="">All Sub-Categories</option>';

        if (category) {
            const subCategories = this.transactionManager.getSubCategories(category);
            subCategories.forEach(subCat => {
                const option = document.createElement('option');
                option.value = subCat;
                option.textContent = subCat;
                this.subCategoryFilter.appendChild(option);
            });
        }
    }

    // Open delete confirmation modal
    openDeleteModal(transactionId) {
        this.currentDeleteId = transactionId;
        this.deleteModal.style.display = 'block';
    }

    // Close delete modal
    closeDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.currentDeleteId = null;
    }

    // Confirm deletion
    confirmDelete() {
        if (this.currentDeleteId) {
            const result = this.transactionManager.deleteTransaction(this.currentDeleteId);
            if (result.success) {
                this.updateUI();
            }
        }
        this.closeDeleteModal();
    }

    // Update expense distribution pie chart
    updateExpenseChart() {
        try {
            const distribution = this.transactionManager.getExpenseDistribution();
            
            if (!distribution || distribution.data.length === 0) {
                // No expense data available
                if (this.expenseChart) {
                    this.expenseChart.destroy();
                    this.expenseChart = null;
                }
                this.expenseChartCanvas.style.display = 'none';
                this.noChartDataEl.style.display = 'block';
                return;
            }

            // Show chart, hide no data message
            this.expenseChartCanvas.style.display = 'block';
            this.noChartDataEl.style.display = 'none';

            // Define colors for different categories
            const backgroundColors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
            ];

            const borderColors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
            ];

            const chartData = {
                labels: distribution.labels,
                datasets: [{
                    data: distribution.data,
                    backgroundColor: backgroundColors.slice(0, distribution.labels.length),
                    borderColor: borderColors.slice(0, distribution.labels.length),
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            };

            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expense Distribution by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percentage = ((value / distribution.total) * 100).toFixed(1);
                                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            };

            // Destroy existing chart if it exists
            if (this.expenseChart) {
                this.expenseChart.destroy();
            }

            // Create new chart
            const ctx = this.expenseChartCanvas.getContext('2d');
            this.expenseChart = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: chartOptions
            });

            console.log('Expense chart updated successfully');

        } catch (error) {
            console.error('Error updating expense chart:', error);
            this.expenseChartCanvas.style.display = 'none';
            this.noChartDataEl.style.display = 'block';
        }
    }
}

// Main Application Initialization and Bonus Features

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize the transaction manager
        const transactionManager = new TransactionManager();
        
        // Initialize the UI controller
        window.uiController = new UIController(transactionManager);
        
        console.log('Money Manager App initialized successfully');
        
        // Add bonus features
        initializeBonusFeatures(transactionManager);
        
    } catch (error) {
        console.error('Error initializing Money Manager App:', error);
        showErrorMessage('Failed to initialize the application. Please refresh the page.');
    }
});

// Bonus Features Implementation
function initializeBonusFeatures(transactionManager) {
    // Add CSV download functionality
    addDownloadCSVFeature(transactionManager);
}

// CSV Download Feature
function addDownloadCSVFeature(transactionManager) {
    try {
        // Create download button
        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = 'Download CSV';
        downloadBtn.className = 'add-transaction-btn';
        downloadBtn.style.marginLeft = '10px';
        downloadBtn.style.background = 'linear-gradient(135deg, #17a2b8, #138496)';
        
        // Add click event
        downloadBtn.addEventListener('click', function() {
            try {
                const csvContent = transactionManager.exportToCSV();
                if (csvContent) {
                    downloadCSVFile(csvContent, 'transactions.csv');
                } else {
                    showErrorMessage('No transactions to export');
                }
            } catch (error) {
                console.error('Error downloading CSV:', error);
                showErrorMessage('Failed to download CSV file');
            }
        });
        
        // Add button to controls section
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        addTransactionBtn.parentNode.insertBefore(downloadBtn, addTransactionBtn.nextSibling);
        
    } catch (error) {
        console.error('Error adding CSV download feature:', error);
    }
}

// Helper function to download CSV file
function downloadCSVFile(csvContent, filename) {
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showSuccessMessage('CSV file downloaded successfully');
        } else {
            throw new Error('Download not supported');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        showErrorMessage('Failed to download file');
    }
}

// Utility Functions
function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    try {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#007bff';
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// Add CSS animations for notifications
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize notification styles
addNotificationStyles();

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showErrorMessage('An unexpected error occurred. Please try again.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorMessage('An unexpected error occurred. Please try again.');
});

// Export functions for use in other files (if needed)
window.MoneyManagerApp = {
    showErrorMessage,
    showSuccessMessage,
    showNotification
};