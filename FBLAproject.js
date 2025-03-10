var balance = 0; // Running balance
var balanceChanges = []; //Array to store all the balance changes
var transactionDescription = []; // List of descriptions given by the user
var transactionTime = []; // List of times when the transaction was made
var transType = []; // Income or expense
var currentTime;

// Load data from localStorage
function loadData() {
    const data = JSON.parse(localStorage.getItem('transactionData'));
    if (data) {
        balance = data.balance;
        balanceChanges = data.balanceChanges;
        transactionDescription = data.transactionDescription;
        transactionTime = data.transactionTime;
        transType = data.transType;
    }
}

// Save data to localStorage
function saveData() {
    const data = {
        balance,
        balanceChanges,
        transactionDescription,
        transactionTime,
        transType
    };
    localStorage.setItem('transactionData', JSON.stringify(data));
}

// Creates a button with text that can be reused 
const createBtn = (text = 'button') => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.textContent = text;
    return btn;
};

// Adds a message to the screen
const logToScreen = (message) => {
    const logDiv = document.getElementById('log');
    const p = document.createElement('p');
    p.textContent = message;
    logDiv.appendChild(p);
};

// Updates the table with the new transaction
const updateTable = (filteredIndexes = null) => {
    const table = document.getElementById('transactionTable');
    table.innerHTML = ''; // Clear the table

    // Create table headers
    const headerRow = document.createElement('tr');
    const headers = [' ', 'Time', 'Description', 'Amount', 'Type', 'Total'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate table rows
    let runningTotal = 0;
    const indexes = filteredIndexes || balanceChanges.map((_, index) => index);
    indexes.forEach((i, rowIndex) => {
        const row = document.createElement('tr');
        runningTotal += balanceChanges[i];
        const cells = [
            rowIndex + 1, // Row number
            transactionTime[i],
            transactionDescription[i],
            `$${balanceChanges[i].toFixed(2)}`,
            transType[i],
            `$${runningTotal.toFixed(2)}`
        ];
        cells.forEach(cellText => {
            const td = document.createElement('td');
            td.textContent = cellText;
            row.appendChild(td);
        });
        table.appendChild(row);
    });

    // Update total balance display
    const totalBalanceDiv = document.getElementById('totalBalance');
    totalBalanceDiv.textContent = `Total Balance: $${balance.toFixed(2)}`;
};

// Asks for the description and amount of the transaction, applies the date and time automatically
// Updates the balance and the transaction lists
function transact() {
    var description = prompt('Describe transaction: ');
    var amount = prompt('Enter Amount: $');
    amount = parseFloat(amount);
    if (isNaN(amount)) {
        logToScreen('Please enter a valid amount');// Checks to see if the amount entered is a number
        return;
    }
    if (amount == 0) {
        logToScreen('Amount cannot be 0'); // Checks to see if the amount entered is 0
        return;
    } else if (amount < 0) {
        transType.push('Expense'); // If the amount is negative, it is an expense
    } else {
        transType.push('Income'); // If the amount is positive, it is an income
    }
    balance += amount;
    currentTime = new Date().toLocaleString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' });// Sets the current time
    balanceChanges.push(amount);
    transactionDescription.push(description);
    transactionTime.push(currentTime);
    updateTable();
    saveData(); // Save data to localStorage
    return balance;
}

//Allows the user to edit the time, description, and amount of a transaction
function editTransaction() {
    var index = prompt('Enter index of transaction to edit: ');
    index = parseInt(index) - 1; // Subtract the given number by one to get the correct index
    if (isNaN(index)) {
        logToScreen('Please enter a valid index');
        return;
    }
    if (index < 0 || index >= balanceChanges.length) {
        logToScreen('Index out of range');
        return;
    }
    var newTime = prompt('Enter new time: '); // Allows user to update time
    transactionTime[index] = newTime;
    var newDescription = prompt('Enter new description: '); // Allows user to update description
    transactionDescription[index] = newDescription;
    var newAmount = prompt('Enter new Amount: $'); // Allows user to update amount
    newAmount = parseFloat(newAmount);
    if (isNaN(newAmount)) {
        logToScreen('Please enter a valid amount');
        return;
    }
    if (newAmount == 0) {
        logToScreen('Amount cannot be 0');
        return;
    } else if (newAmount < 0) {
        transType[index] = 'Expense';
    } else {
        transType[index] = 'Income';
    }
    balance -= balanceChanges[index];
    balanceChanges[index] = newAmount;
    balance += newAmount;
    logToScreen('Transaction edited successfully');
    sortTransactionsByTime();
    updateTable();
    saveData(); // Save data to localStorage
}

function sortTransactionsByTime() {
    // Combine all transaction data into a single array of objects
    const transactions = transactionTime.map((time, index) => ({
        time: new Date(time),
        description: transactionDescription[index],
        amount: balanceChanges[index],
        type: transType[index]
    }));

    // Sorts the transactions by time (oldest to newest)
    transactions.sort((a, b) => a.time - b.time);

    // Puts sorted data back into individual arrays
    transactionTime = transactions.map(transaction => transaction.time.toLocaleString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' }));
    transactionDescription = transactions.map(transaction => transaction.description);
    balanceChanges = transactions.map(transaction => transaction.amount);
    transType = transactions.map(transaction => transaction.type);

    // Updates the table with the sorted data
    updateTable();
    saveData();
}

//Allows the user to delete a transaction
function deleteTransaction() {
    var index = prompt('Enter index of transaction to delete: ');
    index = parseInt(index) - 1;
    if (isNaN(index)) {
        logToScreen('Please enter a valid index'); // Gets a valid number
        return;
    }
    if (index < 0 || index >= balanceChanges.length) {
        logToScreen('Index out of range');
        return;
    }
    balance -= balanceChanges[index]; // Removes the amount from the balance
    balanceChanges.splice(index, 1); // Removes the amount from the balanceChanges array
    transactionDescription.splice(index, 1); // Removes the description from the transactionDescription array
    transactionTime.splice(index, 1); // Removes the time from the transactionTime array
    transType.splice(index, 1); // Removes the type from the transType array
    logToScreen('Transaction deleted successfully');
    updateTable();
    saveData(); // Save data to localStorage
}

//Displays transactions from the last 7 days
function last7Days() {
    const table = document.getElementById('transactionTable');
    table.innerHTML = ''; // Clear the table

    // Create table headers
    const headerRow = document.createElement('tr');
    const headers = [' ', 'Time', 'Description', 'Amount', 'Type', 'Total'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    let runningTotal = 0;
    let rowIndex = 1;
    for (var i = 0; i < balanceChanges.length; i++) {
        var date = new Date(transactionTime[i]); // Gets the date of the transaction
        var currentDate = new Date(); // Gets the current date
        var diff = currentDate - date; // Calculates the difference between the two dates
        var days = diff / (1000 * 60 * 60 * 24);
        // Only shows the transaction if it was less than 7 days ago
        if (days <= 7) {
            const row = document.createElement('tr');
            runningTotal += balanceChanges[i];
            const cells = [
                rowIndex++, // Row number
                transactionTime[i],
                transactionDescription[i],
                `$${balanceChanges[i].toFixed(2)}`,
                transType[i],
                `$${runningTotal.toFixed(2)}`
            ];
            cells.forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                row.appendChild(td);
            });
            table.appendChild(row);
        }
    }
}

//Displays transactions from the last 30 days
function last30Days() {
    const table = document.getElementById('transactionTable');
    table.innerHTML = ''; // Clear the table

    // Create table headers
    const headerRow = document.createElement('tr');
    const headers = [' ', 'Time', 'Description', 'Amount', 'Type', 'Total'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    let runningTotal = 0;
    let rowIndex = 1;
    for (var i = 0; i < balanceChanges.length; i++) {
        var date = new Date(transactionTime[i]); // Gets the date of the transaction
        var currentDate = new Date(); // Gets the current date
        var diff = currentDate - date; // Calculates the difference between the two dates
        var days = diff / (1000 * 60 * 60 * 24);
        // Only shows the transaction if it was less than 30 days ago
        if (days <= 30) {
            const row = document.createElement('tr');
            runningTotal += balanceChanges[i];
            const cells = [
                rowIndex++, // Row number
                transactionTime[i],
                transactionDescription[i],
                `$${balanceChanges[i].toFixed(2)}`,
                transType[i],
                `$${runningTotal.toFixed(2)}`
            ];
            cells.forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                row.appendChild(td);
            });
            table.appendChild(row);
        }
    }
}

//Displays transactions from the last year
function lastYear() {
    const table = document.getElementById('transactionTable');
    table.innerHTML = ''; // Clear the table

    // Create table headers
    const headerRow = document.createElement('tr');
    const headers = [' ', 'Time', 'Description', 'Amount', 'Type', 'Total'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    let runningTotal = 0;
    let rowIndex = 1;
    for (var i = 0; i < balanceChanges.length; i++) {
        var date = new Date(transactionTime[i]); // Gets the date of the transaction
        var currentDate = new Date(); // Gets the current date
        var diff = currentDate - date; // Calculates the difference between the two dates
        var days = diff / (1000 * 60 * 60 * 24);
        // Only shows the transaction if it was less than a year ago
        if (days <= 365) {
            const row = document.createElement('tr');
            runningTotal += balanceChanges[i];
            const cells = [
                rowIndex++, // Row number
                transactionTime[i],
                transactionDescription[i],
                `$${balanceChanges[i].toFixed(2)}`,
                transType[i],
                `$${runningTotal.toFixed(2)}`
            ];
            cells.forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                row.appendChild(td);
            });
            table.appendChild(row);
        }
    }
}

// Displays transactions based on the user's choice
function veiwBalanceHistory() {
    var choice = prompt('Enter 1 to view transactions from the last 7 days, 2 for the last 30 days, 3 for the last year, or 4 to view all transactions: ');
    choice = parseInt(choice);
    if (isNaN(choice)) {
        logToScreen('Please enter a valid choice');
        return;
    }
    if (choice == 1) {
        last7Days();
    } else if (choice == 2) {
        last30Days();
    } else if (choice == 3) {
        lastYear();
    } else if (choice == 4) {
        updateTable();
    }
}

//Searches transactions based on the user's input
function searchTransactions() {
    var keyword = prompt('Enter a word to search. Make sure to use correct spelling: ');
    var filteredIndexes;
    if (keyword === 'Income' || keyword === 'income' || keyword === 'Expense' || keyword === 'expense') {
        filteredIndexes = transType
            .map((type, index) => type.toLowerCase() === keyword.toLowerCase() ? index : -1)
            .filter(index => index !== -1);
    } else {
        filteredIndexes = transactionDescription
            .map((desc, index) => desc.toLowerCase().includes(keyword.toLowerCase()) ? index : -1)
            .filter(index => index !== -1);
    }
    updateTable(filteredIndexes);
}

//Prints the current table
function printTransactions() {
    const tableContent = document.getElementById('transactionTable').outerHTML;
    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write('<html><head><title>Print Transactions</title></head><body>');
    newWindow.document.write(tableContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
}

function main() {
    loadData(); // Load data from localStorage
    // Create buttons
    createBtn('Add Transaction');
    createBtn('Edit Transaction');
    createBtn('Delete Transaction');
    createBtn('View Balance History');
    createBtn('Search Transactions');
    createBtn('Print Transactions');
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (event) => {
            if (event.target.textContent === 'Add Transaction') {
                transact();
            } else if (event.target.textContent === 'Edit Transaction') {
                editTransaction();
            } else if (event.target.textContent === 'Delete Transaction') {
                deleteTransaction();
            } else if (event.target.textContent === 'View Balance History') {
                veiwBalanceHistory();
            } else if (event.target.textContent === 'Search Transactions') {
                searchTransactions();
            } else if (event.target.textContent === 'Print Transactions') {
                printTransactions();
            }
        });
    });

    updateTable(); // Initial table update
    saveData(); // Saves data

}

main();