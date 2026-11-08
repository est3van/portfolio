// ============================================
// MOBILE NAV
// ============================================
(function() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const expanded = mainNav.classList.contains('active');
            mobileToggle.setAttribute('aria-expanded', expanded);
        });
    }
})();

// ============================================
// CONTACT FORM
// ============================================
(function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const data = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            subject: document.getElementById('subject').value.trim() || 'Sans objet',
            message: document.getElementById('message').value.trim()
        };

        showStatus('loading', 'Envoi en cours...');
        submitBtn.disabled = true;

        try {
            const res = await fetch('send-contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const json = await res.json();

            if (res.ok && json.success) {
                showStatus('success', 'Message envoyé. Je vous réponds rapidement.');
                form.reset();
            } else {
                throw new Error(json.error || 'Erreur inconnue');
            }
        } catch (err) {
            console.error(err);
            showStatus('error', 'Erreur lors de l\'envoi. Contactez-moi directement par email.');
        } finally {
            submitBtn.disabled = false;
        }
    });

    function showStatus(type, msg) {
        statusEl.className = 'form-status show ' + type;
        statusEl.textContent = msg;
        if (type !== 'loading') {
            setTimeout(function() { statusEl.classList.remove('show'); }, 5000);
        }
    }
})();