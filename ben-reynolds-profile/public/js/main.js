document.addEventListener('DOMContentLoaded', function() {
    // Check if coming from welcome page
    const targetSection = localStorage.getItem('targetSection');
    if (targetSection) {
        // Clear storage so it doesn't persist on refresh
        localStorage.removeItem('targetSection');
        // Navigate to the target section
        const navBtn = document.querySelector(`.nav-link[data-target="${targetSection}"]`);
        if (navBtn) {
            navBtn.click();
        }
    }

    // Set body class for home page nav visibility
    function updateBodyClass(targetId) {
        if (targetId === 'home') {
            document.body.classList.add('on-home');
        } else {
            document.body.classList.remove('on-home');
        }
    }

    // SPA navigation (main nav only)
    function animateSectionChange(targetId) {
        updateBodyClass(targetId);
        const profileHeader = document.getElementById('profile-header');
        // Show profile header only on home
        if (targetId === 'home') {
            profileHeader.style.display = 'flex';
        } else {
            profileHeader.style.display = 'none';
        }
        // Animate section change
        const mainContent = document.getElementById('main-content');
        mainContent.classList.add('fade-shrink');
        setTimeout(() => {
            document.querySelectorAll('main > section').forEach(section => {
                section.style.display = 'none';
            });
            const targetSection = document.getElementById(targetId);
            targetSection.style.display = 'block';
            const h1 = targetSection.querySelector('.typed-title');
            if (h1) {
                h1.classList.remove('type-out');
                void h1.offsetWidth;
                h1.classList.add('type-out');
                setTimeout(() => h1.classList.remove('type-out'), 1200); // Ensure animation ends
            }
            mainContent.classList.remove('fade-shrink');
        }, 400);
    }

    // Main nav buttons (now always visible)
    document.querySelectorAll('#main-nav .nav-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('#main-nav .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            animateSectionChange(this.dataset.target);
        });
    });

    // Simple search bar filter (filters visible text in all sections)
    const searchInput = document.getElementById('siteSearch');
    const sections = document.querySelectorAll('main > section');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        sections.forEach(section => {
            if (section.innerText.toLowerCase().includes(query)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        if (!query) {
            // Show only the active section if search is cleared
            const active = document.body.classList.contains('on-home') ? 'home' : document.querySelector('main > section[style*="display: block"]').id;
            sections.forEach(section => {
                section.style.display = (section.id === active) ? 'block' : 'none';
            });
        }
    });

    // Set initial body class
    updateBodyClass('home');
});