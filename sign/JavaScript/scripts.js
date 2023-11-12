function validateEmailPassword(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!(email && password)) {
        errorSpan.innerHTML = 'All fields are required.'
        return false;
    } else if (!emailRegex.test(email)) {
        errorSpan.innerHTML = 'Please enter a valid email address.';
        return false;
    } else if (password.length < 7) {
        errorSpan.innerHTML = 'Password must be at least 7 characters long.';
        return false;
    }
    errorSpan.innerHTML = '';
    return true;
}
signBtn.onclick = function (e) {
    if (signBtn.innerHTML == 'Sign Up') {
        signH2.innerHTML = 'Sign Up';
        signBtn.innerHTML = 'Sign In';
        signinBtn.style.display = 'none';
        signupBtn.style.display = 'block';
        nameInput.style.display = 'block';
    } else {
        signH2.innerHTML = 'Log In';
        signBtn.innerHTML = 'Sign Up';
        signinBtn.style.display = 'block';
        signupBtn.style.display = 'none';
        nameInput.style.display = 'none';
    }
};