document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu overlay logic ONLY
    const hamburger = document.getElementById('hamburger-menu');
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

    // --- Bouncy Ball Physics and Dog Animation in Profile Header (Canvas Only Dog, Enhanced) ---
    (function() {
        const canvas = document.getElementById('bouncy-ball-canvas');
        const header = document.getElementById('profile-header');
        if (!canvas || !header) return;
        const ctx = canvas.getContext('2d');
        let W = 320, H = 120;
        function resizeCanvas() {
            W = header.clientWidth;
            H = header.clientHeight;
            canvas.width = W;
            canvas.height = H;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Ball and dog state
        const R = 6; // Ball is 200% smaller
        let ball = {
            x: W/2,
            y: R + 2,
            vx: (Math.random()-0.5)*2,
            vy: 0,
            radius: R,
            color: '#e53935',
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0
        };
        const gravity = 0.55;
        const bounce = 0.72;
        const friction = 0.98;
        let lastTime = null;
        let animationFrame;
        let restTimer = 0;
        let dogActive = false;
        let dog = null;
        let frameCount = 0;
        let dogHasFetched = false;
        let dogJumping = false;
        let jumpReadyTimer = 0;
        let fetchTarget = null;
        let dogHoldingBall = false;
        let dogExiting = false;
        let lastMouse = {x: W/2, y: H-64};

        // Mouse tracking for return
        canvas.addEventListener('mousemove', function(e) {
            const rect = canvas.getBoundingClientRect();
            lastMouse.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            lastMouse.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        });
        canvas.addEventListener('touchmove', function(e) {
            const rect = canvas.getBoundingClientRect();
            lastMouse.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            lastMouse.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        });

        // Pixel border collie drawing
        function drawPixelCollie(ctx, x, y, frame, facingLeft, jumping, runPhase) {
            const px = 4;
            const C = {
                B: '#222', W: '#fff', G: '#888', T: '#b77b4b', P: '#e0cfa6', N: '#c96', E: '#222', S: '#555',
            };
            const dogMap = [
                '.....BBBB.......',
                '....BWWWWB......',
                '...BWWWWWWB.....',
                '...BWWWWWWB.....',
                '..BWWWWWWWWB....',
                '..BWWWWWWWWB....',
                '..BWWWBWWWWB....',
                '..BWWWBWWWWB....',
                '..BWWWWWWWWB....',
                '..BWWWWWWWWB....',
                '...BWWWWWWB.....',
                '...BWWWWWWB.....',
                '....BWWWWB......',
                '.....BBBB.......',
                '....P....P......',
                '...P......P.....',
            ];
            let legOffset = jumping ? -Math.abs(Math.sin(frame/6))*4 : Math.sin(runPhase/3)*2;
            ctx.save();
            ctx.translate(x, y);
            if (facingLeft) ctx.scale(-1, 1);
            for (let row = 0; row < dogMap.length; row++) {
                for (let col = 0; col < dogMap[row].length; col++) {
                    let color = null;
                    switch (dogMap[row][col]) {
                        case 'B': color = C.B; break;
                        case 'W': color = C.W; break;
                        case 'G': color = C.G; break;
                        case 'T': color = C.T; break;
                        case 'P': color = C.P; break;
                        case 'N': color = C.N; break;
                        case 'E': color = C.E; break;
                        case 'S': color = C.S; break;
                        default: color = null;
                    }
                    if (color) {
                        let yOffset = 0;
                        if (row >= 14 && (col === 4 || col === 7 || col === 11 || col === 14)) {
                            yOffset = legOffset;
                        }
                        ctx.fillStyle = color;
                        ctx.fillRect(col*px, row*px + yOffset, px, px);
                    }
                }
            }
            ctx.fillStyle = C.E;
            ctx.fillRect((facingLeft ? 4 : 11)*px, 5*px, px, px);
            ctx.restore();
        }

        // Animation loop
        function animate(time) {
            frameCount++;
            if (!lastTime) lastTime = time;
            let dt = (time - lastTime) / 16.67;
            lastTime = time;
            // Clear canvas ONCE per frame
            ctx.clearRect(0,0,W,H);
            // Ball physics (keep moving during fetch)
            if (!ball.isDragging && !dogHoldingBall && !dogExiting) {
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
                if (ball.y - ball.radius < 0) {
                    ball.y = ball.radius;
                    ball.vy *= -bounce;
                }
                if (ball.x - ball.radius < 0) {
                    ball.x = ball.radius;
                    ball.vx *= -bounce;
                }
                if (ball.x + ball.radius > W) {
                    ball.x = W - ball.radius;
                    ball.vx *= -bounce;
                }
            }
            // Draw ball
            ctx.save();
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
            ctx.fillStyle = ball.color;
            ctx.shadowColor = '#b71c1c';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(ball.x-ball.radius/3, ball.y-ball.radius/3, ball.radius/3, 0, 2*Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fill();
            ctx.restore();
            // Draw dog if active or jumping or holding ball or exiting
            if ((dogActive && dog) || dogJumping || dogHoldingBall || dogExiting) {
                let dogY = dogActive && dog ? dog.y : H-64;
                let dogX = dogActive && dog ? dog.x : W-64;
                let facingLeft = true;
                let runPhase = frameCount;
                // If jumping, jump from directly beneath the ball
                if (dogJumping && !dogActive) {
                    dogX = ball.x-24;
                    let jumpT = (Math.sin(frameCount/20)+1)/2;
                    let jumpHeight = (ball.y-24)*1.6;
                    dogY = H-64 - jumpT*jumpHeight;
                }
                // If chasing, move from last jump position to ball
                if (dogActive && dog && fetchTarget) {
                    let dx = fetchTarget.x - dog.x;
                    let dy = fetchTarget.y - dog.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let speed = 2;
                    if (dist > speed) {
                        dog.x += dx/dist*speed;
                        dog.y += dy/dist*speed;
                    } else {
                        dog.x = fetchTarget.x;
                        dog.y = fetchTarget.y;
                        dogActive = false;
                        dogHoldingBall = true;
                    }
                }
                // If holding ball, move both to mouse position
                if (dogHoldingBall) {
                    let dx = lastMouse.x - dogX;
                    let dy = lastMouse.y - dogY;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let speed = 2;
                    if (dist > speed) {
                        dogX += dx/dist*speed;
                        dogY += dy/dist*speed;
                        ball.x = dogX+24;
                        ball.y = dogY+24;
                    } else {
                        dogX = lastMouse.x;
                        dogY = lastMouse.y;
                        ball.x = dogX+24;
                        ball.y = dogY+24;
                        dogHoldingBall = false;
                        dogExiting = true;
                    }
                }
                // If exiting, move dog left out of panel
                if (dogExiting) {
                    dogX -= 3;
                    if (dogX < -64) {
                        dogExiting = false;
                        dog = null;
                    }
                }
                drawPixelCollie(ctx, dogX, dogY, frameCount, facingLeft, dogJumping, runPhase);
            }
            // Detect rest for fetch
            if (!ball.isDragging && !dogActive && !dogHasFetched && !dogHoldingBall && !dogExiting && Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2 && ball.y + ball.radius >= H - 1) {
                restTimer += dt;
                if (restTimer > 60) { // ~1 second
                    triggerDog();
                    restTimer = 0;
                }
            } else {
                restTimer = 0;
            }
            animationFrame = requestAnimationFrame(animate);
        }

        // Drag/throw logic
        let dragStart = null;
        let lastDrag = null;
        function pointerDown(e) {
            if (dogActive) return;
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
                jumpReadyTimer = 0;
            }
        }
        function pointerMove(e) {
            if (!ball.isDragging || dogActive) return;
            const rect = canvas.getBoundingClientRect();
            const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            ball.x = Math.max(ball.radius, Math.min(W-ball.radius, px - ball.dragOffsetX));
            ball.y = Math.max(ball.radius, Math.min(H-ball.radius, py - ball.dragOffsetY));
            lastDrag = {x: px, y: py, time: Date.now()};
            // Lower threshold for jump (from 1/4 to 1/2 height)
            if (ball.y < H/2) {
                jumpReadyTimer += 1/60; // assuming ~60fps
                if (jumpReadyTimer > 1.5 && !dogJumping) {
                    dogJumping = true;
                }
            } else {
                jumpReadyTimer = 0;
                dogJumping = false;
            }
        }
        function pointerUp(e) {
            if (!ball.isDragging || dogActive) return;
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
            // After throw, allow dog to fetch again
            dogHasFetched = false;
            // If dog was jumping, immediately chase the ball from last jump position
            if (dogJumping) {
                dogJumping = false;
                dog = {x: ball.x-24, y: H-64};
                fetchTarget = {x: ball.x-24, y: ball.y-24};
                dogActive = true;
            }
        }
        canvas.addEventListener('mousedown', pointerDown);
        canvas.addEventListener('mousemove', pointerMove);
        window.addEventListener('mouseup', pointerUp);
        canvas.addEventListener('touchstart', pointerDown, {passive:false});
        canvas.addEventListener('touchmove', pointerMove, {passive:false});
        window.addEventListener('touchend', pointerUp);

        function triggerDog() {
            if (dogActive || dogHasFetched) return;
            dogActive = true;
            dogHasFetched = true;
            dog = {x: W+64, y: H-64};
            fetchTarget = {x: ball.x-24, y: ball.y-24};
        }

        // Start animation on page load
        animationFrame = requestAnimationFrame(animate);
    })();
});