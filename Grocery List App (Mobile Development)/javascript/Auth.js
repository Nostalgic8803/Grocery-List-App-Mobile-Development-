function register(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const regError = document.getElementById('reg-error');

    regError.textContent = '';

    if (password !== confirmPassword) {
        regError.textContent = 'Passwords do not match!';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        regError.textContent = 'Username already exists!';
        return;
    }

    users.push({
        username,
        email,
        password
    });
    localStorage.setItem('users', JSON.stringify(users)); // Store users in localStorage
    clearRegistrationFields();
}

function login(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');

    loginError.textContent = '';

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        window.location.href = 'groceryList.html'; // Redirect to grocery list page
    } else {
        loginError.textContent = 'Invalid username or password!';
    }
}

function clearRegistrationFields() {
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
}