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

    // --- Bouncy Ball Physics and Dog Animation in Profile Header (Canvas Only Dog, Enhanced) ---
    let dogBallAnimationFrame = null;
    function initDogBallAnimation() {
        // Cancel previous animation if any
        if (dogBallAnimationFrame) {
            cancelAnimationFrame(dogBallAnimationFrame);
            dogBallAnimationFrame = null;
        }
        const canvas = document.getElementById('bouncy-ball-canvas');
        const header = document.getElementById('profile-header');
        if (!canvas || !header || header.style.display === 'none') return;
        const ctx = canvas.getContext('2d');
        let W = header.clientWidth, H = header.clientHeight;
        function resizeCanvas() {
            W = header.clientWidth;
            H = header.clientHeight;
            canvas.width = W;
            canvas.height = H;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        // Ball and dog state
        const R = 16;
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
        let dogReturning = false;
        let dogStartX = 32;
        let dogStartY = H-64;
        let lastMouse = {x: W/2, y: H-64};
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
        const dogImg = new window.Image();
        let dogImgLoaded = false;
        dogImg.onload = function() { dogImgLoaded = true; };
        dogImg.src = './dog.png';
        function drawDogImage(ctx, x, y, facingLeft) {
            if (!dogImgLoaded) return;
            ctx.save();
            ctx.translate(x, y);
            if (facingLeft) ctx.scale(-1, 1);
            ctx.drawImage(dogImg, facingLeft ? -64 : 0, 0, 64, 64);
            ctx.restore();
        }
        let mouseInPanel = false;
        let patrolDir = 1;
        let patrolMinX = 32, patrolMaxX = () => W-64;
        let ballState = 3;
        function animate(time) {
            frameCount++;
            if (!lastTime) lastTime = time;
            let dt = (time - lastTime) / 16.67;
            lastTime = time;
            ctx.clearRect(0,0,W,H);
            if (!ball.isDragging && !dogHoldingBall && !dogExiting && !dogReturning) {
                ball.vy += gravity * dt;
                ball.x += ball.vx * dt;
                ball.y += ball.vy * dt;
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
            if (ball.isDragging) {
                ballState = 1;
                if (dog && Math.abs(ball.x - (dog.x+32)) < 32 && ball.y < H/2) {
                    ballState = 2;
                }
            } else if (dogHoldingBall) {
                ballState = 4;
            } else {
                ballState = 3;
            }
            if ((dogActive && dog) || dogJumping || dogHoldingBall || dogExiting || dogReturning) {
                let dogY = dogActive && dog ? dog.y : H-64;
                let dogX = dogActive && dog ? dog.x : W-64;
                let facingLeft = true;
                let runPhase = frameCount;
                if (dogJumping && !dogActive) {
                    dogX = ball.x-24;
                    let jumpT = (Math.sin(frameCount/20)+1)/2;
                    let jumpHeight = (ball.y-24)*1.6;
                    dogY = H-64 - jumpT*jumpHeight;
                }
                if (ballState === 3 && !dogActive && !dogHasFetched && !dogHoldingBall && !dogExiting && Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2 && ball.y + ball.radius >= H - 1) {
                    triggerDog();
                }
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
                if (dogHoldingBall) {
                    let targetX, targetY;
                    if (mouseInPanel) {
                        targetX = lastMouse.x - 24;
                        targetY = H-64;
                    } else {
                        if (dog.x <= patrolMinX) patrolDir = 1;
                        if (dog.x >= patrolMaxX()) patrolDir = -1;
                        targetX = dog.x + patrolDir * 2.2;
                        targetY = H-64;
                    }
                    let dx = targetX - dog.x;
                    let dy = targetY - dog.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let speed = 2.2;
                    if (dist > speed) {
                        dog.x += dx/dist*speed;
                        dog.y += dy/dist*speed;
                        ball.x = dog.x+24;
                        ball.y = dog.y+24;
                    } else {
                        dog.x = targetX;
                        dog.y = targetY;
                        ball.x = dog.x+24;
                        ball.y = dog.y+24;
                        if (mouseInPanel && Math.abs(lastMouse.x - (dog.x+24)) < 32 && Math.abs(lastMouse.y - (dog.y+24)) < 32) {
                            dogHoldingBall = false;
                            dogReturning = true;
                        }
                    }
                }
                if (dogReturning) {
                    let dx = dogStartX - dogX;
                    let dy = dogStartY - dogY;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let speed = 2.5;
                    if (dist > speed) {
                        dogX += dx/dist*speed;
                        dogY += dy/dist*speed;
                        ball.x = dogX+24;
                        ball.y = dogY+24;
                        dog.x = dogX;
                        dog.y = dogY;
                    } else {
                        dogX = dogStartX;
                        dogY = dogStartY;
                        ball.x = dogX+24;
                        ball.y = dogY+24;
                        dog.x = dogX;
                        dog.y = dogY;
                        dogReturning = false;
                        dog = null;
                        ball.vx = 0;
                        ball.vy = 0;
                        dogHasFetched = false;
                    }
                }
                if (dogExiting) {
                    dogX -= 3;
                    if (dogX < -64) {
                        dogExiting = false;
                        dog = null;
                    }
                }
                drawDogImage(ctx, dogX, dogY, facingLeft);
            }
            if (!ball.isDragging && !dogActive && !dogHasFetched && !dogHoldingBall && !dogExiting && Math.abs(ball.vx) < 0.2 && Math.abs(ball.vy) < 0.2 && ball.y + ball.radius >= H - 1) {
                restTimer += dt;
                if (restTimer > 60) {
                    triggerDog();
                    restTimer = 0;
                }
            } else {
                restTimer = 0;
            }
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
            dogBallAnimationFrame = requestAnimationFrame(animate);
        }
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
                jumpReadyTimer = 0;
                if (dogHoldingBall) {
                    dogHoldingBall = false;
                    dogReturning = false;
                    dogActive = false;
                }
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
            if (ball.y < H/2) {
                jumpReadyTimer += 1/60;
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
            const now = Date.now();
            const dt = (now - lastDrag.time) / 1000;
            if (ballState === 1) {
                ball.vx = ((lastDrag.x - dragStart.x) / dt) * 0.1;
                ball.vy = ((lastDrag.y - dragStart.y) / dt) * 0.1;
            } else if (ballState === 2) {
                ball.vx = ((lastDrag.x - dragStart.x) / dt) * 0.1;
                ball.vy = -8;
            }
            ballState = 3;
            dogJumping = false;
        }
        canvas.addEventListener('touchstart', pointerDown);
        canvas.addEventListener('touchmove', pointerMove);
        canvas.addEventListener('touchend', pointerUp);
        canvas.addEventListener('mousedown', pointerDown);
        canvas.addEventListener('mousemove', pointerMove);
        canvas.addEventListener('mouseup', pointerUp);
        canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        function triggerDog() {
            dogActive = true;
            dog = {x: dogStartX, y: dogStartY};
            fetchTarget = {x: ball.x-24, y: ball.y-24};
            dogHasFetched = true;
        }
        animate();
    }

    // SPA navigation (main nav, section boxes, and overlay menu)
    function animateSectionChange(targetId, linkEl) {
        updateBodyClass(targetId);
        // Hide profile header except on home
        const profileHeader = document.getElementById('profile-header');
        const hamburger = document.getElementById('hamburger-menu');
        if (targetId === 'home') {
            profileHeader.style.display = 'flex';
            if (hamburger) hamburger.style.display = 'none';
            setTimeout(initDogBallAnimation, 10); // (Re)initialize animation
        } else {
            profileHeader.style.display = 'none';
            if (hamburger) hamburger.style.display = 'flex';
            if (dogBallAnimationFrame) {
                cancelAnimationFrame(dogBallAnimationFrame);
                dogBallAnimationFrame = null;
            }
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
            // window.scrollTo({ top: 0, behavior: 'smooth' }); // Removed to prevent snapping to top
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
                // window.scrollTo({ top: 0, behavior: 'smooth' }); // Removed to prevent snapping to top
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
    // Initialize dog/ball animation on first load
    initDogBallAnimation();

    // --- Navigation Arrows Logic ---
    const mainSections = [
        {id: 'home', label: 'Home'},
        {id: 'about', label: 'About'},
        {id: 'timeline', label: 'Timeline'},
        {id: 'projects', label: 'Past Projects'},
        {id: 'contact', label: 'Contact'}
    ];
    function getCurrentSectionIndex() {
        for (let i = 0; i < mainSections.length; i++) {
            const sec = document.getElementById(mainSections[i].id);
            if (sec && sec.style.display === 'block') return i;
        }
        return 0;
    }
    function renderPageArrows() {
        const idx = getCurrentSectionIndex();
        const arrows = document.getElementById('page-arrows');
        arrows.innerHTML = '';
        if (idx > 0) {
            const back = document.createElement('button');
            back.innerHTML = '&#8592;';
            back.title = 'Previous';
            back.className = 'page-arrow';
            back.onclick = () => gotoSection(idx-1);
            arrows.appendChild(back);
        }
        if (idx < mainSections.length-1) {
            const fwd = document.createElement('button');
            fwd.innerHTML = '&#8594;';
            fwd.title = 'Next';
            fwd.className = 'page-arrow';
            fwd.onclick = () => gotoSection(idx+1);
            arrows.appendChild(fwd);
        }
    }
    function gotoSection(idx) {
        const sec = mainSections[idx];
        document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
        document.getElementById(sec.id).style.display = 'block';
        // Update nav active
        document.querySelectorAll('#main-nav .nav-link').forEach((btn, i) => btn.classList.toggle('active', i === idx));
        renderPageArrows();
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Initial render
    renderPageArrows();
    // Re-render arrows on nav click/section change
    document.querySelectorAll('#main-nav .nav-link').forEach((btn, i) => {
        btn.addEventListener('click', () => setTimeout(renderPageArrows, 450));
    });
    // --- Remove subsections from overlay menu on click ---
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.submenu').forEach(sub => sub.style.display = 'none');
        });
    });
});