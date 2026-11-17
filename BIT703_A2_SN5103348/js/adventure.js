
// --------------------- Global Header --------------------- \\
fetch('global_header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
        
        // --- 1. Active Page Dynamic Highlight ---
        let currentFile = window.location.pathname.split("/").pop();
        if (currentFile === ""){
            currentFile = "index.html"; 
        }
        
        const navlinks = document.querySelectorAll('.nav-links a');
        navlinks.forEach(link => {
            if (link.getAttribute('href') === currentFile){
                link.classList.add('active');
            }
        });

        // --- 2. Dynamic Search Bar (Home Page Only) ---
        const isHomePage = currentFile === 'index.html' || currentFile === '';

        if (isHomePage) {
            const searchBarHTML = `
                <form id="navSearchForm" class="nav-search-form">
                    <input type="text" placeholder="Search gear...">
                    <button type="submit" class="btn-primary">Go</button>
                </form>
            `;
            
            // Target the logo container instead of nav-links
            const logoContainer = document.querySelector('.logo-container');
            // 'beforeend' injects it just inside the container, after the <h2>
            logoContainer.insertAdjacentHTML('beforeend', searchBarHTML);

            // Neutralize the Nav Search Bar so it doesn't refresh the page
            const navSearchForm = document.getElementById('navSearchForm');
            if (navSearchForm) {
                navSearchForm.addEventListener('submit', function(e) {
                    e.preventDefault(); 
                    alert("Our full product search will be available once the database is connected!"); 
                });
            }
        }

        // --- 3. Mobile Hamburger Menu Toggle ---
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navContainer = document.querySelector('.nav-links');

        // When the hamburger is clicked, add/remove the 'show' class
        menuToggle.addEventListener('click', () => {
            navContainer.classList.toggle('show');
        });
    });
// --------------------- Global Footer --------------------- \\
fetch('global_footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  });

// --------------------- Interactive Elements --------------------- \\

// 1. Floating Anchor Scroll Logic
const floatingAnchor = document.getElementById('floatingAnchor');
if (floatingAnchor) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            floatingAnchor.classList.add('visible');
        } else {
            floatingAnchor.classList.remove('visible');
        }
    });

    floatingAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 2. Newsletter Form Validation
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent page reload
        
        const emailInput = document.getElementById('email').value;
        const errorMsg = document.getElementById('emailError');
        const successMsg = document.getElementById('emailSuccess');
        
        // Regular expression for validating an email address
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailPattern.test(emailInput)) {
            // Valid email
            errorMsg.style.display = 'none';
            successMsg.style.display = 'block';
            newsletterForm.reset();
        } else {
            // Invalid email
            successMsg.style.display = 'none';
            errorMsg.style.display = 'block';
        }
    });
}
// --------------------- Checkout & Shipping Logic --------------------- \\

const shippingForm = document.getElementById('shippingForm');

if (shippingForm) {
    // 1. Task 2: Dynamic Free Shipping Offer
    // Automatically gives free shipping for totals over $600
    const subtotalElement = document.getElementById('subtotalCost');
    const shippingCostElement = document.getElementById('shippingCost');
    const finalTotalElement = document.getElementById('finalTotal');
    const shippingRadios = document.getElementsByName('shippingMethod');

    function calculateShipping() {
        // Read from localStorage (fallback to 300)
        let savedSubtotal = localStorage.getItem('checkoutSubtotal');
        let subtotal = savedSubtotal ? parseFloat(savedSubtotal) : 300;
        
        // Update the HTML subtotal
        document.getElementById('subtotalCost').innerText = '$' + subtotal.toFixed(2);
        
        let gst = subtotal * 0.15; 
        let shippingCost = 0;
        
        // Grab the radio buttons and their parent label containers
        const standardRadio = document.querySelector('input[value="standard"]');
        const nextdayRadio = document.querySelector('input[value="nextday"]');
        const standardLabel = standardRadio.closest('.shipping-method-label');
        const nextdayLabel = nextdayRadio.closest('.shipping-method-label');

        // Apply Free Shipping Logic
        if (subtotal >= 600) {
            // 1. Force Next Day to be checked and active
            nextdayRadio.checked = true;
            nextdayLabel.classList.add('active-bg');
            
            // 2. Lock and grey out the Standard option
            standardRadio.disabled = true;
            standardLabel.classList.remove('active-bg');
            standardLabel.style.opacity = '0.4';
            standardLabel.style.pointerEvents = 'none';

            // 3. Set Cost
            shippingCost = 0;
            document.getElementById('shippingCost').innerText = 'FREE (Overnight)';
            
        } else {
            // 1. Re-enable standard option if they drop below $600
            standardRadio.disabled = false;
            standardLabel.style.opacity = '1';
            standardLabel.style.pointerEvents = 'auto';
            
            // 2. Determine which is currently selected
            let selectedShipping = document.querySelector('input[name="shippingMethod"]:checked').value;
            
            if (selectedShipping === 'nextday') {
                shippingCost = 20;
                document.getElementById('shippingCost').innerText = '$20.00';
                nextdayLabel.classList.add('active-bg');
                standardLabel.classList.remove('active-bg');
            } else {
                shippingCost = 10;
                document.getElementById('shippingCost').innerText = '$10.00';
                standardLabel.classList.add('active-bg');
                nextdayLabel.classList.remove('active-bg');
            }
        }

        // Save the final shipping cost for the payment page
        localStorage.setItem('checkoutShipping', shippingCost);

        // Calculate and display final totals
        let total = subtotal + gst + shippingCost;
        document.getElementById('gstCost').innerText = '$' + gst.toFixed(2);
        document.getElementById('finalTotal').innerText = '$' + total.toFixed(2);
    }

    // Run once on page load to set initial values
    calculateShipping();


    // 2. Task 3: Form Validation & Routing
    shippingForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Stops the page from refreshing

        // Grab specific inputs to validate
        const zipInput = shippingForm.querySelector('input[placeholder="Zip/Postal Code"]').value;
        const phoneInput = shippingForm.querySelector('input[placeholder="Phone Number"]').value;

        // Strict Regular Expressions to prevent malicious input/format errors
        const zipRegex = /^[0-9]{4}$/; // Exactly 4 digits for NZ postal code
        const phoneRegex = /^[0-9\-\+\s]{7,15}$/; // Standard phone number characters

        // Run Client-Side Validation Checks
        if (!zipRegex.test(zipInput)) {
            alert("Security Check: Please enter a valid 4-digit numeric NZ postal code without special characters.");
            return; // Stops the function so they can't proceed
        }

        if (!phoneRegex.test(phoneInput)) {
            alert("Security Check: Please enter a valid phone number.");
            return;
        }

        // If it passes all HTML5 and JavaScript validation checks, route to the next page
        window.location.href = 'payment.html';
    });
}
// --------------------- Shopping Cart Logic --------------------- \\
const cartQtyInput = document.getElementById('cartQty');

if (cartQtyInput) {
    const basePrice = 300; 
    const subtotalDisplay = document.getElementById('cartSubtotal');
    const shippingDisplay = document.getElementById('cartShipping');
    const gstDisplay = document.getElementById('cartGST');
    const totalDisplay = document.getElementById('cartTotal');

    function updateCartTotals() {
        let qty = parseInt(cartQtyInput.value) || 1;
        let subtotal = qty * basePrice;
        let gst = subtotal * 0.15;
        let shipping = (subtotal + gst >= 600) ? 0 : 20;
        let total = subtotal + gst + shipping;

        // Save the subtotal to public storage
        localStorage.setItem('checkoutSubtotal', subtotal);

        subtotalDisplay.innerText = '$' + subtotal.toFixed(2);
        gstDisplay.innerText = '$' + gst.toFixed(2);
        shippingDisplay.innerText = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
        totalDisplay.innerText = '$' + total.toFixed(2);
    }

    cartQtyInput.addEventListener('input', updateCartTotals);
    updateCartTotals(); 
}
// --------------------- Payment Page Logic --------------------- \\
const paymentForm = document.getElementById('paymentForm');

if (paymentForm) {
    // Retrieve values from Local Storage (with fallbacks)
    let subtotal = parseFloat(localStorage.getItem('checkoutSubtotal')) || 300;
    let shippingCost = parseFloat(localStorage.getItem('checkoutShipping')) || 20;
    
    let gst = subtotal * 0.15;
    let total = subtotal + gst + shippingCost;

    // Render them to the DOM
    document.getElementById('subtotalCost').innerText = '$' + subtotal.toFixed(2);
    document.getElementById('gstCost').innerText = '$' + gst.toFixed(2);
    document.getElementById('finalTotal').innerText = '$' + total.toFixed(2);
    
    let shippingDisplay = document.getElementById('shippingCost');
    if (shippingCost === 0) {
        shippingDisplay.innerText = 'FREE (Overnight)';
    } else {
        shippingDisplay.innerText = '$' + shippingCost.toFixed(2);
    }

    // Task 3: Form Routing
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert("Payment successful! Redirecting to confirmation...");
        // Clear the cart memory since they bought it
        localStorage.removeItem('checkoutSubtotal');
        localStorage.removeItem('checkoutShipping');
        window.location.href = 'index.html'; 
    });
}
