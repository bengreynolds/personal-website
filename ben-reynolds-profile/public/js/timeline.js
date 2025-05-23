// This file manages the timeline feature, implementing infinite scroll functionality to showcase past life experiences and goals.

document.addEventListener('DOMContentLoaded', function() {
    const timelineContainer = document.getElementById('timeline-container');
    let page = 1;

    function loadTimelineItems() {
        fetch(`https://api.example.com/timeline?page=${page}`)
            .then(response => response.json())
            .then(data => {
                data.items.forEach(item => {
                    const timelineItem = document.createElement('div');
                    timelineItem.classList.add('timeline-item');
                    timelineItem.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.date}</p>
                        <p>${item.description}</p>
                    `;
                    timelineContainer.appendChild(timelineItem);
                });
                page++;
            })
            .catch(error => console.error('Error loading timeline items:', error));
    }

    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadTimelineItems();
        }
    }

    window.addEventListener('scroll', handleScroll);
    loadTimelineItems(); // Initial load
});