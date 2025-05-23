document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger-menu');
    const sideMenu = document.getElementById('side-menu');
    hamburger.addEventListener('click', function() {
        sideMenu.style.display = 'block';
        setTimeout(() => sideMenu.classList.toggle('open'), 10);
    });
    // Close side menu on link click
    sideMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            sideMenu.classList.remove('open');
            setTimeout(() => sideMenu.style.display = 'none', 350);
        });
    });
    // Dropdown logic for side menu
    sideMenu.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            if (submenu) {
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Hamburger menu overlay logic
    const menuOverlay = document.getElementById('menu-overlay');
    hamburger.addEventListener('click', function() {
        menuOverlay.style.display = 'flex';
        setTimeout(() => menuOverlay.classList.add('open'), 10);
    });
    // Close overlay on menu link click or outside click
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            menuOverlay.classList.remove('open');
            setTimeout(() => menuOverlay.style.display = 'none', 300);
        }
    });
    menuOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            menuOverlay.classList.remove('open');
            setTimeout(() => menuOverlay.style.display = 'none', 300);
        });
    });
    // Dropdown logic for overlay
    menuOverlay.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });

    // Set body class for home page nav/hamburger visibility
    function updateBodyClass(targetId) {
        if (targetId === 'home') {
            document.body.classList.add('on-home');
        } else {
            document.body.classList.remove('on-home');
        }
    }

    // SPA navigation (main nav, section boxes, and overlay menu)
    function animateSectionChange(targetId, linkEl) {
        updateBodyClass(targetId);
        // Hide profile header except on home
        const profileHeader = document.getElementById('profile-header');
        if (targetId === 'home') {
            profileHeader.style.display = 'flex';
        } else {
            profileHeader.style.display = 'none';
        }
        // Blank/shrink all content
        const mainContent = document.getElementById('main-content');
        mainContent.classList.add('fade-shrink');
        setTimeout(() => {
            // Hide all sections
            document.querySelectorAll('main > section').forEach(section => {
                section.style.display = 'none';
            });
            // Show and animate target section
            const targetSection = document.getElementById(targetId);
            targetSection.style.display = 'block';
            // Typed title effect (keep typed style after animation)
            const h1 = targetSection.querySelector('.typed-title');
            if (h1) {
                h1.classList.remove('type-out');
                void h1.offsetWidth; // force reflow
                h1.classList.add('type-out');
                setTimeout(() => h1.classList.remove('type-out'), 1200);
            }
            mainContent.classList.remove('fade-shrink');
        }, 400);
    }

    // Main nav buttons (welcome page)
    document.querySelectorAll('#main-nav .nav-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('#main-nav .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            animateSectionChange(this.dataset.target, this);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    // Section boxes on welcome page
    document.querySelectorAll('.section-box').forEach(box => {
        box.addEventListener('click', function(e) {
            e.preventDefault();
            animateSectionChange(this.getAttribute('href').replace('#', ''), this);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    // Overlay menu links
    menuOverlay.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's a subsection, scroll to anchor after animation
            const href = this.getAttribute('href');
            if (href.includes('-')) {
                e.preventDefault();
                const [sectionId, anchor] = href.replace('#', '').split('-');
                animateSectionChange(sectionId, this);
                setTimeout(() => {
                    document.getElementById(href.replace('#', '')).scrollIntoView({ behavior: 'smooth' });
                }, 900);
            } else {
                e.preventDefault();
                animateSectionChange(href.replace('#', ''), this);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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

    // Bouncy Ball Physics in Profile Header
    (function() {
        const canvas = document.getElementById('bouncy-ball-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const R = 22;
        let ball = {
            x: W/2,
            y: R + 2,
            vx: (Math.random()-0.5)*2,
            vy: 0,
            radius: R,
            color: '#2a5298',
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0
        };
        const gravity = 0.55;
        const bounce = 0.72;
        const friction = 0.98;
        let lastTime = null;
        let animationFrame;

        function drawBall() {
            ctx.clearRect(0,0,W,H);
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
            ctx.fillStyle = ball.color;
            ctx.shadowColor = '#1e3c72';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            // highlight
            ctx.beginPath();
            ctx.arc(ball.x-ball.radius/3, ball.y-ball.radius/3, ball.radius/3, 0, 2*Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fill();
        }

        function animate(time) {
            if (!lastTime) lastTime = time;
            let dt = (time - lastTime) / 16.67; // ~60fps
            lastTime = time;
            if (!ball.isDragging) {
                ball.vy += gravity * dt;
                ball.x += ball.vx * dt;
                ball.y += ball.vy * dt;
                // Bounce on floor
                if (ball.y + ball.radius > H) {
                    ball.y = H - ball.radius;
                    ball.vy *= -bounce;
                    ball.vx *= friction;
                    if (Math.abs(ball.vy) < 1) ball.vy = 0;
                }
                // Bounce on ceiling
                if (ball.y - ball.radius < 0) {
                    ball.y = ball.radius;
                    ball.vy *= -bounce;
                }
                // Bounce on walls
                if (ball.x - ball.radius < 0) {
                    ball.x = ball.radius;
                    ball.vx *= -bounce;
                }
                if (ball.x + ball.radius > W) {
                    ball.x = W - ball.radius;
                    ball.vx *= -bounce;
                }
            }
            drawBall();
            animationFrame = requestAnimationFrame(animate);
        }

        // Drag/throw logic
        let dragStart = null;
        let lastDrag = null;
        function pointerDown(e) {
            const rect = canvas.getBoundingClientRect();
            const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            const dx = px - ball.x;
            const dy = py - ball.y;
            if (dx*dx + dy*dy <= ball.radius*ball.radius) {
                ball.isDragging = true;
                dragStart = {x: px, y: py, time: Date.now()};
                lastDrag = {x: px, y: py, time: Date.now()};
                ball.dragOffsetX = dx;
                ball.dragOffsetY = dy;
            }
        }
        function pointerMove(e) {
            if (!ball.isDragging) return;
            const rect = canvas.getBoundingClientRect();
            const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            ball.x = Math.max(ball.radius, Math.min(W-ball.radius, px - ball.dragOffsetX));
            ball.y = Math.max(ball.radius, Math.min(H-ball.radius, py - ball.dragOffsetY));
            lastDrag = {x: px, y: py, time: Date.now()};
        }
        function pointerUp(e) {
            if (!ball.isDragging) return;
            ball.isDragging = false;
            // Throw velocity
            const now = Date.now();
            const dt = (now - lastDrag.time) / 1000;
            if (dt < 0.15) {
                ball.vx = (lastDrag.x - dragStart.x) / Math.max(1, (now-dragStart.time)/16.67) * 0.7;
                ball.vy = (lastDrag.y - dragStart.y) / Math.max(1, (now-dragStart.time)/16.67) * 0.7;
            }
            dragStart = null;
            lastDrag = null;
        }
        canvas.addEventListener('mousedown', pointerDown);
        canvas.addEventListener('mousemove', pointerMove);
        window.addEventListener('mouseup', pointerUp);
        canvas.addEventListener('touchstart', pointerDown, {passive:false});
        canvas.addEventListener('touchmove', pointerMove, {passive:false});
        window.addEventListener('touchend', pointerUp);

        // Start animation on page load
        drawBall();
        animationFrame = requestAnimationFrame(animate);
    })();
});