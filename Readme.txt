Money Manager App

A simple and intuitive web-based personal finance tracking application built with HTML, CSS, and JavaScript using Object-Oriented Programming principles.
Money Manager helps you track your personal finances by managing income and expense transactions. The app provides a clean interface to add, edit, delete, and view your financial transactions with real-time summary calculations.
Features
Core Functionality

1. Add Transactions: Record income and expenses with details
2. Edit Transactions: Modify existing transaction details
3. Delete Transactions: Remove transactions with confirmation
4. View History: Display all transactions in a organized table
5. Financial Summary: Real-time calculation of total income, expenses, and balance

Advanced Features

1. Filter & Sort: Filter by category, sub-category, date range, and sort by date/amount
2. Form Validation: Comprehensive input validation with error messages
3. Data Persistence: Automatic saving to browser's local storage
4. CSV Export: Download transaction data as CSV file
5. Responsive Design: Works on desktop, tablet, and mobile devices

How It Works

Adding Transactions
1. Click "Add Transaction" button
2. Fill in the form:
       a. Amount: Enter transaction amount (required, positive number)
       b. Date: Select date (defaults to today, cannot be future)
       c. Category: Choose Income or Expense (required)
       d. Sub-Category: Select from dropdown based on category (required)
       e. Description: Optional text field (max 100 characters)
3. Click "Save Transaction"

Categories

1. Income: Salary, Allowances, Bonus, Petty Cash, Other Income
2.Expense: Rent, Food, Shopping, Entertainment, Transportation, Bills, Other Expense

Managing Transactions

1. Edit: Click "Edit" button on any transaction row to modify
2. Delete: Click "Delete" button with confirmation prompt
3. Filter: Use dropdown filters and date range to find specific transactions
4. Sort: Sort by date (newest/oldest) or amount (highest/lowest)

Data Storage

1. All data is automatically saved to your browser's local storage
2. No server required - works completely offline
3. Data persists between browser sessions

File Structure
    money-manager/
    ├── index.html      # Main HTML structure
    ├── styles.css      # CSS styling and responsive design
    ├── script.js       # Complete JavaScript with OOP classes
    └── README.txt      # This documentation


How to Use the Money Manager App Files

 Your project has three files:
       1. index.html – The structure of the app (layout and sections).
       2. styles.css – The design and styling (colors, layout, chart size).
       3. script.js – The functionality (adding transactions, filtering, chart updates).

Steps to Set It Up
       1. Create a new folder (e.g., MoneyManagerApp).
       2. Save the three files inside:
              * index.html
              * styles.css
              * script.js
       3. Ensure the file names are exactly as above (case-sensitive).
       
a. How to Open the App

       1. Open the folder.
       2. Double-click index.html (or right-click → Open with browser).
       3. The app will open in your browser — no installation required.

b. How It Works

       1. The HTML file loads your app layout.
       2. The CSS file styles everything automatically (you don’t need to link it again — it’s already linked in the HTML).
       3. The JavaScript file adds interactivity: you can add transactions, filter them, and see the pie chart update in real time.

c. How to Edit or Customize

       1. To change colors, fonts, or chart size → edit styles.css.
       2. To change transaction logic or chart data → edit script.js.
       3. To modify layout or add sections → edit index.html.