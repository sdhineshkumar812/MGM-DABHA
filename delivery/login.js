/* ==========================================================================
   MGM DABHA - Delivery Personnel Authentication JavaScript (login.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('delivery-login-form');
    if (form) {
        form.addEventListener('submit', handleDeliveryLoginSubmit);
    }
});

function togglePasswordVisibility() {
    const pwd = document.getElementById('password-input');
    const icon = document.querySelector('.toggle-password');
    if (pwd) {
        if (pwd.type === 'password') {
            pwd.type = 'text';
            if (icon) icon.className = 'fas fa-eye-slash toggle-password';
        } else {
            pwd.type = 'password';
            if (icon) icon.className = 'fas fa-eye toggle-password';
        }
    }
}

async function handleDeliveryLoginSubmit(e) {
    e.preventDefault();

    const phoneInput = document.getElementById('mobile-input');
    const passwordInput = document.getElementById('password-input');

    const phone = phoneInput ? phoneInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!/^\d{10}$/.test(phone)) {
        showToast('Mobile number must contain exactly 10 digits.', false);
        return;
    }

    if (!password) {
        showToast('Password cannot be empty.', false);
        return;
    }

    const btn = document.getElementById('login-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Logging in...`;
    }

    try {
        const response = await fetch('/delivery/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showToast(data.message || 'Login successful', true);
            // Store rider information in localStorage
            localStorage.setItem('mgm_rider', JSON.stringify(data.rider));

            setTimeout(() => {
                window.location.href = '/delivery/dashboard.html';
            }, 1000);
        } else {
            // Display backend error message cleanly
            showToast(data.message || 'Invalid Mobile Number or Password', false);
        }
    } catch (err) {
        console.error('Delivery Login Network/Server Error:', err);
        showToast('Network/Server connection error. Please try again.', false);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login to Dashboard`;
        }
    }
}

function showToast(msg, isSuccess = true) {
    const toast = document.getElementById('login-toast');
    const icon = document.getElementById('toast-icon');
    const msgSpan = document.getElementById('toast-msg');

    if (!toast || !msgSpan) {
        alert(msg);
        return;
    }

    msgSpan.textContent = msg;

    if (isSuccess) {
        toast.className = 'success';
        if (icon) icon.className = 'fas fa-check-circle';
    } else {
        toast.className = 'error';
        if (icon) icon.className = 'fas fa-exclamation-circle';
    }

    toast.style.display = 'flex';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}
