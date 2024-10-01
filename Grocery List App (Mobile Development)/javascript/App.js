let btn = document.querySelector(".show-btn");
let bottomSheet = document.querySelector(".bottom-sheet");
let overlay = document.querySelector(".overlay");
let content = document.querySelector(".content");
let dragIcon = document.querySelector(".drag-icon");

// Initialize dragging state and variables for drag calculations
let isDragging = false,
  startY,
  startHeight;

// Function to update the height of the content area
let updateHeight = (height) => {
  content.style.height = `${height}vh`;
  // Toggle fullscreen class based on the height
  bottomSheet.classList.toggle("fullscreen", height === 100);
};

// Function to show the bottom sheet
let showSheet = () => {
  bottomSheet.classList.add("show"); 
  updateHeight(50); 
  document.body.style.overflow = "hidden"; 
};

// Function to hide the bottom sheet
let hideSheet = () => {
  bottomSheet.classList.remove("show"); 
  document.body.style.overflow = "auto"; 
};

// Function to handle the start of dragging
let dragStart = (e) => {
  isDragging = true; 
  bottomSheet.classList.add("dragging"); 
  startY = e.pageY || e.touches?.[0].pageY;
  startHeight = parseInt(content.style.height); 
};

// Function to handle the dragging motion
let dragging = (e) => {
  if (!isDragging) return; 
  let delta = startY - (e.pageY || e.touches?.[0].pageY); 
  let newHeight = startHeight + (delta / window.innerHeight) * 100; 
  updateHeight(newHeight); 
};

// Function to handle the end of dragging
let dragStop = () => {
  isDragging = false;
  bottomSheet.classList.remove("dragging"); 
  let sheetHeight = parseInt(content.style.height);
  // Decide whether to hide the sheet or adjust its height based on current height
  sheetHeight < 25 ? hideSheet() : sheetHeight > 75 ? updateHeight(100) : updateHeight(50);
};

// Event listeners for mouse and touch events to manage dragging
dragIcon.addEventListener("mousedown", dragStart); 
dragIcon.addEventListener("mousemove", dragging); 
document.addEventListener("mouseup", dragStop);
dragIcon.addEventListener("touchstart", dragStart); 
dragIcon.addEventListener("touchmove", dragging); 
document.addEventListener("touchend", dragStop); 
btn.addEventListener("click", showSheet); 
overlay.addEventListener("click", hideSheet);

let openShopping = document.querySelector('.shopping');
let closeShopping = document.querySelector('.closeShopping');
let list = document.querySelector('.list');
let listCard = document.querySelector('.listCard');
let body = document.querySelector('body');
let total = document.querySelector('.total');
let quantityDisplay = document.querySelector('.quantity');
let addProductBtn = document.getElementById('addProductBtn');
let productModal = document.getElementById('productModal');
let closeModal = productModal.querySelector('.close');
let productForm = document.getElementById('productForm');
let editProductModal = document.getElementById('editProductModal');
let closeEditModal = document.getElementById('closeEditModal');
let editProductForm = document.getElementById('editProductForm');
let deleteProductBtn = document.getElementById('deleteProductBtn');
let products = JSON.parse(localStorage.getItem('products')) || [];
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || {};
let currentEditingProductId = null;

// Settings Modal Elements
let settingsButton = document.querySelector(".nav-button");
let settingsModal = document.getElementById('settingsModal');
let closeSettingsModal = document.getElementById('closeSettingsModal');

// Store Modal Elements
let storeModal = document.getElementById('storeModal');
let closeStoreModal = document.getElementById('closeStoreModal');
let storeIcon = document.querySelector('.store-icon');
let storeSelection = document.getElementById('storeSelection');
let storeForm = document.getElementById('storeForm');

// Load previously selected store from localStorage
const selectedStore = localStorage.getItem('selectedStore');
if (selectedStore) {
    storeSelection.value = selectedStore; // Set the dropdown to the previously selected store
    filterProductsByStore(selectedStore); // Filter products based on the selected store
}

// Handle store selection form submission
storeForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const selectedStore = storeSelection.value; // Get the selected store
    localStorage.setItem('selectedStore', selectedStore); // Save selected store to localStorage
    filterProductsByStore(selectedStore); // Filter products based on the selected store

    storeModal.style.display = 'none'; // Close the modal
});

// Function to filter products by selected store
function filterProductsByStore(store) {
    list.innerHTML = ''; // Clear current list

    products.forEach((value) => {
        if (value.store.toLowerCase() === store.toLowerCase()) { // Check if product store matches
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.innerHTML = `
                <img src="${value.image}" alt="${value.name}">
                <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                <div class="title">${value.name}</div>
                <div class="price">₱${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${value.id})">Add To Cart</button>`;
            list.appendChild(newDiv);
        }
    });

    // If no products found, display a message
    if (!hasProducts) {
        let messageDiv = document.createElement('div');
        messageDiv.classList.add('no-products-message');
        messageDiv.innerText = "No List Added To This Store";
        list.appendChild(messageDiv);
    }
}

// Open settings modal functionality
settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

// Close settings modal functionality
closeSettingsModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Open store modal functionality
storeIcon.addEventListener('click', () => {
    storeModal.style.display = 'block';
});

// Close store modal functionality
closeStoreModal.addEventListener('click', () => {
    storeModal.style.display = 'none';
});

// Close modal by clicking outside
window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
    if (event.target === storeModal) {
        storeModal.style.display = 'none';
    }
});

// Currency symbols mapping
const currencySymbols = {
    PHP: '₱',
    USD: '$',
    EUR: '€',
    JPY: '¥'
};

// Function to update currency
function updateCurrencyDisplay() {
    const selectedCurrency = localStorage.getItem('currency') || 'PHP'; // Default to PHP
    const symbol = currencySymbols[selectedCurrency];

    // Update product prices in the product list
    const prices = document.querySelectorAll('.price');
    prices.forEach(priceElement => {
        const priceValue = parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ""));
        priceElement.textContent = `${symbol}${priceValue.toLocaleString()}`; // Format with symbol
    });

    // Update total in the checklist card
    const totalPriceElement = document.querySelector('.total');
    const totalValue = parseFloat(totalPriceElement.textContent.replace(/[^0-9.-]+/g, ""));
    totalPriceElement.textContent = `${symbol}${totalValue.toLocaleString()}`; // Format with symbol

    // Update previous items list
    loadPreviousItems(); // Refresh previous items to reflect the new currency

    updateCart(); // Update the cart display to reflect currency change
}

// Initialize the app
function initApp() {
    // Clear the list before populating
    list.innerHTML = '';

    // Load products from localStorage
    products.forEach((value) => {
        let newDiv = document.createElement('div');
        newDiv.classList.add('item');
        newDiv.innerHTML = `
            <img src="${value.image}" alt="${value.name}">
            <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
            <div class="title">${value.name}</div>
            <div class="price">${currencySymbols[localStorage.getItem('currency') || 'PHP']}${value.price.toLocaleString()}</div>
            <button onclick="addToCart(${value.id})">Add To Cart</button>`;
        list.appendChild(newDiv);
    });

    // Set the active category from local storage
    const activeCategory = localStorage.getItem('activeCategory') || 'all';
    filterByCategory(activeCategory); // Call the filter function to set the active category

    // Filter products by selected store if available
    const selectedStore = localStorage.getItem('selectedStore');
    if (selectedStore) {
        filterProductsByStore(selectedStore); // Filter products based on the selected store
    }

    updateCurrencyDisplay(); // Ensure the currency is displayed correctly on initialization
    updateCart(); // Update the cart display on initialization
    updateQuantityDisplay(); // Ensure quantity display is updated on initialization
    loadPreviousItems(); // Load previous items from localStorage
}

// Handle the edit product form submission
editProductForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the form
    const updatedProductName = document.getElementById('editProductName').value;
    const updatedBrand = document.getElementById('editBrand').value;
    const updatedPrice = parseFloat(document.getElementById('editPrice').value);
    const updatedCategory = document.getElementById('editCategory').value; // Get updated category
    const updatedStore = document.getElementById('editStore').value;
    const updatedProductImage = document.getElementById('editProductImage').files[0];

    // Find the product to update
    const productIndex = products.findIndex(p => p.id === currentEditingProductId);
    if (productIndex !== -1) {
        // Update the product details
        products[productIndex].name = updatedProductName;
        products[productIndex].brand = updatedBrand;
        products[productIndex].price = updatedPrice;
        products[productIndex].category = updatedCategory; // Update category
        products[productIndex].store = updatedStore;

        // If a new image is uploaded, convert it to Base64
        if (updatedProductImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                products[productIndex].image = reader.result; // Update image
                localStorage.setItem('products', JSON.stringify(products)); // Save updated products to localStorage
                initApp(); // Refresh the product list
                editProductModal.style.display = 'none'; // Hide the edit modal
            };
            reader.readAsDataURL(updatedProductImage); // Read the image file as a data URL
        } else {
            // If no new image, just save the products
            localStorage.setItem('products', JSON.stringify(products)); // Save updated products to localStorage
            initApp(); // Refresh the product list
            editProductModal.style.display = 'none'; // Hide the edit modal
        }
    }
});

// Function to open the edit modal
function openEditModal(productId) {
    // Find the product by ID
    const product = products.find(p => p.id === productId);
    if (product) {
        // Populate the form fields with the product data
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editBrand').value = product.brand;
        document.getElementById('editPrice').value = product.price;
        document.getElementById('editCategory').value = product.category;
        document.getElementById('editStore').value = product.store;
        
        // Set the current editing product ID
        currentEditingProductId = productId;

        // Set the modal display to block
        editProductModal.style.display = 'block';
    }
}

// Function to delete a product
function deleteProduct() {
    // Filter out the product that needs to be deleted
    products = products.filter(p => p.id !== currentEditingProductId);
    localStorage.setItem('products', JSON.stringify(products)); // Update localStorage

    initApp(); // Refresh the product list
    editProductModal.style.display = 'none'; // Hide the edit modal
}

// Attach the delete function to the delete button
deleteProductBtn.addEventListener('click', deleteProduct);

// Close the edit modal when the close button is clicked
closeEditModal.addEventListener('click', () => {
    editProductModal.style.display = 'none'; // Hide the edit modal
});

// Settings form submission
document.getElementById('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedCurrency = document.getElementById('currency').value;
    localStorage.setItem('currency', selectedCurrency); // Save selected currency
    updateCurrencyDisplay(); // Update the display and cart
    settingsModal.style.display = 'none'; // Close settings modal
});

// Declare and initialize sort option variable
let currentSortOption = 'default'; // Default sorting option

// Get the search input element
let searchInput = document.getElementById('searchInput');

// Add event listener to the search input
searchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase(); // Get the search term in lowercase
    filterProducts(searchTerm); // Call the filter function
});

// Open the cart when the shopping icon is clicked
openShopping.addEventListener('click', () => {
    body.classList.add('active');
});

// Close the cart when the close button is clicked
closeShopping.addEventListener('click', () => {
    body.classList.remove('active');
});

// Add product modal functionality
addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'block';
});

// Close product modal functionality
closeModal.addEventListener('click', () => {
    productModal.style.display = 'none';
});

// Close modal by clicking outside
window.addEventListener('click', (event) => {
    if (event.target === productModal) {
        productModal.style.display = 'none';
    }
    if (event.target === editProductModal) {
        editProductModal.style.display = 'none';
    }
});

// Product form submission
productForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get the values from the form
    let productName = document.getElementById('productName').value;
    let brand = document.getElementById('brand').value;
    let price = parseFloat(document.getElementById('price').value);
    let category = document.getElementById('category').value; // Get category value
    let store = document.getElementById('store').value;
    let productImage = document.getElementById('productImage').files[0];

    // Create a new product object with a unique ID
    let newProduct = {
        id: Date.now(), // Use timestamp for unique ID
        name: productName,
        brand: brand,
        price: price,
        category: category, // Assign category correctly
        store: store,
        image: '' // Initialize image as an empty string
    };

    // Convert image to Base64 if an image is provided
    if (productImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
            newProduct.image = reader.result; // Set the image property to the Base64 string
            products.push(newProduct); // Add the new product to the products array

            // Save products to localStorage
            localStorage.setItem('products', JSON.stringify(products));

            // Reload the product list
            list.innerHTML = ''; // Clear the current list
            initApp(); // Reinitialize the app to display the updated product list

            // Close the modal
            productModal.style.display = 'none';

            // Reset the form
            productForm.reset();
        };
        reader.readAsDataURL(productImage); // Read the image file as a data URL
    } else {
        // If no image is provided, still push the product
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        initApp();
        productModal.style.display = 'none';
        productForm.reset();
    }
});

// Clear List button functionality
document.querySelector('.clr-btn').addEventListener('click', () => {
    // Clear previous items from localStorage
    localStorage.removeItem('previousItems');

    // Clear the displayed previous items in the bottom sheet
    const previousItemsContainer = document.querySelector('.previous-items');
    previousItemsContainer.innerHTML = ''; // Clear the container

    // Optionally, show a message that the list has been cleared
    const emptyMessage = document.querySelector('.empty-message');
    emptyMessage.style.display = 'block'; // Show empty message if needed
});

// Initialize the app
initApp(); // Call initApp to load products on page load

function addToCart(id) {
    // Find the product by id
    let product = products.find(p => p.id === id);
    if (product) {
        // Check if the product is already in the cart
        if (!cartItems[product.id]) {
            // If not in cart, add it and update quantity display
            cartItems[product.id] = {
                ...product,
                quantity: 1, // Add new product with quantity 1
                checked: false // Initialize checkbox state
            };
        } else {
            // If already in cart, increment the quantity
            cartItems[product.id].quantity += 1;
        }

        // Save cart items to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        updateCart(); // Update the cart display
        updateQuantityDisplay(); // Update the quantity display
    }
}

function updateQuantityDisplay() {
    // Count unique items in the cart
    const totalQuantity = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
    quantityDisplay.textContent = totalQuantity; // Update the quantity display
}

function changeQuantity(id, delta) {
    // Check if the item exists in the cart
    if (cartItems[id]) {
        // Update the quantity
        cartItems[id].quantity += delta;

        // Ensure the quantity doesn't go below 1
        if (cartItems[id].quantity < 1) {
            // Optionally remove the item if quantity is zero
            delete cartItems[id];
        }

        // Save the updated cart items to localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Update the cart display and quantity display
        updateCart();
        updateQuantityDisplay();
    }
}

function updateCart() {
    listCard.innerHTML = ''; // Clear current cart display
    let totalAmount = 0; // Initialize total amount
    const selectedCurrency = localStorage.getItem('currency') || 'PHP'; // Get the selected currency
    const symbol = currencySymbols[selectedCurrency]; // Get the corresponding symbol

    // Sort the cart items based on the current sort option
    const sortedCartItems = Object.values(cartItems).sort((a, b) => {
        if (currentSortOption === 'store') {
            return a.store.localeCompare(b.store);
        } else if (currentSortOption === 'price') {
            return a.price - b.price;
        } else {
            return a.name.localeCompare(b.name); // Default sorting by name
        }
    });

    // Populate the cart list and calculate total
    sortedCartItems.forEach(item => {
        totalAmount += item.price * item.quantity; // Calculate total amount

        let cartItem = document.createElement('li');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <input type="checkbox" class="toggle-checkbox" onchange="toggleItem(this, ${item.id})" ${item.checked ? 'checked' : ''}>
            <div class="cart-title" ${item.checked ? 'style="text-decoration: line-through; color: lightgray;"' : ''}>${item.name}</div>
            <div class="cart-price" ${item.checked ? 'style="text-decoration: line-through; color: lightgray;"' : ''}>${symbol}${item.price.toLocaleString()}</div>
            <div class="cart-store" ${item.checked ? 'style="text-decoration: line-through; color: lightgray;"' : ''}>${item.store}</div>
            <div>
                <button onclick="changeQuantity(${item.id}, -1)" class="quantity-btn" style="margin: 0 8px 0 12px;">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)" class="quantity-btn" style="margin-left: 8px;">+</button>
            </div>
            <iconify-icon icon="bxs:trash" style="color: red; margin-left: 10px; font-size: 22px;" onclick="deleteCartItem(${item.id})"></iconify-icon>
        `;
        listCard.appendChild(cartItem); // Add the new item to the cart list
    });

    total.textContent = `${symbol}${totalAmount.toLocaleString()}`; // Update total amount display with the correct symbol
}

// Function to delete a cart item
function deleteCartItem(id) {
    // Remove the item from cartItems
    delete cartItems[id];

    // Save updated cart items to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    updateCart(); // Update the cart display
    updateQuantityDisplay(); // Update quantity display
}

// Function to toggle item visibility based on checkbox state
function toggleItem(checkbox, id) {
    if (cartItems[id]) {
        if (checkbox.checked) {
            // Remove item from cartItems
            delete cartItems[id];
            // Save updated cart items to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            // Update the cart display
            updateCart();
            // Show the item in the bottom sheet
            showPreviousItem(id);
            
            // Reset the cart count to 0
            updateQuantityDisplay(); // Update quantity display after removing the item
        } else {
            // If unchecked, you might want to add it back to the cart
            // Optionally handle re-adding the item if needed
            // Here you can implement logic to re-add the item if necessary
        }
    }
}
// Function to show previous items in the bottom sheet
function showPreviousItem(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        // Retrieve previous items from localStorage
        let previousItems = JSON.parse(localStorage.getItem('previousItems')) || [];

        // Check if the product is already in the previous items
        if (!previousItems.some(item => item.id === product.id)) {
            // Only add if it's not already there
            previousItems.push(product);
            localStorage.setItem('previousItems', JSON.stringify(previousItems));

            // Get the selected currency symbol
            const selectedCurrency = localStorage.getItem('currency') || 'PHP';
            const symbol = currencySymbols[selectedCurrency];

            // Display the item in the bottom sheet
            const previousItemsContainer = document.querySelector('.previous-items');
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('previous-item');
            itemDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="previous-image">
                <div class="previous-title">${product.name}</div>
                <div class="previous-brand">${product.brand}</div>
                <div class="previous-price">${symbol}${product.price.toLocaleString()}</div>
                <div class="previous-store">${product.store}</div>
            `;
            previousItemsContainer.appendChild(itemDiv);
        }
    }
}

// Function to load previous items from localStorage
function loadPreviousItems() {
    const previousItemsContainer = document.querySelector('.previous-items');
    previousItemsContainer.innerHTML = ''; // Clear existing items

    const previousItems = JSON.parse(localStorage.getItem('previousItems')) || [];
    const selectedCurrency = localStorage.getItem('currency') || 'PHP'; // Get the selected currency
    const symbol = currencySymbols[selectedCurrency]; // Get the corresponding symbol

    previousItems.forEach(product => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('previous-item');
        itemDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="previous-image">
            <div class="previous-title">${product.name}</div>
            <div class="previous-brand">${product.brand}</div>
            <div class="previous-price">${symbol}${product.price.toLocaleString()}</div>
            <div class="previous-store">${product.store}</div>
        `;
        previousItemsContainer.appendChild(itemDiv);
    });
}

// Function to sort items in the cart
function sortProducts() {
    const sortOption = document.getElementById('sort-list').value;

    // Retrieve previous items from localStorage
    const previousItems = JSON.parse(localStorage.getItem('previousItems')) || [];
    const previousItemIds = new Set(previousItems.map(item => item.id)); // Create a set of previous item IDs

    if (sortOption === 'product-name') {
        products.sort((a, b) => a.name.localeCompare(b.name)); // Sort by product name A-Z
    } else if (sortOption === 'price') {
        products.sort((a, b) => a.price - b.price); // Sort by price (lowest to highest)
    } else if (sortOption === 'priority') {
        products.sort((a, b) => {
            const aInPrevious = previousItemIds.has(a.id) ? 0 : 1; // If in previous items, prioritize (0)
            const bInPrevious = previousItemIds.has(b.id) ? 0 : 1; // If in previous items, prioritize (0)
            return aInPrevious - bInPrevious; // Sort by priority first
        });
    }

    initApp(); // Reinitialize the app to display the sorted products
}

// Add the filterByCategory function
function filterByCategory(category) {
    // Clear the current list
    list.innerHTML = '';

    // Load products from localStorage
    if (category === 'all') {
        // If 'all' is selected, show all products
        products.forEach((value) => {
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.innerHTML = `
                <img src="${value.image}" alt="${value.name}">
                <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                <div class="title">${value.name}</div>
                <div class="price">₱${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${value.id})">Add To Cart</button>`;
            list.appendChild(newDiv);
        });
    } else {
        // Filter products by the selected category
        products.forEach((value) => {
            if (value.category === category) {
                let newDiv = document.createElement('div');
                newDiv.classList.add('item');
                newDiv.innerHTML = `
                    <img src="${value.image}" alt="${value.name}">
                    <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                    <div class="title">${value.name}</div>
                    <div class="price">₱${value.price.toLocaleString()}</div>
                    <button onclick="addToCart(${value.id})">Add To Cart</button>`;
                list.appendChild(newDiv);
            }
        });
    }

    // Remove the active class from all categories
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.classList.remove('active-category'));

    // Add the active class to the clicked category
    const activeCategory = [...categories].find(cat => cat.textContent.trim().toLowerCase() === category);
    if (activeCategory) {
        activeCategory.classList.add('active-category');
    }

    // Save the active category to local storage
    localStorage.setItem('activeCategory', category);

    updateCart(); // Update the cart display after filtering
}

// Function to filter products based on name or price
function filterProducts(searchTerm) {
    // Clear the current list
    list.innerHTML = '';

    // Load products from localStorage
    products.forEach((value) => {
        // Check if the product name or price matches the search term
        if (value.name.toLowerCase().includes(searchTerm) || value.price.toString().includes(searchTerm)) {
            let newDiv = document.createElement('div');
            newDiv.classList.add('item');
            newDiv.innerHTML = `
                <img src="${value.image}" alt="${value.name}">
                <iconify-icon icon="mdi:text-box-edit" id="edit" onclick="openEditModal(${value.id})"></iconify-icon>
                <div class="title">${value.name}</div>
                <div class="price">₱${value.price.toLocaleString()}</div>
                <button onclick="addToCart(${value.id})">Add To Cart</button>`;
            list.appendChild(newDiv);
        }
    });
}

// Add event listener for "Remove All" button
document.getElementById('removeAllBtn').addEventListener('click', () => {
    // Clear all items in the cart
    cartItems = {}; // Reset cartItems
    localStorage.removeItem('cartItems'); // Remove from localStorage
    updateCart(); // Refresh the cart display
    updateQuantityDisplay(); // Update quantity display
});