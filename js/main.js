// Bascule Papier (clair) / Ardoise (sombre)
(function () {
    const STORAGE_KEY = 'eb_editorial_theme';
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');

    function setTheme(theme) {
        const valid = theme === 'slate' ? 'slate' : 'paper';
        root.setAttribute('data-theme', valid);
        if (label) {
            label.textContent = valid === 'paper' ? 'Papier' : 'Ardoise';
        }
        if (btn) {
            btn.setAttribute('aria-pressed', String(valid === 'slate'));
        }
        try {
            localStorage.setItem(STORAGE_KEY, valid);
        } catch (_) {}
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'paper' || saved === 'slate') {
            setTheme(saved);
        } else {
            setTheme(root.getAttribute('data-theme'));
        }
    } catch (_) {
        setTheme(root.getAttribute('data-theme'));
    }

    if (btn) {
        btn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'paper' ? 'slate' : 'paper';
            setTheme(next);
        });
    }
})();

// Menu mobile
(function () {
    const menuBtn = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
})();

// Boutons de copie rapide
(function () {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const value = btn.getAttribute('data-copy');
            if (!value) return;
            try {
                await navigator.clipboard.writeText(value);
                const prev = btn.textContent;
                btn.textContent = 'Copié';
                setTimeout(() => {
                    btn.textContent = prev;
                }, 1600);
            } catch (_) {}
        });
    });
})();

// Formulaire de contact + déblocage du 06 62 88 86 12
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const feedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');
    const phoneLocked = document.getElementById('phoneLocked');
    const phoneUnlocked = document.getElementById('phoneUnlocked');
    const copyPhoneBtn = document.getElementById('copyPhoneBtn');
    const PHONE_KEY = 'eb_phone_unlocked';

    function unlockPhone() {
        if (phoneLocked) phoneLocked.style.display = 'none';
        if (phoneUnlocked) phoneUnlocked.style.display = 'inline';
        if (copyPhoneBtn) copyPhoneBtn.style.display = 'inline-block';
        try {
            localStorage.setItem(PHONE_KEY, '1');
        } catch (_) {}
    }

    try {
        if (localStorage.getItem(PHONE_KEY) === '1') {
            unlockPhone();
        }
    } catch (_) {}

    function showFeedback(type, text) {
        if (!feedback) return;
        feedback.className = 'form-feedback show ' + type;
        feedback.textContent = text;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById('name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            subject: document.getElementById('subject')?.value.trim() || 'Contact portfolio',
            message: document.getElementById('message')?.value.trim() || ''
        };

        if (!payload.name || !payload.email || !payload.message) {
            showFeedback('err', 'Merci de renseigner votre nom, votre courriel et votre message.');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch('send-contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                unlockPhone();
                showFeedback('ok', 'Message envoyé à contact@ebarbault.fr. Mon numéro direct est désormais débloqué.');
                form.reset();
            } else {
                throw new Error('HTTP ' + response.status);
            }
        } catch (_) {
            // Fallback mailto si exécuté sans serveur PHP + déblocage du numéro
            unlockPhone();
            const mailtoUrl =
                'mailto:contact@ebarbault.fr?subject=' +
                encodeURIComponent(payload.subject) +
                '&body=' +
                encodeURIComponent('De : ' + payload.name + ' (' + payload.email + ')\n\n' + payload.message);
            showFeedback('ok', 'Numéro direct débloqué (06 62 88 86 12). Ouverture de votre messagerie vers contact@ebarbault.fr...');
            window.location.href = mailtoUrl;
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
})();
