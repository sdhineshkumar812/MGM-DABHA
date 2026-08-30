/* ==========================================================================
   MGM DABHA - Customer JavaScript (V16.0 Publish Ready Edition)
   ========================================================================== */

const API_BASE = '/api';

// State Management
let currentUser = JSON.parse(localStorage.getItem('mgm_user') || 'null');
let currentLang = localStorage.getItem('mgm_lang') || 'en';
let cartState = [];
let contactInfo = null;
let currentMenuCatalog = [];

document.addEventListener('DOMContentLoaded', () => {
    dismissLoadingScreen();
    initScrollHeader();
    initTheme();
    initNavigation();
    initUserSession();
    fetchContactSettings();
    loadCart();
    initBackToTop();

    const path = window.location.pathname;
    if (path.includes('menu.html') || path === '/' || path.endsWith('index.html')) {
        loadMenuGrid();
        loadReviewsList();
    }
});

// Translucent Scroll-Sensing Header Trigger
function initScrollHeader() {
    const header = document.querySelector('.header-main');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });
}

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Lightbox Modal Functions
function openLightbox(imgSrc) {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.add('active');
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('active');
}

// Gallery Category Filter
function filterGallery(category, btnElement) {
    document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

async function fetchContactSettings() {
    try {
        const res = await fetch('/contact-settings');
        const data = await res.json();
        if (data.success) {
            contactInfo = data;
            updateContactElements(data);
        }
    } catch (err) {
        console.error('Fetch contact settings error', err);
    }
}

function updateContactElements(info) {
    document.querySelectorAll('.dynamic-restaurant-name').forEach(el => el.textContent = info.restaurant_name || 'MGM DABHA');
    document.querySelectorAll('.dynamic-tagline').forEach(el => el.textContent = info.tagline || 'Authentic South Indian & Multi-Cuisine Family Restaurant');
    document.querySelectorAll('.dynamic-phone').forEach(el => el.textContent = info.phone || '+91 9345841117');
    document.querySelectorAll('.dynamic-address').forEach(el => el.textContent = `Tomato Market Opposite MGM DABHA, Near Tomato Market, Palacode, Dharmapuri, Tamil Nadu – 636806, India.`);
    document.querySelectorAll('.dynamic-email').forEach(el => el.textContent = info.email || 'sdhineshkumar7576@gmail.com');

    // Splash text
    const splashName = document.getElementById('splash-name');
    const splashTagline = document.getElementById('splash-tagline');
    if (splashName) splashName.textContent = info.restaurant_name || 'MGM DABHA';
    if (splashTagline) splashTagline.textContent = info.tagline || 'Authentic South Indian & Multi-Cuisine Family Restaurant';

    // Logo & Banner
    const logoImg = document.getElementById('dyn-logo-img');
    if (logoImg && info.restaurant_logo) logoImg.src = info.restaurant_logo;

    const bannerSlide = document.getElementById('hero-banner-slide');
    if (bannerSlide && info.banner_image) bannerSlide.style.backgroundImage = `url('${info.banner_image}')`;

    // WhatsApp Button
    const cleanPhone = (info.whatsapp || info.phone || '+919345841117').replace(/[^0-9]/g, '');
    document.querySelectorAll('.dynamic-whatsapp-btn').forEach(btn => {
        btn.href = `https://wa.me/${cleanPhone || '919345841117'}`;
    });

    // Google Map Iframe
    const mapIframe = document.getElementById('dyn-google-map');
    if (mapIframe && info.google_map) mapIframe.src = info.google_map;

    // Social Media Links
    const fbLink = document.getElementById('dyn-fb-link');
    const instaLink = document.getElementById('dyn-insta-link');
    const ytLink = document.getElementById('dyn-yt-link');
    if (fbLink && info.facebook) fbLink.href = info.facebook;
    if (instaLink && info.instagram) instaLink.href = info.instagram;
    if (ytLink && info.youtube) ytLink.href = info.youtube;

    // Working Hours Badge
    updateLiveStatusBadge(info.opening_time, info.closing_time);
}

function updateLiveStatusBadge(openTime, closeTime) {
    const statusContainer = document.getElementById('live-status-container');
    if (!statusContainer) return;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (openTime || '07:00').split(':').map(Number);
    const [closeH, closeM] = (closeTime || '23:00').split(':').map(Number);
    const isOpen = currentMinutes >= (openH * 60 + openM) && currentMinutes <= (closeH * 60 + closeM);

    if (isOpen) {
        statusContainer.innerHTML = `<span class="status-badge status-open"><i class="fas fa-circle" style="font-size:0.6rem;"></i> 🟢 Open Daily (${openTime ? openTime.substring(0,5) : '07:00'} AM - ${closeTime ? closeTime.substring(0,5) : '23:00'})</span>`;
    } else {
        statusContainer.innerHTML = `<span class="status-badge status-closed"><i class="fas fa-circle" style="font-size:0.6rem;"></i> 🔴 Closed Now (Opens Daily at ${openTime ? openTime.substring(0,5) : '07:00'} AM)</span>`;
    }
}

function dismissLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 500);
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('mgm_theme') || 'light';
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
    
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('mgm_theme', isDark ? 'dark' : 'light');
        });
    });
}

function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
}

function initUserSession() {
    const authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) return;

    if (currentUser) {
        authContainer.innerHTML = `
            <a href="profile.html" class="btn btn-sm btn-secondary" style="border-radius:20px;">
                <i class="fas fa-user-circle"></i> ${currentUser.name.split(' ')[0]}
            </a>
            <button onclick="logoutUser()" class="icon-btn" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
        `;
    } else {
        authContainer.innerHTML = `<a href="login.html" class="btn btn-sm btn-primary"><i class="fas fa-sign-in-alt"></i> Login</a>`;
    }
}

function logoutUser() {
    localStorage.removeItem('mgm_user');
    currentUser = null;
    window.location.reload();
}

async function loadCart() {
    const userId = currentUser ? currentUser.id : 0;
    const sessionId = localStorage.getItem('mgm_session_id') || 'guest';
    try {
        const res = await fetch(`${API_BASE}/cart?user_id=${userId}&session_id=${sessionId}`);
        const data = await res.json();
        if (data.success) {
            cartState = data.cart;
            updateCartBadge();
        }
    } catch (err) {}
}

function updateCartBadge() {
    const count = cartState.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelectorAll('.cart-count-badge').forEach(b => b.textContent = count);
}

async function addToCart(foodId, foodName) {
    const userId = currentUser ? currentUser.id : null;
    const sessionId = localStorage.getItem('mgm_session_id') || 'guest';

    try {
        const res = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, session_id: sessionId, food_id: foodId, quantity: 1 })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Added ${foodName} to cart!`);
            await loadCart();
        }
    } catch (err) {}
}

async function loadMenuGrid() {
    const gridContainer = document.getElementById('food-grid');
    if (!gridContainer) return;
    try {
        const res = await fetch(`${API_BASE}/menu`);
        const data = await res.json();
        if (!data.success || !data.menu) return;

        currentMenuCatalog = data.menu;
        gridContainer.innerHTML = currentMenuCatalog.map(i => `
            <div class="food-card">
                <div style="position:relative;">
                    <img src="${i.image_url}" alt="${i.name}" style="width:100%; height:180px; object-fit:cover;">
                    <span style="position:absolute; top:12px; left:12px; background:var(--secondary); color:#FFF; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:15px;">Flat 20% OFF</span>
                </div>
                <div style="padding:18px; display:flex; flex-direction:column; flex:1;">
                    <h3 style="font-size:1.15rem; color:var(--primary); margin-bottom:4px;">${i.name}</h3>
                    <p style="font-size:0.85rem; color:gray; height:38px; overflow:hidden; margin-bottom:12px;">${i.description}</p>
                    <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="color:var(--primary); font-size:1.2rem;">₹${i.price}</strong>
                            <span style="text-decoration:line-through; color:gray; font-size:0.85rem; margin-left:6px;">₹${Math.round(i.price * 1.25)}</span>
                        </div>
                        <button onclick="addToCart(${i.id}, '${i.name}')" class="btn btn-sm btn-secondary"><i class="fas fa-cart-plus"></i> Add</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {}
}

async function loadReviewsList() {
    const box = document.getElementById('reviews-cards-list');
    if (!box) return;
    try {
        const res = await fetch(`${API_BASE}/reviews`);
        const data = await res.json();
        if (data.success && data.reviews.length > 0) {
            box.innerHTML = data.reviews.map(r => `
                <div style="background:var(--card-bg); padding:22px; border-radius:16px; border:1px solid var(--border-color); box-shadow:var(--shadow);">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" style="width:42px; height:42px; border-radius:50%; object-fit:cover;">
                        <div>
                            <strong style="font-size:1rem; display:block;">${r.customer_name}</strong>
                            <span style="font-size:0.8rem; color:var(--secondary);"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></span>
                        </div>
                    </div>
                    <p style="font-size:0.9rem; color:gray; line-height:1.5;">"${r.message}"</p>
                </div>
            `).join('');
        }
    } catch (e) {}
}
