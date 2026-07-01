document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('consultationForm');
    const submitBtn = document.getElementById('consultationSubmitBtn');
    const dateInput = document.getElementById('consultDate');
    const errorEl = document.getElementById('consultationError');
    const successEl = document.getElementById('consultationSuccess');

    if (!form || !submitBtn || !dateInput) return;

    const setMinDateToToday = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const today = `${yyyy}-${mm}-${dd}`;
        dateInput.min = today;
        if (!dateInput.value) dateInput.value = today;
    };

    const hideStatus = () => {
        if (errorEl) errorEl.hidden = true;
        if (successEl) successEl.hidden = true;
    };

    setMinDateToToday();
    form.addEventListener('input', hideStatus);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideStatus();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const date = String(formData.get('date') || '').trim();
        const message = String(formData.get('message') || '').trim();

        const digits = phone.replace(/[^\d]/g, '');
        if (digits.length < 10) {
            if (errorEl) {
                errorEl.textContent = 'Please enter a valid phone number.';
                errorEl.hidden = false;
            }
            return;
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';
        form.setAttribute('aria-busy', 'true');

        try {
            const firebase = window.firebase;
            if (!firebase || !firebase.firestore) {
                throw new Error('Firebase is not available. Please try again in a moment.');
            }
            if (!firebase.apps || !firebase.apps.length) {
                throw new Error('Firebase is not initialized. Please refresh and try again.');
            }

            const db = firebase.firestore();
            const createdAt = firebase.firestore.FieldValue && firebase.firestore.FieldValue.serverTimestamp
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date();

            await db.collection('consultations').add({
                name,
                email,
                phone,
                date,
                message,
                createdAt,
            });

            if (successEl) successEl.hidden = false;
            form.reset();
            setMinDateToToday();

            const whatsappNumber = '918208811046';
            const whatsappMessage =
                `🛋️ Interior Studio Pune\n\n` +
                `📌 New Consultation Request\n\n` +
                `👤 Name: ${name}\n` +
                `📧 Email: ${email}\n` +
                `📱 Phone: ${phone}\n` +
                `📅 Date: ${date}\n\n` +
                `📝 Message:\n${message}`;
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
        } catch (err) {
            const msg = err && err.message ? err.message : 'Something went wrong. Please try again.';
            if (errorEl) {
                errorEl.textContent = msg;
                errorEl.hidden = false;
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            form.removeAttribute('aria-busy');
        }
    });
});

