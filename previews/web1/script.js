const form = document.getElementById("registration-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const fields = [username, email, password, confirmPassword];

function formatFieldName(input) {
    return input.id === "confirmPassword"
        ? "Confirm Password"
        : input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

function showError(input, message) {
    const group = input.parentElement;
    group.classList.remove("success");
    group.classList.add("error");
    group.querySelector("small").textContent = message;
    input.setAttribute("aria-invalid", "true");
}

function showSuccess(input) {
    const group = input.parentElement;
    group.classList.remove("error");
    group.classList.add("success");
    group.querySelector("small").textContent = "";
    input.setAttribute("aria-invalid", "false");
}

function checkRequired(inputArray) {
    let isValid = true;
    inputArray.forEach((input) => {
        if (input.value.trim() === "") {
            showError(input, `${formatFieldName(input)} is required`);
            isValid = false;
        }
    });
    return isValid;
}

function checkLength(input, min, max) {
    if (input.value.length < min) {
        showError(input, `${formatFieldName(input)} must be at least ${min} characters.`);
        return false;
    }
    if (input.value.length > max) {
        showError(input, `${formatFieldName(input)} must be at most ${max} characters.`);
        return false;
    }
    showSuccess(input);
    return true;
}

function checkEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value.trim())) {
        showError(input, "Email is not valid");
        return false;
    }
    showSuccess(input);
    return true;
}

function checkPasswordsMatch(input1, input2) {
    if (input1.value !== input2.value) {
        showError(input2, "Passwords do not match");
        return false;
    }
    showSuccess(input2);
    return true;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    username.value = username.value.trim();
    email.value = email.value.trim();

    // Validate populated fields too, so one empty field does not hide other errors.
    let isFormValid = checkRequired(fields);
    if (username.value) isFormValid = checkLength(username, 3, 15) && isFormValid;
    if (email.value) isFormValid = checkEmail(email) && isFormValid;
    if (password.value.trim()) isFormValid = checkLength(password, 6, 15) && isFormValid;
    if (confirmPassword.value.trim()) {
        isFormValid = checkPasswordsMatch(password, confirmPassword) && isFormValid;
    }

    if (!isFormValid) {
        fields.find((input) => input.getAttribute("aria-invalid") === "true").focus();
        return;
    }

    // This exercise demonstrates client-side validation only.
    alert("Registration successful!");
    form.reset();
    fields.forEach((input) => {
        input.parentElement.classList.remove("error", "success");
        input.parentElement.querySelector("small").textContent = "";
        input.removeAttribute("aria-invalid");
    });
    username.focus();
});
