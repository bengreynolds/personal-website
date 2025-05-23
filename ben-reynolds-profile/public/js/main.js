document.addEventListener('DOMContentLoaded', function() {
    // SPA navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const target = this.getAttribute('href').replace('#', '');
            sections.forEach(section => {
                section.style.display = (section.id === target) ? 'block' : 'none';
            });
        });
    });
    // Simple search bar filter (filters visible text in all sections)
    const searchInput = document.getElementById('siteSearch');
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
            const active = document.querySelector('.nav-link.active').getAttribute('href').replace('#', '');
            sections.forEach(section => {
                section.style.display = (section.id === active) ? 'block' : 'none';
            });
        }
    });
});