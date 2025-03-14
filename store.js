document.addEventListener('DOMContentLoaded', () => {
    const productsList = document.getElementById('productsList');
    const categoryTitle = document.getElementById('categoryTitle');

    // Category Button Elements
    const carsCategoryBtn = document.getElementById('carsCategoryBtn');
    const housesCategoryBtn = document.getElementById('housesCategoryBtn');
    const businessCategoryBtn = document.getElementById('businessCategoryBtn');
    const vipCategoryBtn = document.getElementById('vipCategoryBtn');
    const instantActivationBtn = document.getElementById('instantActivationBtn');
    const gangCreationBtn = document.getElementById('gangCreationBtn');

    // Predefined Store Categories and Dynamic Products
    const storeCategories = {
        cars: [],
        houses: [],
        business: [],
        vip: [],
        instantActivation: [],
        gangCreation: []
    };

    // Load products from localStorage
    function loadStoredProducts() {
        const storedProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        
        // Clear existing categories
        Object.keys(storeCategories).forEach(category => {
            storeCategories[category] = [];
        });

        // Populate categories with stored products
        storedProducts.forEach(product => {
            const category = product.category;
            if (storeCategories[category] !== undefined) {
                storeCategories[category].push(product);
            }
        });
    }

    // Render Products Function
    function renderProducts(category) {
        loadStoredProducts(); // Ensure latest products are loaded

        const products = storeCategories[category] || [];
        productsList.innerHTML = '';

        if (products.length === 0) {
            productsList.innerHTML = `
                <div class="col-12 text-center text-muted">
                    <i class="fas fa-shopping-basket fa-3x mb-3"></i>
                    <p>لا توجد منتجات متاحة في هذه الفئة حاليًا</p>
                </div>
            `;
            return;
        }

        products.forEach((product, index) => {
            const productCol = document.createElement('div');
            productCol.classList.add('col-md-6');
            productCol.innerHTML = `
                <div class="store-item card mb-3 animate__animated animate__fadeIn">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <button class="btn btn-primary btn-buy" data-product='${JSON.stringify(product)}'>
                                <span class="btn-buy-text">
                                    <i class="fas fa-shopping-cart me-2"></i>شراء
                                </span>
                                <span class="btn-price">${product.prices.game}</span>
                            </button>
                            <span class="badge bg-info">الكمية: ${product.quantity}</span>
                        </div>
                    </div>
                </div>
            `;

            productsList.appendChild(productCol);
        });

        // Add event listeners for buy buttons
        document.querySelectorAll('.btn-buy').forEach(button => {
            button.addEventListener('click', handleBuyProduct);
            
            // Add hover effects
            button.addEventListener('mouseenter', (e) => {
                e.target.classList.add('animate__animated', 'animate__pulse');
            });
            
            button.addEventListener('mouseleave', (e) => {
                e.target.classList.remove('animate__animated', 'animate__pulse');
            });
        });
    }

    // Enhanced Buy Product Function
    function handleBuyProduct(e) {
        const product = JSON.parse(e.target.dataset.product);

        Swal.fire({
            title: `حجز ${product.name}`,
            html: `
                <div class="product-buy-container animate__animated animate__zoomIn">
                    <div class="product-details mb-4">
                        <img src="${product.image}" class="img-fluid mb-3" style="max-height: 200px; object-fit: cover;">
                        <h3>${product.name}</h3>
                        <p class="text-muted">${product.description}</p>
                    </div>
                    <div class="payment-methods">
                        <h4 class="mb-3">اختر طريقة الدفع</h4>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="payment-option" data-method="game">
                                    <i class="fas fa-gamepad"></i>
                                    <span>داخل اللعبة</span>
                                    <small>${product.prices.game}</small>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="payment-option" data-method="proBot">
                                    <i class="fas fa-robot"></i>
                                    <span>Pro Bot</span>
                                    <small>${product.prices.proBot}</small>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="payment-option" data-method="djezzy">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>Djezzy</span>
                                    <small>${product.prices.djezzy}</small>
                                </div>
                            </div>
                        </div>
                        <div id="proofUploadSection" class="mt-4 d-none">
                            <label for="proofUpload" class="form-label">رفع دليل الدفع</label>
                            <input type="file" class="form-control" id="proofUpload" accept="image/*">
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'حجز',
            confirmButtonClass: 'btn-success',
            cancelButtonText: 'إلغاء',
            showCancelButton: true,
            didRender: () => {
                const paymentOptions = document.querySelectorAll('.payment-option');
                const proofUploadSection = document.getElementById('proofUploadSection');
                let selectedPaymentMethod = null;

                paymentOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        // Remove selection from all options
                        paymentOptions.forEach(opt => opt.classList.remove('selected'));
                        
                        // Add selection to clicked option
                        option.classList.add('selected');
                        selectedPaymentMethod = option.dataset.method;

                        // Show proof upload for certain methods
                        if (['proBot', 'djezzy'].includes(selectedPaymentMethod)) {
                            proofUploadSection.classList.remove('d-none');
                        } else {
                            proofUploadSection.classList.add('d-none');
                        }
                    });
                });
            },
            preConfirm: () => {
                const paymentMethod = document.querySelector('.payment-option.selected')?.dataset.method;
                const proofUpload = document.getElementById('proofUpload');

                if (!paymentMethod) {
                    Swal.showValidationMessage('يرجى اختيار طريقة الدفع');
                    return false;
                }

                if (['proBot', 'djezzy'].includes(paymentMethod) && (!proofUpload.files || proofUpload.files.length === 0)) {
                    Swal.showValidationMessage('يرجى رفع دليل الدفع');
                    return false;
                }

                return { 
                    product, 
                    paymentMethod,
                    proofFile: proofUpload.files[0],
                    customerName: localStorage.getItem('currentUser') || 'مستخدم مجهول'
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const reservedItem = {
                        ...result.value.product,
                        paymentMethod: result.value.paymentMethod,
                        proofImage: result.value.paymentMethod !== 'game' ? reader.result : null,
                        reservationDate: new Date().toISOString(),
                        customerName: result.value.customerName,
                        status: 'pending', // Add status for admin review
                        id: Date.now() // Unique identifier
                    };

                    // Save to reservations
                    const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
                    reservations.push(reservedItem);
                    localStorage.setItem('storeReservations', JSON.stringify(reservations));

                    // Create notification for admin
                    addNotification(
                        'طلب حجز جديد', 
                        `طلب حجز جديد للمنتج: ${reservedItem.name} من ${reservedItem.customerName}`, 
                        'store'
                    );

                    Swal.fire({
                        title: 'تم الحجز',
                        text: `تم إرسال طلب حجز ${result.value.product.name} للمراجعة`,
                        icon: 'success',
                        confirmButtonText: 'حسنًا'
                    });
                };

                // Only read file for non-game payment methods
                if (result.value.paymentMethod !== 'game' && result.value.proofFile) {
                    reader.readAsDataURL(result.value.proofFile);
                } else {
                    // Simulate same process for game payment
                    const reservedItem = {
                        ...result.value.product,
                        paymentMethod: result.value.paymentMethod,
                        proofImage: null,
                        reservationDate: new Date().toISOString(),
                        customerName: result.value.customerName,
                        status: 'pending',
                        id: Date.now()
                    };

                    const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
                    reservations.push(reservedItem);
                    localStorage.setItem('storeReservations', JSON.stringify(reservations));

                    // Create notification for admin
                    addNotification(
                        'طلب حجز جديد', 
                        `طلب حجز جديد للمنتج: ${reservedItem.name} من ${reservedItem.customerName}`, 
                        'store'
                    );

                    Swal.fire({
                        title: 'تم الحجز',
                        text: `تم إرسال طلب حجز ${result.value.product.name} للمراجعة`,
                        icon: 'success',
                        confirmButtonText: 'حسنًا'
                    });
                }
            }
        });
    }

    // Helper function to add notification
    function addNotification(title, message, type = 'general') {
        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        
        const newNotification = {
            id: Date.now().toString(),
            title,
            message,
            type,
            date: new Date().toISOString(),
            read: false
        };

        notifications.push(newNotification);
        localStorage.setItem('userNotifications', JSON.stringify(notifications));
    }

    // Category Button Event Listeners
    function setupCategoryListeners() {
        const categoryMap = {
            carsCategoryBtn: 'cars',
            housesCategoryBtn: 'houses',
            businessCategoryBtn: 'business',
            vipCategoryBtn: 'vip',
            instantActivationBtn: 'instantActivation',
            gangCreationBtn: 'gangCreation'
        };

        Object.keys(categoryMap).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    const category = categoryMap[btnId];
                    categoryTitle.innerHTML = `
                        <i class="fas ${getCategoryIcon(category)} me-2"></i>
                        ${getCategoryTitle(category)}
                    `;
                    if (category === 'gangCreation') {
                        handleGangCreation();
                    } else {
                        renderProducts(category);
                    }
                });
            }
        });
    }

    // Helper function to get category icon
    function getCategoryIcon(category) {
        const iconMap = {
            cars: 'fa-car',
            houses: 'fa-home',
            business: 'fa-building',
            vip: 'fa-crown',
            instantActivation: 'fa-bolt',
            gangCreation: 'fa-users'
        };
        return iconMap[category] || 'fa-shopping-cart';
    }

    // Helper function to get category title
    function getCategoryTitle(category) {
        const titleMap = {
            cars: 'السيارات',
            houses: 'المنازل',
            business: 'البيزنس',
            vip: 'VIP',
            instantActivation: 'التفعيل الفوري',
            gangCreation: 'إنشاء عصابة'
        };
        return titleMap[category] || 'متجر السيرفر';
    }

    function handleGangCreation(e) {
        Swal.fire({
            title: 'إنشاء عصابة جديدة',
            html: `
                <div class="gang-creation-container animate__animated animate__fadeIn" style="
                    background: linear-gradient(135deg, #1a2a6c, #b21f1f);
                    border-radius: 15px;
                    padding: 30px;
                    color: white;
                    text-align: center;
                ">
                    <div class="gang-creation-header mb-4">
                        <i class="fas fa-users-cog fa-4x mb-3 text-warning animate__animated animate__pulse"></i>
                        <h2 class="mb-3">أنشئ عصابتك الخاصة</h2>
                        <p class="text-muted">اخط طريقك في عالم EAGLE RP</p>
                    </div>
                    
                    <div class="gang-creation-form">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="gangName" placeholder="اسم العصابة" required>
                                    <label for="gangName">اسم العصابة</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-floating mb-3">
                                    <select class="form-select" id="gangCategory" required>
                                        <option value="">اختر نوع العصابة</option>
                                        <option value="street">عصابة شوارع</option>
                                        <option value="mafia">عصابة مافيا</option>
                                        <option value="cartel">كارتيل</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                    <label for="gangCategory">تصنيف العصابة</label>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="discordUsername" placeholder="اسم المستخدم في الديسكورد" required>
                                    <label for="discordUsername">اسم المستخدم في الديسكورد</label>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="discordId" placeholder="معرف حسابك في الديسكورد" required>
                                    <label for="discordId">معرف حسابك في الديسكورد</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="payment-section mt-4">
                            <h4 class="text-center mb-3">
                                <i class="fas fa-money-bill-wave me-2"></i>
                                طرق الدفع المتاحة
                            </h4>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="payment-option" data-method="proBot">
                                        <i class="fas fa-robot"></i>
                                        <span>Pro Bot</span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="payment-option" data-method="djezzy">
                                        <i class="fas fa-mobile-alt"></i>
                                        <span>Djezzy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="create-gang-section mt-4">
                            <button id="createGangBtn" class="btn btn-primary btn-lg w-100 animate__animated animate__rubberBand">
                                <i class="fas fa-users-cog me-2"></i>
                                إنشاء العصابة
                            </button>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            customClass: {
                popup: 'gang-creation-modal'
            },
            didRender: () => {
                const createGangBtn = document.getElementById('createGangBtn');
                const paymentOptions = document.querySelectorAll('.payment-option');
                let selectedPaymentMethod = null;

                // Payment method selection
                paymentOptions.forEach(option => {
                    option.addEventListener('click', () => {
                        paymentOptions.forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');
                        selectedPaymentMethod = option.dataset.method;
                    });
                });

                createGangBtn.addEventListener('click', () => {
                    const gangName = document.getElementById('gangName').value;
                    const gangCategory = document.getElementById('gangCategory').value;
                    const discordUsername = document.getElementById('discordUsername').value;
                    const discordId = document.getElementById('discordId').value;

                    // Validation
                    if (!gangName || !gangCategory || !discordUsername || !discordId || !selectedPaymentMethod) {
                        Swal.fire({
                            icon: 'error',
                            title: 'خطأ',
                            text: 'يرجى ملء جميع الحقول واختيار طريقة الدفع',
                            confirmButtonText: 'حسنًا'
                        });
                        return;
                    }

                    // Confirmation modal
                    Swal.fire({
                        title: 'تأكيد إنشاء العصابة',
                        html: `
                            <div class="text-center">
                                <i class="fas fa-users fa-4x text-primary mb-3 animate__animated animate__bounceIn"></i>
                                <h3>هل أنت متأكد من إنشاء العصابة؟</h3>
                                <div class="gang-details text-start mt-3">
                                    <p><strong>اسم العصابة:</strong> ${gangName}</p>
                                    <p><strong>التصنيف:</strong> ${getGangCategoryLabel(gangCategory)}</p>
                                    <p><strong>اسم الديسكورد:</strong> ${discordUsername}</p>
                                    <p><strong>طريقة الدفع:</strong> ${getPaymentMethodLabel(selectedPaymentMethod)}</p>
                                </div>
                            </div>
                        `,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'نعم، أنشئ العصابة',
                        cancelButtonText: 'إلغاء'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');
                            
                            const newGang = {
                                id: Date.now(),
                                gangName,
                                gangCategory,
                                discordUsername,
                                discordId,
                                paymentMethod: selectedPaymentMethod,
                                creationDate: new Date().toISOString(),
                                status: 'pending'
                            };

                            gangs.push(newGang);
                            localStorage.setItem('serverGangs', JSON.stringify(gangs));

                            Swal.fire({
                                title: 'تم الإنشاء',
                                text: 'تم إرسال طلب إنشاء العصابة بنجاح',
                                icon: 'success',
                                confirmButtonText: 'حسنًا'
                            });
                        }
                    });
                });
            }
        });
    }

    // Helper functions
    function getGangCategoryLabel(category) {
        const labels = {
            'street': 'عصابة شوارع',
            'mafia': 'عصابة مافيا',
            'cartel': 'كارتيل',
            'other': 'أخرى'
        };
        return labels[category] || category;
    }

    function getPaymentMethodLabel(method) {
        const labels = {
            'proBot': 'Pro Bot',
            'djezzy': 'Djezzy'
        };
        return labels[method] || method;
    }

    // Initial setup
    setupCategoryListeners();
    loadStoredProducts(); // Load stored products on initial load
    renderProducts('cars'); // Default category
});