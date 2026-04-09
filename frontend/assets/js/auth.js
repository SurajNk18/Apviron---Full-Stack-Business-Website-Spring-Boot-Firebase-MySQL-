/**
 * Apviron — Authentication Module (Admin-Only, Email + Password)
 * 
 * Only admins can log in using email and password.
 * Regular users/visitors do NOT need to log in.
 * 
 * Flow:
 *   1. Admin enters email + password on login page
 *   2. Firebase authenticates credentials
 *   3. We check if the email is in the ADMIN_EMAILS list
 *   4. If yes → store session, redirect to admin dashboard
 *   5. If no → sign out, show "Access denied"
 * 
 * Setup:
 *   1. Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password
 *   2. Go to Authentication → Users → Add User → Enter admin email + password
 *   3. Add that same email to the ADMIN_EMAILS array below
 */

import {
    auth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    db,
    collection,
    getDocs,
    query,
    where
} from './firebase-config.js';

// ──────────────────────────────────────────────────────────────
// 🔑 ADMIN EMAILS — Add your admin email(s) here
// Only these emails can access the admin dashboard.
// ──────────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
    'admin@apviron.com',
    'admin@gmail.com',
];

// ── Configuration ──────────────────────────────────────────────
const LOGIN_PAGE = '/frontend/login.html';
const ADMIN_DASHBOARD = '/frontend/admin/dashboard.html';
const HOME_PAGE = '/frontend/index.html';

// ── Helper: Show error/success messages ────────────────────────
function showMessage(elementId, message, isError = true) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = 'auth-message ' + (isError ? 'auth-message--error' : 'auth-message--success');
    el.style.display = 'block';
}

function hideMessage(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span>Signing in...</span>';
        btn.disabled = true;
        btn.classList.add('btn--loading');
    } else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        btn.disabled = false;
        btn.classList.remove('btn--loading');
    }
}

// ── Check if email is admin (hardcoded list + Firestore) ───────
function isAdminEmailSync(email) {
    return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

async function isAdminEmail(email) {
    // Check hardcoded list first
    if (isAdminEmailSync(email)) return true;

    // Then check Firestore admins collection
    try {
        const q = query(collection(db, 'admins'), where('email', '==', email.toLowerCase()));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
    }
}

// ══════════════════════════════════════════════════════════════
// LOGIN WITH EMAIL + PASSWORD (Admin Only)
// ══════════════════════════════════════════════════════════════
async function loginAdmin(event) {
    event.preventDefault();
    hideMessage('authMessage');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const submitBtn = document.getElementById('loginBtn');

    // Validation
    if (!email) {
        showMessage('authMessage', 'Please enter your email address.');
        return;
    }
    if (!password) {
        showMessage('authMessage', 'Please enter your password.');
        return;
    }

    setButtonLoading(submitBtn, true);

    try {
        // Step 1: Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Check if this email is an admin
        const isAdmin = await isAdminEmail(user.email);
        if (!isAdmin) {
            await signOut(auth);
            showMessage('authMessage', 'Access denied. This login is for administrators only.');
            return;
        }

        // Step 3: Store admin session
        const adminData = {
            fullName: user.displayName || user.email.split('@')[0],
            email: user.email,
            role: 'ADMIN',
            redirectUrl: ADMIN_DASHBOARD
        };

        sessionStorage.setItem('apviron_user', JSON.stringify(adminData));
        const idToken = await user.getIdToken();
        sessionStorage.setItem('apviron_token', idToken);

        // Step 4: Redirect to admin dashboard
        showMessage('authMessage', 'Welcome back, Admin! Redirecting...', false);

        setTimeout(() => {
            window.location.href = ADMIN_DASHBOARD;
        }, 800);

    } catch (error) {
        console.error('Login error:', error);
        let message = 'Login failed. Please try again.';

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Please enter a valid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/invalid-credential') {
            message = 'Invalid email or password.';
        }

        showMessage('authMessage', message);
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ══════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════
async function logoutUser() {
    try {
        await signOut(auth);
        sessionStorage.removeItem('apviron_user');
        sessionStorage.removeItem('apviron_token');
        window.location.href = HOME_PAGE;
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

// ══════════════════════════════════════════════════════════════
// AUTH STATE OBSERVER — Updates navbar on every page
// ══════════════════════════════════════════════════════════════
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        updateNavbar(user);
    });
}

// ══════════════════════════════════════════════════════════════
// DYNAMIC NAVBAR — Shows admin links only when admin is logged in
// ══════════════════════════════════════════════════════════════
function updateNavbar(firebaseUser) {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    let authContainer = document.getElementById('navAuthLinks');
    if (authContainer) authContainer.remove();

    authContainer = document.createElement('div');
    authContainer.id = 'navAuthLinks';
    authContainer.className = 'navbar__auth-links';

    if (firebaseUser) {
        const storedUser = JSON.parse(sessionStorage.getItem('apviron_user') || '{}');

        if (storedUser.role === 'ADMIN') {
            const displayName = storedUser.fullName || firebaseUser.email;
            authContainer.innerHTML = `
                <a href="${ADMIN_DASHBOARD}" class="navbar__link">
                    <span class="nav-icon"><i class="fas fa-chart-bar"></i></span> Dashboard
                </a>
                <span class="navbar__user-badge">
                    <span class="user-avatar">${displayName.charAt(0).toUpperCase()}</span>
                    ${displayName.split(' ')[0]}
                </span>
                <a href="#" class="navbar__link navbar__cta btn btn--primary btn--sm" id="navLogoutBtn">Logout</a>
            `;
        }
    }

    navMenu.appendChild(authContainer);

    const logoutBtn = document.getElementById('navLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
}

// ══════════════════════════════════════════════════════════════
// PROTECTED PAGE GUARD — For admin dashboard pages
// ══════════════════════════════════════════════════════════════
function requireAuth(requiredRole = null) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = LOGIN_PAGE;
            return;
        }

        if (requiredRole === 'ADMIN') {
            const storedUser = JSON.parse(sessionStorage.getItem('apviron_user') || '{}');
            const isAdmin = await isAdminEmail(user.email);
            if (storedUser.role !== 'ADMIN' || !isAdmin) {
                await signOut(auth);
                sessionStorage.clear();
                window.location.href = LOGIN_PAGE;
            }
        }
    });
}

// ══════════════════════════════════════════════════════════════
// ATTACH EVENT LISTENERS
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();

    // Admin login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', loginAdmin);
    }
});

// Export for dashboard pages
export { logoutUser, requireAuth, checkAuthState, ADMIN_EMAILS, isAdminEmail };
