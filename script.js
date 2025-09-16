// Shopping Cart Management
let cart = JSON.parse(localStorage.getItem('quickbite-cart')) || [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializePage();
    setupMobileMenu();
});

// Setup mobile menu functionality
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

// Initialize page-specific functionality
function initializePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'menu.html':
            initializeMenuPage();
            break;
        case 'checkout.html':
            initializeCheckoutPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
        default:
            // Homepage initialization
            break;
    }
}

// Cart Functions
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showAddToCartNotification(name);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    if (window.location.pathname.includes('checkout.html')) {
        displayCartItems();
    }
}

function updateQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartCount();
            displayCartItems();
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    if (window.location.pathname.includes('checkout.html')) {
        displayCartItems();
    }
}

function saveCart() {
    localStorage.setItem('quickbite-cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function showAddToCartNotification(itemName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span>✅ ${itemName} added to cart!</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Menu Page Functions
function initializeMenuPage() {
    // Menu filtering is handled by filterMenu function
}

function filterMenu(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter items
    menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Checkout Page Functions
function initializeCheckoutPage() {
    displayCartItems();
    setupPaymentMethodChange();
    setupCheckoutForm();
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const finalTotalElement = document.getElementById('final-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="menu.html" class="btn btn-primary">Browse Menu</a>
            </div>
        `;
        if (placeOrderBtn) placeOrderBtn.disabled = true;
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} each</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    <strong>${itemTotal.toFixed(2)}</strong>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-left: 10px; cursor: pointer;">Remove</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Calculate totals
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const tax = subtotal * 0.08; // 8% tax
    const finalTotal = subtotal + deliveryFee + tax;
    
    if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `${tax.toFixed(2)}`;
    if (finalTotalElement) finalTotalElement.textContent = `${finalTotal.toFixed(2)}`;
    if (placeOrderBtn) placeOrderBtn.disabled = cart.length === 0;
}

function setupPaymentMethodChange() {
    const paymentMethod = document.getElementById('payment-method');
    const cardInfo = document.getElementById('card-info');
    
    if (paymentMethod && cardInfo) {
        paymentMethod.addEventListener('change', function() {
            if (this.value === 'credit-card' || this.value === 'debit-card') {
                cardInfo.style.display = 'block';
                // Make card fields required
                document.getElementById('card-number').required = true;
                document.getElementById('expiry-date').required = true;
                document.getElementById('cvv').required = true;
            } else {
                cardInfo.style.display = 'none';
                // Remove required attribute
                document.getElementById('card-number').required = false;
                document.getElementById('expiry-date').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    }
}

function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Simulate order processing
            const orderData = new FormData(checkoutForm);
            const orderId = 'QB' + Date.now();
            
            // Show loading state
            const submitBtn = document.getElementById('place-order-btn');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Processing...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Show success modal
                document.getElementById('order-id').textContent = orderId;
                document.getElementById('order-modal').style.display = 'flex';
                
                // Clear cart
                clearCart();
                
                // Reset form
                checkoutForm.reset();
                setupPaymentMethodChange(); // Reset payment method display
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
            }, 2000);
        });
    }
}

function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
    window.location.href = 'menu.html';
}

// Contact Page Functions
function initializeContactPage() {
    setupContactForm();
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                // Show success modal
                document.getElementById('contact-success').style.display = 'flex';
                
                // Reset form
                contactForm.reset();
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
            }, 1500);
        });
    }
}

function closeContactModal() {
    document.getElementById('contact-success').style.display = 'none';
}

// Smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .nav-menu.active ul {
        flex-direction: column;
        gap: 1rem;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);

// Initialize cart count on page load
updateCartCount();