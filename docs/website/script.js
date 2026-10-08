document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Progress Bar ---
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // --- 3. Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- 4. Sidebar Navigation Active State ---
    const sections = document.querySelectorAll('.doc-section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
                
                // Keep active link in view on mobile
                if (window.innerWidth <= 768) {
                    const navContainer = document.querySelector('.nav-links');
                    const linkLeft = link.offsetLeft;
                    navContainer.scrollTo({
                        left: linkLeft - 20,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- 5. FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close others
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current
            item.classList.toggle('active');
        });
    });

    // --- 6. Search Functionality ---
    const searchInput = document.getElementById('nav-search');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        navLinks.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes(term)) {
                link.parentElement.style.display = 'block';
            } else {
                link.parentElement.style.display = 'none';
            }
        });
    });

});

// --- Tabs Functionality (Global) ---
function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabName);
    targetTab.style.display = 'block';
    
    // Slight delay for animation to trigger
    setTimeout(() => {
        targetTab.classList.add('active');
    }, 10);
    
    evt.currentTarget.classList.add('active');
}

// --- Tech Details Functionality ---
const techData = {
    'CNN': "Used as the foundational architecture for the leaf detection and initial disease classification models. CNNs are excellent at extracting spatial features (like spots, holes, and discoloration) from raw crop images.",
    'EfficientNet': "Used specifically for the primary top-3 disease classification model (EfficientNetB0). It provides state-of-the-art accuracy on the PlantVillage dataset while remaining lightweight enough for fast API inference without requiring heavy GPU servers.",
    'OpenCV': "Used in the backend image processing pipeline to convert images to HSV color space, create masks for brown/yellow necrotic regions, and draw bounding boxes to calculate the severity of the infection dynamically.",
    'Random Forest': "Chosen for the yield prediction engine because it handles non-linear relationships in tabular agricultural data (weather, soil, area) exceptionally well and provides feature importance without extensive preprocessing.",
    'FastAPI': "Selected as the backend framework due to its incredible speed (asynchronous support), native data validation (Pydantic), and seamless integration with our machine learning models (TensorFlow/Joblib) for real-time inference.",
    'MongoDB': "Used as a flexible NoSQL database to store dynamic JSON objects like variable prediction histories, complex weather forecasts, and user specific recommendations without being constrained by rigid SQL schemas.",
    'React': "Used to build a dynamic, responsive, and state-driven frontend dashboard that smoothly handles image uploads, API interactions, and live data visualization without page reloads."
};

function showTechDetails(tech) {
    const container = document.getElementById('tech-details-container');
    const title = document.getElementById('tech-title');
    const desc = document.getElementById('tech-desc');
    
    // Reset animation by triggering reflow
    container.style.animation = 'none';
    container.offsetHeight; 
    container.style.animation = null;
    
    title.textContent = tech;
    desc.textContent = techData[tech];
    container.style.display = 'block';
    container.style.animation = 'fadeIn 0.4s ease';
    
    // Highlight the active badge
    const badges = document.querySelectorAll('.tech-cards .badge');
    badges.forEach(badge => {
        badge.classList.remove('active-badge');
        if (badge.textContent.trim() === tech) {
            badge.classList.add('active-badge');
        }
    });
}
