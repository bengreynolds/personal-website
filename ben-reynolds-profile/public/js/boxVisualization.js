// This file has been disabled - boxes should only appear on welcome.html
// The original code has been commented out below for reference

/*
document.addEventListener('DOMContentLoaded', function() {
    // Create the 3D box container
    const boxContainer = document.createElement('div');
    boxContainer.id = 'box-container';
    boxContainer.style.position = 'fixed';
    boxContainer.style.top = '0';
    boxContainer.style.left = '0';
    boxContainer.style.width = '100%';
    boxContainer.style.height = '100%';
    boxContainer.style.display = 'flex';
    boxContainer.style.justifyContent = 'center';
    boxContainer.style.alignItems = 'center';
    boxContainer.style.zIndex = '999';
    boxContainer.style.perspective = '1000px';
    boxContainer.style.pointerEvents = 'none';
    
    // Navigation items to create boxes for
    const navItems = [
        { target: 'home', label: 'Home' },
        { target: 'about', label: 'Overview' },
        { target: 'timeline', label: 'Experience & Skills' },
        { target: 'projects', label: 'Selected Projects' },
        { target: 'contact', label: 'Contact' }
    ];
    
    // Create the circle path for boxes
    const circlePath = document.createElement('div');
    circlePath.id = 'circle-path';
    circlePath.style.position = 'relative';
    circlePath.style.width = '300px';
    circlePath.style.height = '300px';
    circlePath.style.transformStyle = 'preserve-3d';
    // Removed rotation animation
    boxContainer.appendChild(circlePath);
    
    // Create boxes for each nav item
    navItems.forEach((item, index) => {
        const box = document.createElement('div');
        box.className = 'nav-3d-box';
        box.dataset.target = item.target;
        box.style.position = 'absolute';
        box.style.width = '100px';
        box.style.height = '100px';
        box.style.backgroundColor = 'rgba(42, 82, 152, 0.9)';
        box.style.border = '2px solid white';
        box.style.borderRadius = '8px';
        box.style.display = 'flex';
        box.style.justifyContent = 'center';
        box.style.alignItems = 'center';
        box.style.color = 'white';
        box.style.fontWeight = 'bold';
        box.style.transformStyle = 'preserve-3d';
        // Position boxes in a flat layout instead of a circle
        const angle = (index * 72);
        const radius = 150;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        box.style.transform = `translate(${x}px, ${y}px)`;
        box.style.cursor = 'pointer';
        box.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.2)';
        box.style.pointerEvents = 'auto';
        box.style.transition = 'transform 0.5s';
        
        // Text inside the box
        const text = document.createElement('span');
        text.textContent = item.label;
        text.style.textAlign = 'center';
        text.style.padding = '10px';
        text.style.fontSize = '14px';
        box.appendChild(text);
        
        // Add click event
        box.addEventListener('click', function() {
            // Find and click the corresponding nav button
            const navBtn = document.querySelector(`.nav-link[data-target="${item.target}"]`);
            if (navBtn) navBtn.click();
            
            // Fade out and remove the box container
            boxContainer.style.opacity = '0';
            setTimeout(() => boxContainer.remove(), 1000);
        });
        
        // Add to circle path
        circlePath.appendChild(box);
    });
    
    // Add the box container to the document
    document.body.appendChild(boxContainer);
    
    // Set initial opacity and fade in
    boxContainer.style.opacity = '0';
    boxContainer.style.transition = 'opacity 1s';
    setTimeout(() => boxContainer.style.opacity = '1', 100);
    
    // Auto-hide after 8 seconds if no interaction
    setTimeout(() => {
        if (document.body.contains(boxContainer)) {
            boxContainer.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(boxContainer)) {
                    boxContainer.remove();
                }
            }, 1000);
        }
    }, 8000);
});

// CSS Animations in JS
const style = document.createElement('style');
style.textContent = `
/* Removed rotate and spin keyframes animations */
`;
document.head.appendChild(style);
*/