/**
 * Apviron — Contact Form Handler
 * Validates form data, stores in Firebase Firestore, handles modal.
 */
import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');

    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();

        // Gather values
        const name = getValue('name');
        const email = getValue('email');
        const phone = getValue('phone');
        const subject = getValue('subject');
        const message = getValue('message');

        // Validate
        let isValid = true;

        if (!name.trim()) {
            showError('name', 'Name is required.');
            isValid = false;
        }

        if (!email.trim()) {
            showError('email', 'Email is required.');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email', 'Please enter a valid email address.');
            isValid = false;
        }

        if (!message.trim()) {
            showError('message', 'Message is required.');
            isValid = false;
        }

        if (!isValid) return;

        // Set loading state
        setLoading(true);

        try {
            // Write to Firestore "contact_messages" collection
            await addDoc(collection(db, 'contact_messages'), {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || '',
                subject: subject.trim() || '',
                message: message.trim(),
                isRead: false,
                createdAt: serverTimestamp()
            });

            // Success! Show modal
            openModal();
            form.reset();

        } catch (err) {
            console.error('Contact form error:', err);
            alert('Unable to submit your inquiry. Please try again or contact us directly.');
        } finally {
            setLoading(false);
        }
    });

    // --- Modal Logic ---
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    function openModal() {
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // --- Helpers ---
    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function showError(id, msg) {
        const input = document.getElementById(id);
        if (!input) return;
        const floatingGroup = input.closest('.form-floating');
        if (floatingGroup) {
            floatingGroup.classList.add('error');
            const errorEl = floatingGroup.querySelector('.error-msg');
            if (errorEl) errorEl.textContent = msg;
        }
    }

    function clearErrors() {
        document.querySelectorAll('.form-floating.error').forEach(function (g) {
            g.classList.remove('error');
            const err = g.querySelector('.error-msg');
            if (err) err.textContent = '';
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setLoading(loading) {
        if (!submitBtn) return;
        if (loading) {
            submitBtn.classList.add('btn--loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
        }
    }
});
