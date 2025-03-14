document.addEventListener('DOMContentLoaded', () => {
    // Select all nav links
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    // Select all admin sections
    const sections = document.querySelectorAll('.admin-section');
    
    // Dashboard section
    const dashboardSection = document.getElementById('dashboard');

    // Navigation event listener
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get target section from data attribute
            const targetSectionId = link.getAttribute('data-section');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Call section-specific loading function
            switch(targetSectionId) {
                case 'applications':
                    loadApplications();
                    break;
                case 'support':
                    loadSupportTickets();
                    break;
                case 'user-management':
                    loadUserManagement();
                    break;
                case 'store-management':
                    loadStoreManagement();
                    loadReservations();
                    break;
                case 'announcements-management':
                    loadAnnouncementsManagement();
                    break;
                case 'streamers-management':
                    loadStreamersManagement();
                    break;
                case 'gangs-management':
                    loadGangsManagement();
                    break;
                case 'notifications':
                    loadNotifications();
                    break;
                case 'settings':
                    loadAdminSettings();
                    break;
                case 'dashboard':
                    // Ensure dashboard is visible when returning to dashboard
                    dashboardSection.style.display = 'block';
                    break;
                case 'reservations':
                    loadReservations();
                    break;
                case 'job-applications-management':
                    loadJobApplicationsManagement();
                    break;
                case 'job-management':
                    loadJobManagement();
                    break;
                default:
                    switch(targetSectionId) {
                        case 'store-management':
                            loadStoreManagement();
                            loadReservations();
                            
                            // Hide other sections
                            sections.forEach(section => {
                                if (section.id !== 'store-management' && section.id !== 'reservations') {
                                    section.style.display = 'none';
                                }
                            });
                            
                            // Show store management and reservations sections
                            document.getElementById('store-management').style.display = 'block';
                            document.getElementById('reservations').style.display = 'block';
                            break;
                    }
            }
        });
    });

    // Enhanced Applications Management
    function loadApplications() {
        const applicationsList = document.getElementById('applicationsList');
        const applications = JSON.parse(localStorage.getItem('joinRequests') || '[]');

        // Clear existing applications
        applicationsList.innerHTML = '';

        applications.forEach(app => {
            const row = document.createElement('tr');
            row.classList.add('animate__animated', 'animate__fadeIn');
            row.innerHTML = `
                <td>${app.gameName}</td>
                <td>${app.age}</td>
                <td>${app.rpExperience}</td>
                <td>
                    <div class="btn-group application-actions" role="group">
                        <button class="btn btn-info btn-sm view-details" data-id="${app.id}">
                            <i class="fas fa-eye me-1"></i>عرض التفاصيل
                        </button>
                        <button class="btn btn-success btn-sm accept-application" data-id="${app.id}">
                            <i class="fas fa-check me-1"></i>قبول
                        </button>
                        <button class="btn btn-warning btn-sm review-application" data-id="${app.id}">
                            <i class="fas fa-clock me-1"></i>قيد المراجعة
                        </button>
                        <button class="btn btn-danger btn-sm reject-application" data-id="${app.id}">
                            <i class="fas fa-times me-1"></i>رفض
                        </button>
                    </div>
                </td>
            `;
            applicationsList.appendChild(row);
        });

        // Add event listeners for application actions
        applicationsList.addEventListener('click', handleApplicationAction);
    }

    // User Management Section
    function loadUserManagement() {
        const userManagementSection = document.getElementById('user-management');
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const usersList = document.createElement('div');
        usersList.classList.add('list-group');

        Object.values(users).forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'align-items-center');
            userItem.innerHTML = `
                <div>
                    <h5 class="mb-1">${user.username}</h5>
                    <p class="mb-1">${user.email}</p>
                </div>
                <div>
                    <button class="btn btn-info btn-sm view-user me-2" data-username="${user.username}">
                        <i class="fas fa-eye me-1"></i>عرض
                    </button>
                    <button class="btn btn-danger btn-sm delete-user" data-username="${user.username}">
                        <i class="fas fa-trash me-1"></i>حذف
                    </button>
                </div>
            `;
            usersList.appendChild(userItem);
        });

        // Clear existing content and add new list
        userManagementSection.innerHTML = '<h1 class="mt-4">إدارة المستخدمين</h1>';
        userManagementSection.appendChild(usersList);

        // Add event listeners for user actions
        usersList.addEventListener('click', handleUserAction);
    }

    // Support Tickets Management
    function loadSupportTickets() {
        const adminTicketsList = document.getElementById('adminTicketsList');
        const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        
        adminTicketsList.innerHTML = '';
        tickets.forEach(ticket => {
            const ticketRow = document.createElement('div');
            ticketRow.classList.add('card', 'mb-3', 'ticket-card', 'animate__animated', 'animate__fadeIn');
            ticketRow.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="card-title mb-1">${ticket.playerName}</h5>
                            <span class="badge ${getStatusBadgeClass(ticket.status)}">${getStatusText(ticket.status)}</span>
                        </div>
                        <div class="ticket-actions">
                            <select class="form-select ticket-status mb-2" data-ticket-id="${ticket.id}">
                                <option value="processing" ${ticket.status === 'processing' ? 'selected' : ''}>قيد المعالجة</option>
                                <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>تم الحل</option>
                                <option value="rejected" ${ticket.status === 'rejected' ? 'selected' : ''}>مرفوض</option>
                            </select>
                            <button class="btn btn-primary btn-sm respond-ticket" data-ticket-id="${ticket.id}">
                                <i class="fas fa-reply me-1"></i>الرد على التذكرة
                            </button>
                        </div>
                    </div>
                    <div class="ticket-details">
                        <p class="card-text mb-2"><strong>نوع المشكلة:</strong> ${ticket.issueType}</p>
                        <p class="card-text mb-2"><strong>التفاصيل:</strong> ${ticket.issueDetails}</p>
                        <p class="text-muted">رابط الديسكورد: ${ticket.discordLink}</p>
                    </div>
                </div>
            `;
            
            adminTicketsList.appendChild(ticketRow);
        });

        // Add event listeners for ticket actions
        document.querySelectorAll('.ticket-status').forEach(select => {
            select.addEventListener('change', handleTicketStatusChange);
        });

        document.querySelectorAll('.respond-ticket').forEach(button => {
            button.addEventListener('click', handleTicketResponse);
        });
    }

    // Helper function to get status badge class
    function getStatusBadgeClass(status) {
        switch(status) {
            case 'processing': return 'bg-warning text-dark';
            case 'resolved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    // Helper function to get status text
    function getStatusText(status) {
        switch(status) {
            case 'processing': return 'قيد المعالجة';
            case 'resolved': return 'تم الحل';
            case 'rejected': return 'مرفوض';
            default: return 'جديد';
        }
    }

    // Handle ticket status change
    function handleTicketStatusChange(e) {
        const ticketId = e.target.dataset.ticketId;
        const newStatus = e.target.value;
        
        updateTicketStatus(ticketId, newStatus);
    }

    // Handle ticket response
    function handleTicketResponse(e) {
        const ticketId = e.target.dataset.ticketId;
        
        Swal.fire({
            title: 'الرد على التذكرة',
            html: `
                <textarea id="ticketResponse" class="form-control" rows="5" placeholder="أدخل ردك..."></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'إرسال الرد',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const response = document.getElementById('ticketResponse').value;
                if (!response.trim()) {
                    Swal.showValidationMessage('يرجى إدخال الرد');
                    return false;
                }
                return response;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
                const ticketIndex = tickets.findIndex(t => t.id.toString() === ticketId);
                
                if (ticketIndex !== -1) {
                    tickets[ticketIndex].status = 'resolved';
                    tickets[ticketIndex].adminResponse = result.value;
                    localStorage.setItem('supportTickets', JSON.stringify(tickets));

                    Swal.fire({
                        title: 'تم إرسال الرد',
                        text: 'شكرًا على مساعدتك في حل المشكلة',
                        icon: 'success',
                        confirmButtonText: 'حسنًا'
                    });

                    loadSupportTickets();
                }
            }
        });
    }

    // Update ticket status
    function updateTicketStatus(ticketId, newStatus) {
        const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        const ticketIndex = tickets.findIndex(t => t.id.toString() === ticketId);
        
        if (ticketIndex !== -1) {
            tickets[ticketIndex].status = newStatus;
            localStorage.setItem('supportTickets', JSON.stringify(tickets));
            
            Swal.fire({
                title: 'تم تحديث التذكرة',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });

            loadSupportTickets();
        }
    }

    // Handle application action
    function handleApplicationAction(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const applicationId = target.dataset.id;
        const applications = JSON.parse(localStorage.getItem('joinRequests') || '[]');
        const applicationIndex = applications.findIndex(app => app.id.toString() === applicationId);

        if (applicationIndex === -1) return;

        // Animate button click
        target.classList.add('animate__rubberBand');
        setTimeout(() => {
            target.classList.remove('animate__rubberBand');
        }, 1000);

        if (target.classList.contains('view-details')) {
            showApplicationDetails(applications[applicationIndex]);
        } else if (target.classList.contains('accept-application')) {
            acceptApplication(applications[applicationIndex]);
        } else if (target.classList.contains('review-application')) {
            reviewApplication(applications[applicationIndex]);
        } else if (target.classList.contains('reject-application')) {
            rejectApplication(applications[applicationIndex]);
        }
    }

    // Show application details
    function showApplicationDetails(application) {
        Swal.fire({
            title: 'تفاصيل الطلب',
            html: `
                <div class="application-details animate__animated animate__zoomIn">
                    <div class="detail-section">
                        <i class="fas fa-user-circle fa-3x text-primary mb-3"></i>
                        <div class="detail-item">
                            <strong>الاسم داخل اللعبة:</strong>
                            <span>${application.gameName}</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <i class="fas fa-link fa-3x text-success mb-3"></i>
                        <div class="detail-item">
                            <strong>رابط الديسكورد:</strong>
                            <span>${application.discordLink}</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <i class="fas fa-birthday-cake fa-3x text-info mb-3"></i>
                        <div class="detail-item">
                            <strong>العمر:</strong>
                            <span>${application.age}</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <i class="fas fa-gamepad fa-3x text-warning mb-3"></i>
                        <div class="detail-item">
                            <strong>الخبرة:</strong>
                            <span>${application.rpExperience}</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <i class="fas fa-comment-dots fa-3x text-secondary mb-3"></i>
                        <div class="detail-item">
                            <strong>سبب الانضمام:</strong>
                            <p>${application.joinReason}</p>
                        </div>
                    </div>
                    <div class="detail-section">
                        <i class="fas fa-calendar-alt fa-3x text-danger mb-3"></i>
                        <div class="detail-item">
                            <strong>تاريخ التقديم:</strong>
                            <span>${new Date(application.submissionDate).toLocaleString('ar-EG')}</span>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'إغلاق',
            customClass: {
                confirmButton: 'btn btn-secondary animate__animated animate__bounceIn'
            }
        });
    }

    // Accept application
    function acceptApplication(application) {
        application.status = 'accepted';
        updateApplicationInStorage(application);
        
        Swal.fire({
            title: 'تم قبول الطلب',
            html: `
                <div class="text-center">
                    <i class="fas fa-check-circle fa-4x text-success mb-3 animate__animated animate__bounceIn"></i>
                    <p>تم قبول طلب ${application.gameName}</p>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'حسنًا',
            customClass: {
                confirmButton: 'btn btn-primary animate__animated animate__rubberBand'
            }
        });

        addNotification(
            'طلب انضمام مقبول', 
            `تم قبول طلب الانضمام الخاص بـ ${application.gameName}`, 
            'application'
        );

        loadApplications();
    }

    // Review application
    function reviewApplication(application) {
        application.status = 'under_review';
        updateApplicationInStorage(application);
        
        Swal.fire({
            title: 'قيد المراجعة',
            html: `
                <div class="text-center">
                    <i class="fas fa-clock fa-4x text-warning mb-3 animate__animated animate__fadeIn"></i>
                    <p>تم وضعطلب ${application.gameName} قيد المراجعة</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'حسنًا',
            customClass: {
                confirmButton: 'btn btn-secondary animate__animated animate__tada'
            }
        });

        loadApplications();
    }

    // Reject application
    function rejectApplication(application) {
        application.status = 'rejected';
        updateApplicationInStorage(application);
        
        Swal.fire({
            title: 'تم رفض الطلب',
            html: `
                <div class="text-center">
                    <i class="fas fa-times-circle fa-4x text-danger mb-3 animate__animated animate__shakeX"></i>
                    <p>تم رفض طلب ${application.gameName}</p>
                </div>
            `,
            icon: 'warning',
            confirmButtonText: 'حسنًا',
            customClass: {
                confirmButton: 'btn btn-danger animate__animated animate__pulse'
            }
        });

        addNotification(
            'طلب انضمام مرفوض', 
            `تم رفض طلب الانضمام الخاص بـ ${application.gameName}`, 
            'application'
        );

        loadApplications();
    }

    // Update application in storage
    function updateApplicationInStorage(application) {
        const applications = JSON.parse(localStorage.getItem('joinRequests') || '[]');
        const index = applications.findIndex(app => app.id === application.id);
        
        if (index !== -1) {
            applications[index] = application;
            localStorage.setItem('joinRequests', JSON.stringify(applications));
        }
    }

    // User management action handler
    function handleUserAction(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const username = target.dataset.username;
        const users = JSON.parse(localStorage.getItem('users') || '{}');

        if (target.classList.contains('view-user')) {
            showUserDetails(users[username]);
        } else if (target.classList.contains('delete-user')) {
            deleteUser(username);
        }
    }

    // Show user details
    function showUserDetails(user) {
        Swal.fire({
            title: 'تفاصيل المستخدم',
            html: `
                <div class="user-details text-start">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>اسم المستخدم:</strong> ${user.username}</p>
                            <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'إغلاق',
            customClass: {
                confirmButton: 'btn btn-secondary'
            }
        });
    }

    // Delete user
    function deleteUser(username) {
        Swal.fire({
            title: 'حذف المستخدم',
            text: `هل أنت متأكد من رغبتك في حذف المستخدم ${username}؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-secondary'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                delete users[username];
                localStorage.setItem('users', JSON.stringify(users));

                Swal.fire({
                    title: 'تم الحذف',
                    text: 'تم حذف المستخدم بنجاح',
                    icon: 'success'
                });

                loadUserManagement();
            }
        });
    }

    // Add notification helper
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

    // Store Management Section
    function loadStoreManagement() {
        const productsList = document.getElementById('storeProductsList').querySelector('tbody');
        const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');

        // Clear existing products
        productsList.innerHTML = '';

        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${product.name}</td>
                <td>${product.prices.game}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm view-product" data-index="${index}">
                            <i class="fas fa-eye me-1"></i>عرض
                        </button>
                        <button class="btn btn-warning btn-sm edit-product" data-index="${index}">
                            <i class="fas fa-edit me-1"></i>تعديل
                        </button>
                        <button class="btn btn-danger btn-sm delete-product" data-index="${index}">
                            <i class="fas fa-trash me-1"></i>حذف
                        </button>
                    </div>
                </td>
            `;
            productsList.appendChild(row);
        });

        // Add event listeners for product actions
        document.querySelectorAll('.view-product').forEach(btn => {
            btn.addEventListener('click', handleViewProduct);
        });

        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', handleEditProduct);
        });

        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', handleDeleteProduct);
        });
    }

    function handleAddProduct() {
        Swal.fire({
            title: 'إضافة منتج جديد',
            html: `
                <div class="form-group mb-3">
                    <label>اسم المنتج</label>
                    <input type="text" id="productName" class="form-control" required>
                </div>
                <div class="form-group mb-3">
                    <label>وصف المنتج</label>
                    <textarea id="productDescription" class="form-control" required></textarea>
                </div>
                <div class="form-group mb-3">
                    <label>الفئة</label>
                    <select id="productCategory" class="form-control" required>
                        <option value="">اختر فئة المنتج</option>
                        <option value="cars">السيارات</option>
                        <option value="houses">المنازل</option>
                        <option value="business">البيزنس</option>
                        <option value="vip">VIP</option>
                        <option value="instantActivation">التفعيل الفوري</option>
                        <option value="gangCreation">إنشاء عصابة</option>
                        <option value="other">أخرى</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label>السعر</label>
                    <div class="row">
                        <div class="col-md-4">
                            <input type="number" id="priceGame" class="form-control" placeholder="داخل اللعبة" required>
                        </div>
                        <div class="col-md-4">
                            <input type="number" id="priceProBot" class="form-control" placeholder="Pro Bot" required>
                        </div>
                        <div class="col-md-4">
                            <input type="number" id="priceDjezzy" class="form-control" placeholder="Djezzy" required>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label>الكمية</label>
                    <input type="number" id="productQuantity" class="form-control" placeholder="عدد المنتجات المتاحة" required>
                </div>
                <div class="form-group mb-3">
                    <label>صورة المنتج</label>
                    <input type="file" id="productImage" class="form-control" accept="image/*" required>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'إضافة',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const name = document.getElementById('productName').value;
                const description = document.getElementById('productDescription').value;
                const category = document.getElementById('productCategory').value;
                const priceGame = document.getElementById('priceGame').value;
                const priceProBot = document.getElementById('priceProBot').value;
                const priceDjezzy = document.getElementById('priceDjezzy').value;
                const quantity = document.getElementById('productQuantity').value;
                const imageFile = document.getElementById('productImage').files[0];

                if (!name || !description || !category || !priceGame || !priceProBot || !priceDjezzy || !quantity || !imageFile) {
                    Swal.showValidationMessage('يرجى ملء جميع الحقول');
                    return false;
                }

                // Read image file as base64
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            id: Date.now(), // Add unique ID
                            name,
                            description,
                            category,
                            prices: {
                                'game': `${priceGame}M داخل اللعبة`,
                                'proBot': `${priceProBot}M`,
                                'djezzy': `${priceDjezzy} دينار`
                            },
                            quantity: parseInt(quantity),
                            paymentOptions: {
                                'game': {
                                    details: 'يرجى التواصل معنا عبر الديسكورد',
                                    contactMethod: 'Discord'
                                },
                                'proBot': {
                                    ownerId: 'EAGLE_OWNER_ID',
                                    discordUsername: 'EAGLE_ADMIN'
                                },
                                'djezzy': {
                                    phoneNumber: '0783029840'
                                }
                            },
                            image: reader.result
                        });
                    };
                    reader.readAsDataURL(imageFile);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
                products.push(result.value);
                localStorage.setItem('storeProducts', JSON.stringify(products));

                Swal.fire({
                    title: 'تمت الإضافة',
                    html: `
                        <div class="text-center">
                            <img src="${result.value.image}" style="max-width: 200px; max-height: 200px; object-fit: cover;">
                            <p class="mt-3">تم إضافة المنتج بنجاح: ${result.value.name}</p>
                            <p>الفئة: ${getCategoryLabel(result.value.category)}</p>
                            <p>الكمية: ${result.value.quantity}</p>
                        </div>
                    `,
                    icon: 'success'
                });

                // Reload store management section
                loadStoreManagement();
            }
        });
    }

    // Function to handle editing a product
    function handleEditProduct(e) {
        const index = e.target.dataset.index;
        const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        const product = products[index];

        Swal.fire({
            title: 'تعديل المنتج',
            html: `
                <div class="form-group mb-3">
                    <label>اسم المنتج</label>
                    <input type="text" id="editProductName" class="form-control" value="${product.name}" required>
                </div>
                <div class="form-group mb-3">
                    <label>وصف المنتج</label>
                    <textarea id="editProductDescription" class="form-control" required>${product.description}</textarea>
                </div>
                <div class="form-group mb-3">
                    <label>الفئة</label>
                    <select id="editProductCategory" class="form-control" required>
                        <option value="cars" ${product.category === 'cars' ? 'selected' : ''}>السيارات</option>
                        <option value="houses" ${product.category === 'houses' ? 'selected' : ''}>المنازل</option>
                        <option value="business" ${product.category === 'business' ? 'selected' : ''}>البيزنس</option>
                        <option value="vip" ${product.category === 'vip' ? 'selected' : ''}>VIP</option>
                        <option value="instantActivation" ${product.category === 'instantActivation' ? 'selected' : ''}>التفعيل الفوري</option>
                        <option value="gangCreation" ${product.category === 'gangCreation' ? 'selected' : ''}>إنشاء عصابة</option>
                        <option value="other" ${product.category === 'other' ? 'selected' : ''}>أخرى</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label>السعر</label>
                    <div class="row">
                        <div class="col-md-4">
                            <input type="number" id="editPriceGame" class="form-control" placeholder="داخل اللعبة" value="${parseInt(product.prices.game)}" required>
                        </div>
                        <div class="col-md-4">
                            <input type="number" id="editPriceProBot" class="form-control" placeholder="Pro Bot" value="${parseInt(product.prices.proBot)}" required>
                        </div>
                        <div class="col-md-4">
                            <input type="number" id="editPriceDjezzy" class="form-control" placeholder="Djezzy" value="${parseInt(product.prices.djezzy)}" required>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label>الكمية</label>
                    <input type="number" id="editProductQuantity" class="form-control" value="${product.quantity}" required>
                </div>
                <div class="form-group mb-3">
                    <label>صورة المنتج</label>
                    <input type="file" id="editProductImage" class="form-control" accept="image/*">
                    <small class="text-muted">اترك هذا الحقل فارغًا للاحتفاظ بالصورة الحالية</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'حفظ التعديلات',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const name = document.getElementById('editProductName').value;
                const description = document.getElementById('editProductDescription').value;
                const category = document.getElementById('editProductCategory').value;
                const priceGame = document.getElementById('editPriceGame').value;
                const priceProBot = document.getElementById('editPriceProBot').value;
                const priceDjezzy = document.getElementById('editPriceDjezzy').value;
                const quantity = document.getElementById('editProductQuantity').value;
                const imageFile = document.getElementById('editProductImage').files[0];

                if (!name || !description || !category || !priceGame || !priceProBot || !priceDjezzy || !quantity) {
                    Swal.showValidationMessage('يرجى ملء جميع الحقول');
                    return false;
                }

                // If no new image, use existing image
                if (!imageFile) {
                    return {
                        id: product.id,
                        name,
                        description,
                        category,
                        prices: {
                            'game': `${priceGame}M داخل اللعبة`,
                            'proBot': `${priceProBot}M`,
                            'djezzy': `${priceDjezzy} دينار`
                        },
                        quantity: parseInt(quantity),
                        paymentOptions: product.paymentOptions,
                        image: product.image
                    };
                }

                // Read new image file as base64
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            id: product.id,
                            name,
                            description,
                            category,
                            prices: {
                                'game': `${priceGame}M داخل اللعبة`,
                                'proBot': `${priceProBot}M`,
                                'djezzy': `${priceDjezzy} دينار`
                            },
                            quantity: parseInt(quantity),
                            paymentOptions: product.paymentOptions,
                            image: reader.result
                        });
                    };
                    reader.readAsDataURL(imageFile);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
                const index = products.findIndex(p => p.id === result.value.id);
                
                if (index !== -1) {
                    products[index] = result.value;
                    localStorage.setItem('storeProducts', JSON.stringify(products));

                    Swal.fire({
                        title: 'تم التعديل',
                        text: 'تم تحديث المنتج بنجاح',
                        icon: 'success'
                    });

                    // Reload store management section
                    loadStoreManagement();
                }
            }
        });
    }

    // Function to handle viewing product details
    function handleViewProduct(e) {
        const index = e.target.dataset.index;
        const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        const product = products[index];

        Swal.fire({
            title: 'تفاصيل المنتج',
            html: `
                <div class="text-center">
                    <img src="${product.image}" alt="${product.name}" style="max-width: 200px; max-height: 200px; object-fit: cover; margin-bottom: 20px;">
                    <h3>${product.name}</h3>
                    <p><strong>الفئة:</strong> ${getCategoryLabel(product.category)}</p>
                    <p><strong>السعر:</strong> ${product.prices.game}</p>
                    <p><strong>الكمية:</strong> ${product.quantity}</p>
                </div>
            `,
            confirmButtonText: 'إغلاق'
        });
    }

    // Function to handle deleting a product
    function handleDeleteProduct(e) {
        const index = e.target.dataset.index;
        
        Swal.fire({
            title: 'حذف المنتج',
            text: 'هل أنت متأكد من رغبتك في حذف هذا المنتج؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
                products.splice(index, 1);
                localStorage.setItem('storeProducts', JSON.stringify(products));

                Swal.fire({
                    title: 'تم الحذف',
                    text: 'تم حذف المنتج بنجاح',
                    icon: 'success'
                });

                // Reload store management section
                loadStoreManagement();
            }
        });
    }

    document.getElementById('addProductBtn').addEventListener('click', handleAddProduct);

    // Store Reservation Management Section
    function loadReservations() {
        const reservationsTableBody = document.getElementById('reservationsTableBody');
        const reservationsCount = document.getElementById('reservationsCount');
        
        // Get reservations from localStorage
        const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
        
        // Update reservations count
        reservationsCount.textContent = `${reservations.length} حجز`;
        
        // Clear existing reservations
        reservationsTableBody.innerHTML = '';

        if (reservations.length === 0) {
            reservationsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                        <p>لا توجد حجوزات حاليًا</p>
                    </td>
                </tr>
            `;
            return;
        }

        reservations.forEach((reservation, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation.name}</td>
                <td>${reservation.customerName}</td>
                <td>${getPaymentMethodLabel(reservation.paymentMethod)}</td>
                <td>
                    <span class="badge ${getReservationStatusBadge(reservation.status)}">
                        ${getReservationStatusLabel(reservation.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm view-reservation-details" data-index="${index}">
                            <i class="fas fa-eye me-1"></i>عرض التفاصيل
                        </button>
                        <div class="btn-group" role="group">
                            <button class="btn btn-success btn-sm approve-reservation" data-index="${index}">
                                <i class="fas fa-check me-1"></i>قبول
                            </button>
                            <button class="btn btn-warning btn-sm review-reservation" data-index="${index}">
                                <i class="fas fa-clock me-1"></i>قيد المراجعة
                            </button>
                            <button class="btn btn-danger btn-sm reject-reservation" data-index="${index}">
                                <i class="fas fa-times me-1"></i>رفض
                            </button>
                        </div>
                    </div>
                </td>
            `;
            reservationsTableBody.appendChild(row);
        });

        // Add event listeners for reservation actions
        setupReservationActionListeners();
    }

    function setupReservationActionListeners() {
        // View Reservation Details
        document.querySelectorAll('.view-reservation-details').forEach(btn => {
            btn.addEventListener('click', handleViewReservationDetails);
        });

        // Approve Reservation
        document.querySelectorAll('.approve-reservation').forEach(btn => {
            btn.addEventListener('click', handleApproveReservation);
        });

        // Review Reservation
        document.querySelectorAll('.review-reservation').forEach(btn => {
            btn.addEventListener('click', handleReviewReservation);
        });

        // Reject Reservation
        document.querySelectorAll('.reject-reservation').forEach(btn => {
            btn.addEventListener('click', handleRejectReservation);
        });
    }

    function handleViewReservationDetails(e) {
        const index = e.target.dataset.index;
        const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
        const reservation = reservations[index];

        Swal.fire({
            title: 'تفاصيل الحجز',
            html: `
                <div class="reservation-details text-start">
                    <div class="row">
                        <div class="col-md-6 text-center mb-3">
                            <img src="${reservation.image}" alt="${reservation.name}" style="max-width: 250px; max-height: 250px; object-fit: cover; border-radius: 15px;">
                        </div>
                        <div class="col-md-6">
                            <div class="detail-section mb-3">
                                <strong>اسم المنتج:</strong>
                                <span>${reservation.name}</span>
                            </div>
                            <div class="detail-section mb-3">
                                <strong>اسم المستخدم:</strong>
                                <span>${reservation.customerName}</span>
                            </div>
                            <div class="detail-section mb-3">
                                <strong>طريقة الدفع:</strong>
                                <span>${getPaymentMethodLabel(reservation.paymentMethod)}</span>
                            </div>
                            <div class="detail-section mb-3">
                                <strong>تاريخ الحجز:</strong>
                                <span>${new Date(reservation.reservationDate).toLocaleString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                            <div class="detail-section mb-3">
                                <strong>الحالة:</strong>
                                <span class="badge ${getReservationStatusBadge(reservation.status)}">
                                    ${getReservationStatusLabel(reservation.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    ${reservation.proofImage ? `
                    <div class="row mt-3">
                        <div class="col-12 text-center">
                            <strong>دليل الدفع:</strong>
                            <img src="${reservation.proofImage}" style="max-width: 100%; max-height: 300px; object-fit: contain;">
                        </div>
                    </div>
                    ` : ''}
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'إغلاق',
            customClass: {
                confirmButton: 'btn btn-secondary'
            }
        });
    }

    function handleApproveReservation(e) {
        const index = e.target.dataset.index;
        const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
        reservations[index].status = 'approved';
        localStorage.setItem('storeReservations', JSON.stringify(reservations));

        Swal.fire({
            title: 'تم الموافقة',
            text: `تمت الموافقة على حجز المنتج ${reservations[index].name}`,
            icon: 'success'
        });

        // Add notification for the user
        addNotification(
            'تم قبول الحجز', 
            `تمت الموافقة على حجزك للمنتج: ${reservations[index].name}`, 
            'store'
        );

        loadReservations();
    }

    function handleReviewReservation(e) {
        const index = e.target.dataset.index;
        const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
        reservations[index].status = 'under_review';
        localStorage.setItem('storeReservations', JSON.stringify(reservations));

        Swal.fire({
            title: 'قيد المراجعة',
            text: `تم وضع حجز المنتج ${reservations[index].name} قيد المراجعة`,
            icon: 'info'
        });

        loadReservations();
    }

    function handleRejectReservation(e) {
        const index = e.target.dataset.index;
        const reservations = JSON.parse(localStorage.getItem('storeReservations') || '[]');
        reservations[index].status = 'rejected';
        localStorage.setItem('storeReservations', JSON.stringify(reservations));

        Swal.fire({
            title: 'تم الرفض',
            text: `تم رفض حجز المنتج ${reservations[index].name}`,
            icon: 'warning'
        });

        // Add notification for the user
        addNotification(
            'تم رفض الحجز', 
            `تم رفض حجزك للمنتج: ${reservations[index].name}`, 
            'store'
        );

        loadReservations();
    }

    function getReservationStatusBadge(status) {
        const badgeMap = {
            'pending': 'bg-warning',
            'approved': 'bg-success',
            'rejected': 'bg-danger',
            'under_review': 'bg-info'
        };
        return badgeMap[status] || 'bg-secondary';
    }

    function getReservationStatusLabel(status) {
        const labelMap = {
            'pending': 'قيد الانتظار',
            'approved': 'موافق عليه',
            'rejected': 'مرفوض',
            'under_review': 'قيد المراجعة'
        };
        return labelMap[status] || 'غير محدد';
    }

    function getPaymentMethodLabel(method) {
        const labels = {
            'game': 'داخل اللعبة',
            'proBot': 'Pro Bot',
            'djezzy': 'Djezzy'
        };
        return labels[method] || method;
    }

    // Announcements Management Section
    function loadAnnouncementsManagement() {
        const announcementsList = document.getElementById('announcementsList');
        const announcementsCount = document.getElementById('announcementsCount');
        const typeFilter = document.getElementById('announcementTypeFilter');
        const searchInput = document.getElementById('searchAnnouncements');
        const dateFilter = document.getElementById('announcementDateFilter');

        // Function to load and render announcements
        function renderAnnouncements(filter = '', searchTerm = '', dateFilterValue = '') {
            const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
            
            // Sort announcements by date (most recent first)
            announcements.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Filter and search
            const filteredAnnouncements = announcements.filter(announcement => {
                const matchesType = !filter || announcement.type === filter;
                const matchesSearch = !searchTerm || 
                    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
                
                const announcementDate = new Date(announcement.date).toISOString().split('T')[0];
                const matchesDate = !dateFilterValue || announcementDate === dateFilterValue;
                
                return matchesType && matchesSearch && matchesDate;
            });

            // Update count
            announcementsCount.textContent = `${filteredAnnouncements.length} إعلان`;

            // Clear existing announcements
            announcementsList.innerHTML = '';

            // Render announcements
            if (filteredAnnouncements.length === 0) {
                announcementsList.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-file-alt fa-3x mb-3"></i>
                        <p>لا توجد إعلانات حاليًا</p>
                    </div>
                `;
                return;
            }

            filteredAnnouncements.forEach(announcement => {
                const announcementEl = document.createElement('div');
                announcementEl.classList.add('announcement-item', 'card', 'mb-3', 'animate__animated', 'animate__fadeIn');
                
                // Determine type badge
                let badgeClass = 'bg-primary';
                switch(announcement.type) {
                    case 'updates': 
                        badgeClass = 'bg-info'; 
                        break;
                    case 'rules': 
                        badgeClass = 'bg-warning'; 
                        break;
                    case 'events': 
                        badgeClass = 'bg-success'; 
                        break;
                    case 'warnings': 
                        badgeClass = 'bg-danger'; 
                        break;
                }

                announcementEl.innerHTML = `
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">${announcement.title}</h5>
                            <div>
                                <span class="badge ${badgeClass} me-2">${getTypeLabel(announcement.type)}</span>
                                <button class="btn btn-sm btn-info edit-announcement" data-id="${announcement.id}">
                                    <i class="fas fa-edit me-1"></i>تعديل
                                </button>
                                <button class="btn btn-sm btn-danger delete-announcement" data-id="${announcement.id}">
                                    <i class="fas fa-trash me-1"></i>حذف
                                </button>
                            </div>
                        </div>
                        <p class="card-text">${truncateText(announcement.content, 200)}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-2"></i>
                                ${formatDate(announcement.date)}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-user me-2"></i>
                                ${announcement.author}
                            </small>
                        </div>
                    </div>
                `;

                announcementsList.appendChild(announcementEl);
            });

            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-announcement').forEach(button => {
                button.addEventListener('click', handleEditAnnouncement);
            });

            document.querySelectorAll('.delete-announcement').forEach(button => {
                button.addEventListener('click', handleDeleteAnnouncement);
            });
        }

        // Add Announcement Function
        function handleAddAnnouncement() {
            Swal.fire({
                title: 'إضافة إعلان جديد',
                html: `
                    <div class="form-group mb-3">
                        <label>العنوان</label>
                        <input type="text" id="announcementTitle" class="form-control" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>نوع الإعلان</label>
                        <select id="announcementType" class="form-control">
                            <option value="updates">تحديثات</option>
                            <option value="rules">قوانين</option>
                            <option value="events">فعاليات</option>
                            <option value="warnings">تنبيهات</option>
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <label>المحتوى</label>
                        <textarea id="announcementContent" class="form-control" rows="5" required></textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'إضافة',
                cancelButtonText: 'إلغاء',
                preConfirm: () => {
                    const title = document.getElementById('announcementTitle').value;
                    const type = document.getElementById('announcementType').value;
                    const content = document.getElementById('announcementContent').value;

                    if (!title || !content) {
                        Swal.showValidationMessage('يرجى ملء جميع الحقول');
                        return false;
                    }

                    return { title, type, content };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
                    
                    const newAnnouncement = {
                        id: Date.now(),
                        title: result.value.title,
                        type: result.value.type,
                        content: result.value.content,
                        date: new Date().toISOString(),
                        author: 'المسؤول'
                    };

                    announcements.push(newAnnouncement);
                    localStorage.setItem('serverAnnouncements', JSON.stringify(announcements));

                    Swal.fire({
                        title: 'تمت الإضافة',
                        text: 'تم إضافة الإعلان بنجاح',
                        icon: 'success'
                    });

                    // Reload announcements
                    renderAnnouncements();
                }
            });
        }

        // Edit Announcement Function
        function handleEditAnnouncement(e) {
            const announcementId = e.target.dataset.id;
            const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
            const announcement = announcements.find(a => a.id.toString() === announcementId);

            Swal.fire({
                title: 'تعديل الإعلان',
                html: `
                    <div class="form-group mb-3">
                        <label>العنوان</label>
                        <input type="text" id="editAnnouncementTitle" class="form-control" value="${announcement.title}" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>نوع الإعلان</label>
                        <select id="editAnnouncementType" class="form-control">
                            <option value="updates" ${announcement.type === 'updates' ? 'selected' : ''}>تحديثات</option>
                            <option value="rules" ${announcement.type === 'rules' ? 'selected' : ''}>قوانين</option>
                            <option value="events" ${announcement.type === 'events' ? 'selected' : ''}>فعاليات</option>
                            <option value="warnings" ${announcement.type === 'warnings' ? 'selected' : ''}>تنبيهات</option>
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <label>المحتوى</label>
                        <textarea id="editAnnouncementContent" class="form-control" rows="5" required>${announcement.content}</textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'حفظ التعديلات',
                cancelButtonText: 'إلغاء',
                preConfirm: () => {
                    const title = document.getElementById('editAnnouncementTitle').value;
                    const type = document.getElementById('editAnnouncementType').value;
                    const content = document.getElementById('editAnnouncementContent').value;

                    if (!title || !content) {
                        Swal.showValidationMessage('يرجى ملء جميع الحقول');
                        return false;
                    }

                    return { title, type, content };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const index = announcements.findIndex(a => a.id.toString() === announcementId);
                    
                    announcements[index] = {
                        ...announcements[index],
                        title: result.value.title,
                        type: result.value.type,
                        content: result.value.content
                    };

                    localStorage.setItem('serverAnnouncements', JSON.stringify(announcements));

                    Swal.fire({
                        title: 'تم التعديل',
                        text: 'تم تحديث الإعلان بنجاح',
                        icon: 'success'
                    });

                    // Reload announcements
                    renderAnnouncements();
                }
            });
        }

        // Delete Announcement Function
        function handleDeleteAnnouncement(e) {
            const announcementId = e.target.dataset.id;
            
            Swal.fire({
                title: 'حذف الإعلان',
                text: 'هل أنت متأكد من رغبتك في حذف هذا الإعلان؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.isConfirmed) {
                    const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
                    const filteredAnnouncements = announcements.filter(a => a.id.toString() !== announcementId);
                    
                    localStorage.setItem('serverAnnouncements', JSON.stringify(filteredAnnouncements));

                    Swal.fire({
                        title: 'تم الحذف',
                        text: 'تم حذف الإعلان بنجاح',
                        icon: 'success'
                    });

                    // Reload announcements
                    renderAnnouncements();
                }
            });
        }

        // Utility functions
        function truncateText(text, maxLength) {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function getTypeLabel(type) {
            const typeLabels = {
                'updates': 'تحديثات',
                'rules': 'قوانين',
                'events': 'فعاليات',
                'warnings': 'تنبيهات'
            };
            return typeLabels[type] || type;
        }

        // Event Listeners
        typeFilter.addEventListener('change', () => {
            renderAnnouncements(typeFilter.value, searchInput.value, dateFilter.value);
        });

        searchInput.addEventListener('input', () => {
            renderAnnouncements(typeFilter.value, searchInput.value, dateFilter.value);
        });

        dateFilter.addEventListener('change', () => {
            renderAnnouncements(typeFilter.value, searchInput.value, dateFilter.value);
        });

        document.getElementById('addAnnouncementBtn').addEventListener('click', handleAddAnnouncement);

        // Initial load
        renderAnnouncements();
    }

    // Streamers Management Section
    function loadStreamersManagement() {
        const streamersList = document.getElementById('streamersList');
        const streamers = JSON.parse(localStorage.getItem('topStreamers') || '[]');

        // Clear existing streamers
        streamersList.innerHTML = '';

        streamers.forEach((streamer, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${streamer.image}" alt="${streamer.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">
                </td>
                <td>${streamer.name}</td>
                <td>${streamer.platform}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm view-streamer" data-index="${index}">
                            <i class="fas fa-eye me-1"></i>عرض
                        </button>
                        <button class="btn btn-danger btn-sm delete-streamer" data-index="${index}">
                            <i class="fas fa-trash me-1"></i>حذف
                        </button>
                    </div>
                </td>
            `;
            streamersList.appendChild(row);
        });

        // Add event listeners for streamer actions
        document.querySelectorAll('.view-streamer').forEach(btn => {
            btn.addEventListener('click', handleViewStreamer);
        });

        document.querySelectorAll('.delete-streamer').forEach(btn => {
            btn.addEventListener('click', handleDeleteStreamer);
        });
    }

    // Function to handle adding a new streamer
    function handleAddStreamer() {
        Swal.fire({
            title: 'إضافة ستريمر جديد',
            html: `
                <div class="form-group mb-3">
                    <label>اسم الستريمر</label>
                    <input type="text" id="streamerName" class="form-control" required>
                </div>
                <div class="form-group mb-3">
                    <label>منصة الستريمر</label>
                    <select id="streamerPlatform" class="form-control" required>
                        <option value="Twitch">Twitch</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook Gaming">Facebook Gaming</option>
                        <option value="Other">أخرى</option>
                    </select>
                </div>
                <div class="form-group mb-3">
                    <label>صورة الستريمر</label>
                    <input type="file" id="streamerImage" class="form-control" accept="image/*" required>
                </div>
                <div class="form-group mb-3">
                    <label>وصف قصير</label>
                    <textarea id="streamerDescription" class="form-control" rows="3"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'إضافة',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const name = document.getElementById('streamerName').value;
                const platform = document.getElementById('streamerPlatform').value;
                const description = document.getElementById('streamerDescription').value;
                const imageFile = document.getElementById('streamerImage').files[0];

                if (!name || !platform || !imageFile) {
                    Swal.showValidationMessage('يرجى ملء جميع الحقول الإلزامية');
                    return false;
                }

                // Read image file as base64
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        resolve({
                            name,
                            platform,
                            description,
                            image: event.target.result
                        });
                    };
                    reader.readAsDataURL(imageFile);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const streamers = JSON.parse(localStorage.getItem('topStreamers') || '[]');
                streamers.push(result.value);
                localStorage.setItem('topStreamers', JSON.stringify(streamers));

                Swal.fire({
                    title: 'تمت الإضافة',
                    text: 'تم إضافة الستريمر بنجاح',
                    icon: 'success'
                });

                // Reload streamers management section
                loadStreamersManagement();
            }
        });
    }

    // Function to handle viewing streamer details
    function handleViewStreamer(e) {
        const index = e.target.dataset.index;
        const streamers = JSON.parse(localStorage.getItem('topStreamers') || '[]');
        const streamer = streamers[index];

        Swal.fire({
            title: 'تفاصيل الستريمر',
            html: `
                <div class="text-center">
                    <img src="${streamer.image}" alt="${streamer.name}" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 50%; margin-bottom: 20px;">
                    <h3>${streamer.name}</h3>
                    <p><strong>المنصة:</strong> ${streamer.platform}</p>
                    <p>${streamer.description || 'لا يوجد وصف'}</p>
                </div>
            `,
            confirmButtonText: 'إغلاق'
        });
    }

    // Function to handle deleting a streamer
    function handleDeleteStreamer(e) {
        const index = e.target.dataset.index;
        
        Swal.fire({
            title: 'حذف الستريمر',
            text: 'هل أنت متأكد من رغبتك في حذف هذا الستريمر؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                const streamers = JSON.parse(localStorage.getItem('topStreamers') || '[]');
                streamers.splice(index, 1);
                localStorage.setItem('topStreamers', JSON.stringify(streamers));

                Swal.fire({
                    title: 'تم الحذف',
                    text: 'تم حذف الستريمر بنجاح',
                    icon: 'success'
                });

                // Reload streamers management section
                loadStreamersManagement();
            }
        });
    }

    document.getElementById('addStreamerBtn').addEventListener('click', handleAddStreamer);

    // Logout Functionality
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Confirmation modal for logout
            Swal.fire({
                title: 'تسجيل الخروج',
                text: 'هل تريد حفظ التغييرات قبل الخروج؟',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'نعم، احفظ وسجل الخروج',
                cancelButtonText: 'خروج بدون حفظ',
                showDenyButton: true,
                denyButtonText: 'إلغاء'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Save changes for each section
                    saveAllChanges();
                    
                    // Logout and redirect
                    performLogout();
                } else if (result.isDismissed) {
                    // Logout without saving
                    performLogout();
                }
            });
        });
    }

    // Function to save changes in all sections
    function saveAllChanges() {
        // Save Applications
        const applications = JSON.parse(localStorage.getItem('joinRequests') || '[]');
        localStorage.setItem('joinRequests', JSON.stringify(applications));

        // Save Support Tickets
        const supportTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        localStorage.setItem('supportTickets', JSON.stringify(supportTickets));

        // Save Users
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        localStorage.setItem('users', JSON.stringify(users));

        // Save Store Products
        const storeProducts = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        localStorage.setItem('storeProducts', JSON.stringify(storeProducts));

        // Save Streamers
        const streamers = JSON.parse(localStorage.getItem('topStreamers') || '[]');
        localStorage.setItem('topStreamers', JSON.stringify(streamers));

        Swal.fire({
            title: 'تم الحفظ',
            text: 'تم حفظ جميع التغييرات بنجاح',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
        });
    }

    // Function to perform logout
    function performLogout() {
        // Remove current user session
        localStorage.removeItem('currentUser');
        
        // Redirect to main page
        window.location.href = 'index.html';
    }

    // New functions for Gangs Management
    function loadGangsManagement() {
        const gangsList = document.getElementById('gangsList');
        const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');

        // Clear existing gangs
        gangsList.innerHTML = '';

        if (gangs.length === 0) {
            gangsList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-users-slash fa-3x mb-3"></i>
                    <p>لا توجد عصابات حاليًا</p>
                </div>
            `;
            return;
        }

        gangs.forEach((gang, index) => {
            const gangRow = document.createElement('tr');
            gangRow.innerHTML = `
                <td>${gang.gangName}</td>
                <td>${gang.inGameName}</td>
                <td>
                    <span class="badge ${getGangStatusBadge(gang.status)}">
                        ${getGangStatusLabel(gang.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm view-gang-details" data-index="${index}">
                            <i class="fas fa-eye me-1"></i>عرض التفاصيل
                        </button>
                        <button class="btn btn-success btn-sm approve-gang" data-index="${index}">
                            <i class="fas fa-check me-1"></i>قبول
                        </button>
                        <button class="btn btn-warning btn-sm review-gang" data-index="${index}">
                            <i class="fas fa-clock me-1"></i>قيد المراجعة
                        </button>
                        <button class="btn btn-danger btn-sm reject-gang" data-index="${index}">
                            <i class="fas fa-times me-1"></i>رفض
                        </button>
                    </div>
                </td>
            `;
            gangsList.appendChild(gangRow);
        });

        // Add event listeners for gang actions
        document.querySelectorAll('.view-gang-details').forEach(btn => {
            btn.addEventListener('click', handleViewGangDetails);
        });

        document.querySelectorAll('.approve-gang').forEach(btn => {
            btn.addEventListener('click', handleApproveGang);
        });

        document.querySelectorAll('.review-gang').forEach(btn => {
            btn.addEventListener('click', handleReviewGang);
        });

        document.querySelectorAll('.reject-gang').forEach(btn => {
            btn.addEventListener('click', handleRejectGang);
        });
    }

    function getGangStatusBadge(status) {
        const badgeMap = {
            'pending': 'bg-warning',
            'approved': 'bg-success',
            'rejected': 'bg-danger',
            'under_review': 'bg-info'
        };
        return badgeMap[status] || 'bg-secondary';
    }

    function getGangStatusLabel(status) {
        const labelMap = {
            'pending': 'قيد الانتظار',
            'approved': 'موافق عليه',
            'rejected': 'مرفوض',
            'under_review': 'قيد المراجعة'
        };
        return labelMap[status] || 'غير محدد';
    }

    function handleViewGangDetails(e) {
        const index = e.target.dataset.index;
        const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');
        const gang = gangs[index];

        Swal.fire({
            title: 'تفاصيل العصابة',
            html: `
                <div class="text-start">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>اسم العصابة:</strong> ${gang.gangName}</p>
                            <p><strong>اسم اللاعب:</strong> ${gang.inGameName}</p>
                            <p><strong>اسم المستخدم بالديسكورد:</strong> ${gang.discordUsername}</p>
                            <p><strong>معرف الديسكورد:</strong> ${gang.discordId}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>طريقة الدفع:</strong> ${getPaymentMethodLabel(gang.paymentMethod)}</p>
                            <p><strong>تاريخ الإنشاء:</strong> ${new Date(gang.creationDate).toLocaleString('ar-EG')}</p>
                            <p><strong>الحالة:</strong> ${getGangStatusLabel(gang.status)}</p>
                        </div>
                    </div>
                    <div class="text-center mt-3">
                        <img src="${gang.proofImage}" style="max-width: 300px; max-height: 300px;">
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'إغلاق'
        });
    }

    function handleApproveGang(e) {
        const index = e.target.dataset.index;
        const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');
        gangs[index].status = 'approved';
        localStorage.setItem('serverGangs', JSON.stringify(gangs));

        Swal.fire({
            title: 'تم الموافقة',
            text: `تمت الموافقة على العصابة ${gangs[index].gangName}`,
            icon: 'success'
        });

        loadGangsManagement();
    }

    function handleReviewGang(e) {
        const index = e.target.dataset.index;
        const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');
        gangs[index].status = 'under_review';
        localStorage.setItem('serverGangs', JSON.stringify(gangs));

        Swal.fire({
            title: 'قيد المراجعة',
            text: `تم وضع العصابة ${gangs[index].gangName} قيد المراجعة`,
            icon: 'info'
        });

        loadGangsManagement();
    }

    function handleRejectGang(e) {
        const index = e.target.dataset.index;
        const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');
        gangs[index].status = 'rejected';
        localStorage.setItem('serverGangs', JSON.stringify(gangs));

        Swal.fire({
            title: 'تم الرفض',
            text: `تم رفض العصابة ${gangs[index].gangName}`,
            icon: 'warning'
        });

        loadGangsManagement();
    }

    function getPaymentMethodLabel(method) {
        const labels = {
            'game': 'داخل اللعبة',
            'proBot': 'Pro Bot',
            'djezzy': 'Djezzy'
        };
        return labels[method] || method;
    }

    function handleGangCreation() {
        Swal.fire({
            title: 'إنشاء عصابة جديدة',
            html: `
                <div class="gang-creation-form">
                    <div class="form-group mb-3">
                        <label>اسم المستخدم في الديسكورد</label>
                        <input type="text" id="discordUsername" class="form-control" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>معرف حسابك في الديسكورد</label>
                        <input type="text" id="discordId" class="form-control" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>اسمك داخل اللعبة</label>
                        <input type="text" id="inGameName" class="form-control" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>اسم العصابة</label>
                        <input type="text" id="gangName" class="form-control" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>الفئة</label>
                        <select id="gangCategory" class="form-control" required>
                            <option value="">اختر فئة العصابة</option>
                            <option value="street">عصابة شوارع</option>
                            <option value="mafia">عصابة مافيا</option>
                            <option value="cartel">كارتيل</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                    <div class="form-group mb-3">
                        <button id="createGangBtn" class="btn btn-primary w-100">إنشاء العصابة</button>
                    </div>
                    <div id="paymentSection" class="d-none">
                        <div class="form-group mb-3">
                            <label>طريقة الدفع</label>
                            <select id="paymentMethod" class="form-control" required>
                                <option value="">اختر طريقة الدفع</option>
                                <option value="game">داخل اللعبة</option>
                                <option value="proBot">Pro Bot</option>
                                <option value="djezzy">Djezzy</option>
                            </select>
                        </div>
                        <div id="proofUploadSection" class="form-group mb-3 d-none">
                            <label>رفع دليل الدفع</label>
                            <input type="file" id="proofUpload" class="form-control" accept="image/*">
                            <button id="sendProofBtn" class="btn btn-primary mt-2">
                                <i class="fas fa-upload me-2"></i>إرسال الدليل
                            </button>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            didRender: () => {
                const createGangBtn = document.getElementById('createGangBtn');
                const paymentSection = document.getElementById('paymentSection');
                const paymentMethodSelect = document.getElementById('paymentMethod');
                const proofUploadSection = document.getElementById('proofUploadSection');
                const sendProofBtn = document.getElementById('sendProofBtn');
                const proofUpload = document.getElementById('proofUpload');

                createGangBtn.addEventListener('click', () => {
                    const discordUsername = document.getElementById('discordUsername').value;
                    const discordId = document.getElementById('discordId').value;
                    const inGameName = document.getElementById('inGameName').value;
                    const gangName = document.getElementById('gangName').value;
                    const gangCategory = document.getElementById('gangCategory').value;

                    if (!discordUsername || !discordId || !inGameName || !gangName || !gangCategory) {
                        Swal.fire('خطأ', 'يرجى ملء جميع الحقول', 'error');
                        return;
                    }

                    // Show payment section after gang creation
                    paymentSection.classList.remove('d-none');
                    createGangBtn.closest('.swal2-popup').scrollTop = createGangBtn.closest('.swal2-popup').scrollHeight;
                });

                paymentMethodSelect.addEventListener('change', () => {
                    proofUploadSection.classList.toggle('d-none', !paymentMethodSelect.value);
                });

                sendProofBtn.addEventListener('click', () => {
                    const discordUsername = document.getElementById('discordUsername').value;
                    const discordId = document.getElementById('discordId').value;
                    const inGameName = document.getElementById('inGameName').value;
                    const gangName = document.getElementById('gangName').value;
                    const gangCategory = document.getElementById('gangCategory').value;
                    const paymentMethod = paymentMethodSelect.value;

                    if (!paymentMethod) {
                        Swal.fire('خطأ', 'يرجى اختيار طريقة الدفع', 'error');
                        return;
                    }

                    if (proofUpload.files.length === 0) {
                        Swal.fire('خطأ', 'يرجى رفع دليل الدفع', 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function(event) {
                        Swal.fire({
                            title: 'تأكيد إنشاء العصابة',
                            html: `
                                <div class="text-center">
                                    <img src="${event.target.result}" style="max-width: 300px; max-height: 300px;">
                                    <p class="mt-3">هل تريد تأكيد إنشاء العصابة؟</p>
                                    <div class="gang-details text-start">
                                        <p><strong>اسم العصابة:</strong> ${gangName}</p>
                                        <p><strong>الفئة:</strong> ${getGangCategoryLabel(gangCategory)}</p>
                                        <p><strong>اسم اللاعب:</strong> ${inGameName}</p>
                                        <p><strong>طريقة الدفع:</strong> ${getPaymentMethodLabel(paymentMethod)}</p>
                                    </div>
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'تأكيد',
                            cancelButtonText: 'إلغاء'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const gangs = JSON.parse(localStorage.getItem('serverGangs') || '[]');
                                const newGang = {
                                    id: Date.now(),
                                    discordUsername,
                                    discordId,
                                    inGameName,
                                    gangName,
                                    gangCategory,
                                    paymentMethod,
                                    proofImage: event.target.result,
                                    creationDate: new Date().toISOString(),
                                    status: 'pending'
                                };

                                gangs.push(newGang);
                                localStorage.setItem('serverGangs', JSON.stringify(gangs));

                                Swal.fire('نجاح', 'تم إرسال طلب إنشاء العصابة', 'success');
                            }
                        });
                    };
                    reader.readAsDataURL(proofUpload.files[0]);
                });
            }
        });
    }

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
            'game': 'داخل اللعبة',
            'proBot': 'Pro Bot',
            'djezzy': 'Djezzy'
        };
        return labels[method] || method;
    }

    document.getElementById('gangCreationBtn').addEventListener('click', handleGangCreation);

    function loadAdminSettings() {
        const siteControlSection = document.getElementById('site-control-section');
        
        // Toggle Applications
        const toggleApplicationsBtn = document.getElementById('toggleApplicationsBtn');
        toggleApplicationsBtn.addEventListener('click', () => {
            const applicationsLocked = localStorage.getItem('applicationsLocked') === 'true';
            
            Swal.fire({
                title: applicationsLocked ? 'فتح التقديم' : 'قفل التقديم',
                text: applicationsLocked ? 'هل أنت متأكد من فتح التقديم؟' : 'هل أنت متأكد من قفل التقديم؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.setItem('applicationsLocked', !applicationsLocked);
                    Swal.fire({
                        title: 'تم التحديث',
                        text: applicationsLocked ? 'تم فتح التقديم' : 'تم قفل التقديم',
                        icon: 'success'
                    });
                }
            });
        });

        // Change Site Name
        const changeSiteNameBtn = document.getElementById('changeSiteNameBtn');
        changeSiteNameBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'تغيير اسم الموقع',
                input: 'text',
                inputValue: localStorage.getItem('siteName') || 'EAGLE RP',
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.value) {
                    localStorage.setItem('siteName', result.value);
                    Swal.fire({
                        title: 'تم التحديث',
                        text: 'تم تغيير اسم الموقع',
                        icon: 'success'
                    });
                }
            });
        });

        // Change Admin Code
        const changeAdminCodeBtn = document.getElementById('changeAdminCodeBtn');
        changeAdminCodeBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'تغيير كود الإدارة',
                input: 'password',
                inputPlaceholder: 'أدخل كود الإدارة الجديد',
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء'
            }).then((result) => {
                if (result.value) {
                    localStorage.setItem('adminCode', result.value);
                    Swal.fire({
                        title: 'تم التحديث',
                        text: 'تم تغيير كود الإدارة',
                        icon: 'success'
                    });
                }
            });
        });

        // Change Color Scheme
        const changeColorSchemeBtn = document.getElementById('changeColorSchemeBtn');
        changeColorSchemeBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'اختر خلفية الموقع',
                html: `
                    <div class="d-flex flex-wrap justify-content-center">
                        <div class="background-preview" data-gradient="gradient-1" style="background: linear-gradient(-45deg, #141e30, #243b55, #3a4f6b, #4d6980)"></div>
                        <div class="background-preview" data-gradient="gradient-2" style="background: linear-gradient(135deg, #000428, #004e92)"></div>
                        <div class="background-preview" data-gradient="gradient-3" style="background: linear-gradient(45deg, #1a2a6c, #b21f1f, #fdbb2d)"></div>
                        <div class="background-preview" data-gradient="gradient-4" style="background: linear-gradient(to right, #0f2027, #203a43, #2c5364)"></div>
                        <div class="background-preview" data-gradient="gradient-5" style="background: linear-gradient(to right, #373b44, #4286f4)"></div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'حفظ',
                didRender: () => {
                    const backgroundPreviews = document.querySelectorAll('.background-preview');
                    const currentBackground = localStorage.getItem('siteBackground') || 'gradient-1';

                    backgroundPreviews.forEach(preview => {
                        if (preview.dataset.gradient === currentBackground) {
                            preview.classList.add('selected');
                        }

                        preview.addEventListener('click', () => {
                            backgroundPreviews.forEach(p => p.classList.remove('selected'));
                            preview.classList.add('selected');
                        });
                    });
                },
                preConfirm: () => {
                    const selectedBackground = document.querySelector('.background-preview.selected').dataset.gradient;
                    localStorage.setItem('siteBackground', selectedBackground);
                    
                    // Apply background to all pages
                    document.body.style.background = `var(--${selectedBackground})`;
                    document.body.style.backgroundSize = '400% 400%';
                    document.body.style.animation = 'gradientBackground 15s ease infinite';

                    return true;
                }
            });
        });

        // Super Admin Control
        const superAdminControlBtn = document.getElementById('superAdminControlBtn');
        superAdminControlBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'التحكم الكامل للإدارة العليا',
                input: 'password',
                inputPlaceholder: 'أدخل كود الإدارة العليا',
                showCancelButton: true,
                confirmButtonText: 'دخول',
                cancelButtonText: 'إلغاء',
                preConfirm: (code) => {
                    const superAdminCode = localStorage.getItem('superAdminCode') || '2009';
                    if (code === superAdminCode) {
                        return true;
                    } else {
                        Swal.showValidationMessage('كود الإدارة غير صحيح');
                        return false;
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'التحكم الكامل',
                        html: `
                            <div class="super-admin-options d-flex flex-column align-items-center">
                                <div class="row g-3 w-100">
                                    <div class="col-12">
                                        <button class="btn btn-danger btn-lg w-100 mb-3 site-maintenance-btn animate__animated animate__pulse">
                                            <i class="fas fa-wrench me-2"></i>صيانة الموقع
                                        </button>
                                    </div>
                                    <div class="col-12">
                                        <button class="btn btn-warning btn-lg w-100 mb-3 change-super-admin-code-btn animate__animated animate__tada">
                                            <i class="fas fa-key me-2"></i>تغيير كود الإدارة العليا
                                        </button>
                                    </div>
                                    <div class="col-12">
                                        <button class="btn btn-success btn-lg w-100 mb-3 send-global-notification-btn animate__animated animate__bounceIn">
                                            <i class="fas fa-bell me-2"></i>إرسال إشعار عام
                                        </button>
                                    </div>
                                    <div class="col-12">
                                        <button class="btn btn-info btn-lg w-100 eagle-control-panel-btn animate__animated animate__swing">
                                            <i class="fas fa-eagle me-2"></i>لوحة التحكم الكامل
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'super-admin-modal'
                        }
                    });

                    // Site Maintenance
                    document.querySelector('.site-maintenance-btn').addEventListener('click', () => {
                        localStorage.setItem('siteMaintenance', 'true');
                        Swal.fire({
                            title: 'الموقع تحت الصيانة',
                            text: 'سيتم قفل جميع الصفحات',
                            icon: 'warning'
                        });
                    });

                    // Change Super Admin Code
                    document.querySelector('.change-super-admin-code-btn').addEventListener('click', () => {
                        Swal.fire({
                            title: 'تغيير كود الإدارة العليا',
                            input: 'password',
                            inputPlaceholder: 'أدخل كود الإدارة العليا الجديد',
                            showCancelButton: true,
                            confirmButtonText: 'حفظ',
                            cancelButtonText: 'إلغاء'
                        }).then((result) => {
                            if (result.value) {
                                localStorage.setItem('superAdminCode', result.value);
                                Swal.fire({
                                    title: 'تم التحديث',
                                    text: 'تم تغيير كود الإدارة العليا',
                                    icon: 'success'
                                });
                            }
                        });
                    });

                    // Send Global Notification
                    document.querySelector('.send-global-notification-btn').addEventListener('click', () => {
                        Swal.fire({
                            title: 'إرسال إشعار عام',
                            html: `
                                <div class="form-group">
                                    <label>عنوان الإشعار</label>
                                    <input type="text" id="globalNotificationTitle" class="form-control" required>
                                    <label class="mt-2">محتوى الإشعار</label>
                                    <textarea id="globalNotificationMessage" class="form-control" rows="4" required></textarea>
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'إرسال',
                            cancelButtonText: 'إلغاء',
                            preConfirm: () => {
                                const title = document.getElementById('globalNotificationTitle').value;
                                const message = document.getElementById('globalNotificationMessage').value;
                                
                                if (!title || !message) {
                                    Swal.showValidationMessage('يرجى ملء جميع الحقول');
                                    return false;
                                }

                                return { title, message };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Send notification to all users
                                const users = JSON.parse(localStorage.getItem('users') || '{}');
                                const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');

                                Object.keys(users).forEach(username => {
                                    notifications.push({
                                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                        title: result.value.title,
                                        message: result.value.message,
                                        type: 'global',
                                        date: new Date().toISOString(),
                                        read: false
                                    });
                                });

                                localStorage.setItem('userNotifications', JSON.stringify(notifications));

                                Swal.fire({
                                    title: 'تم الإرسال',
                                    text: 'تم إرسال الإشعار لجميع المستخدمين',
                                    icon: 'success'
                                });
                            }
                        });
                    });

                    // Eagle Control Panel
                    document.querySelector('.eagle-control-panel-btn').addEventListener('click', () => {
                        Swal.fire({
                            title: 'لوحة التحكم الكامل',
                            html: `
                                <div class="eagle-control-panel">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <button class="btn btn-primary btn-lg w-100 user-accounts-btn">
                                                <i class="fas fa-users me-2"></i>حسابات المستخدمين
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `,
                            showConfirmButton: false,
                            customClass: {
                                popup: 'eagle-control-modal'
                            }
                        });

                        // User Accounts Management
                        document.querySelector('.user-accounts-btn').addEventListener('click', () => {
                            Swal.fire({
                                title: 'إدارة حسابات المستخدمين',
                                html: `
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>اسم المستخدم</th>
                                                <th>كلمة المرور</th>
                                                <th>الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody id="userAccountsList">
                                            ${generateUserAccountsHTML()}
                                        </tbody>
                                    </table>
                                `,
                                width: '800px',
                                showConfirmButton: false,
                                customClass: {
                                    popup: 'user-accounts-modal'
                                }
                            });

                            // Add event listeners for account actions
                            setupUserAccountActions();
                        });
                    });
                }
            });
        });
    }

    // Helper function to generate user accounts HTML
    function generateUserAccountsHTML() {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        return Object.entries(users).map(([username, userData]) => {
            // Determine badge based on account status
            const statusBadge = getUserStatusBadge(userData.status || 'inactive');

            return `
                <tr>
                    <td>
                        ${username}
                        ${statusBadge}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info show-password-btn" data-username="${username}">
                            <i class="fas fa-eye me-1"></i>عرض
                        </button>
                    </td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-success btn-sm login-account-btn" data-username="${username}">
                                <i class="fas fa-sign-in-alt me-1"></i>تسجيل دخول
                            </button>
                            <button class="btn btn-warning btn-sm activate-account-btn" data-username="${username}">
                                <i class="fas fa-check me-1"></i>تفعيل فوري
                            </button>
                            <button class="btn btn-danger btn-sm block-user-btn" data-username="${username}">
                                <i class="fas fa-ban me-1"></i>حظر
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // New function to generate status badges
    function getUserStatusBadge(status) {
        const badgeStyles = {
            'inactive': {
                class: 'badge bg-secondary animate__animated animate__pulse',
                icon: 'fa-user-lock',
                text: 'غير مفعل'
            },
            'active': {
                class: 'badge bg-success animate__animated animate__tada',
                icon: 'fa-user-check',
                text: 'مفعل'
            },
            'verified': {
                class: 'badge bg-primary animate__animated animate__rubberBand',
                icon: 'fa-badge-check',
                text: 'موثق'
            },
            'admin': {
                class: 'badge bg-danger animate__animated animate__flash',
                icon: 'fa-user-shield',
                text: 'إدارة'
            },
            'blocked': {
                class: 'badge bg-danger animate__animated animate__flash',
                icon: 'fa-ban',
                text: 'محظور'
            }
        };

        const badgeConfig = badgeStyles[status] || badgeStyles['inactive'];

        return `
            <span class="${badgeConfig.class} ms-2" title="${badgeConfig.text}">
                <i class="fas ${badgeConfig.icon} me-1"></i>
                ${badgeConfig.text}
            </span>
        `;
    }

    // Function to set up user account action event listeners
    function setupUserAccountActions() {
        const users = JSON.parse(localStorage.getItem('users') || '{}');

        // Show Password
        document.querySelectorAll('.show-password-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                const user = users[username];
                
                Swal.fire({
                    title: `كلمة المرور لـ ${username}`,
                    text: user.password,
                    icon: 'info',
                    confirmButtonText: 'حسنًا'
                });
            });
        });

        // Login to Account
        document.querySelectorAll('.login-account-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                
                // Set current user and redirect
                localStorage.setItem('currentUser', username);
                window.location.href = 'index.html';
            });
        });

        // Activate Account
        document.querySelectorAll('.activate-account-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                
                // Update user status
                users[username] = {
                    ...users[username],
                    status: 'active' // Change status to active
                };
                
                localStorage.setItem('users', JSON.stringify(users));
                
                Swal.fire({
                    title: 'تفعيل الحساب',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-user-check fa-4x text-success mb-3 animate__animated animate__bounceIn"></i>
                            <p>تم تفعيل حساب ${username} بنجاح</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'حسنًا'
                });

                // Reload user management section
                loadUserManagement();
            });
        });

        // Block User
        document.querySelectorAll('.block-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                
                Swal.fire({
                    title: 'حظر المستخدم',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-ban fa-4x text-danger mb-3 animate__animated animate__shakeX"></i>
                            <p>هل أنت متأكد من رغبتك في حظر المستخدم ${username}؟</p>
                            <div class="form-group mt-3">
                                <label>سبب الحظر (اختياري)</label>
                                <textarea id="blockReason" class="form-control" rows="3" placeholder="أدخل سبب الحظر"></textarea>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'حظر',
                    cancelButtonText: 'إلغاء',
                    preConfirm: () => {
                        const blockReason = document.getElementById('blockReason').value;
                        return { blockReason };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Update user status to blocked
                        users[username] = {
                            ...users[username],
                            status: 'blocked',
                            blockReason: result.value.blockReason || 'لم يتم تحديد سبب',
                            blockedAt: new Date().toISOString()
                        };
                        
                        localStorage.setItem('users', JSON.stringify(users));
                        
                        Swal.fire({
                            title: 'تم الحظر',
                            html: `
                                <div class="text-center">
                                    <i class="fas fa-user-slash fa-4x text-danger mb-3 animate__animated animate__bounceIn"></i>
                                    <p>تم حظر المستخدم ${username} بنجاح</p>
                                    <p class="text-muted">سبب الحظر: ${result.value.blockReason || 'غير محدد'}</p>
                                </div>
                            `,
                            icon: 'success',
                            confirmButtonText: 'حسنًا'
                        });

                        // Reload user management section
                        loadUserManagement();
                    }
                });
            });
        });
    }

    // New function to load notifications in admin panel
    function loadNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        
        notificationsList.innerHTML = '';

        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-bell-slash fa-3x mb-3"></i>
                    <p>لا توجد إشعارات</p>
                </div>
            `;
            return;
        }

        notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.classList.add('notification-item', 'card', 'mb-3');
            
            const { icon, badgeClass } = getNotificationTypeDetails(notification.type);

            notificationEl.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="card-title">
                            <i class="${icon} me-2 ${badgeClass}"></i>
                            ${notification.title}
                        </h5>
                        <p class="card-text">${notification.message}</p>
                    </div>
                    <div>
                        <small class="text-muted">
                            ${formatDate(notification.date)}
                        </small>
                    </div>
                </div>
            `;

            notificationsList.appendChild(notificationEl);
        });
    }

    // Helper function to get notification type details
    function getNotificationTypeDetails(type) {
        const typeDetails = {
            'ticket': { 
                icon: 'fas fa-ticket-alt', 
                badgeClass: 'text-warning' 
            },
            'application': { 
                icon: 'fas fa-user-plus', 
                badgeClass: 'text-success' 
            },
            'update': { 
                icon: 'fas fa-sync', 
                badgeClass: 'text-info' 
            },
            'store': {
                icon: 'fas fa-shopping-cart',
                badgeClass: 'text-primary'
            },
            'general': { 
                icon: 'fas fa-bell', 
                badgeClass: 'text-secondary' 
            }
        };

        return typeDetails[type] || typeDetails['general'];
    }

    // Date formatting helper
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // On initial load, ensure dashboard is visible
    dashboardSection.style.display = 'block';

    // Job Applications Management
    function loadJobApplicationsManagement() {
        const jobApplicationsTableBody = document.getElementById('jobApplicationsTableBody');
        const jobApplicationsCount = document.getElementById('jobApplicationsCount');
        
        // Get job applications from localStorage
        const jobApplications = JSON.parse(localStorage.getItem('job_applications') || '[]');
        
        // Update applications count
        jobApplicationsCount.textContent = `${jobApplications.length} طلب`;
        
        // Clear existing applications
        jobApplicationsTableBody.innerHTML = '';

        if (jobApplications.length === 0) {
            jobApplicationsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <i class="fas fa-briefcase fa-3x mb-3"></i>
                        <p>لا توجد طلبات توظيف حاليًا</p>
                    </td>
                </tr>
            `;
            return;
        }

        jobApplications.forEach((application, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${application.fullName}</td>
                <td>${getJobPositionLabel(application.jobPosition)}</td>
                <td>
                    <span class="badge ${getStatusBadge(application.status)}">
                        ${getStatusLabel(application.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm view-job-application" data-index="${index}">
                            <i class="fas fa-eye me-1"></i>عرض التفاصيل
                        </button>
                        <div class="btn-group" role="group">
                            <button class="btn btn-success btn-sm accept-job-application" data-index="${index}">
                                <i class="fas fa-check me-1"></i>قبول
                            </button>
                            <button class="btn btn-warning btn-sm review-job-application" data-index="${index}">
                                <i class="fas fa-clock me-1"></i>قيد المراجعة
                            </button>
                            <button class="btn btn-danger btn-sm reject-job-application" data-index="${index}">
                                <i class="fas fa-times me-1"></i>رفض
                            </button>
                        </div>
                    </div>
                </td>
            `;
            jobApplicationsTableBody.appendChild(row);
        });

        setupJobApplicationActionListeners();
    }

    function setupJobApplicationActionListeners() {
        // View Job Application Details
        document.querySelectorAll('.view-job-application').forEach(btn => {
            btn.addEventListener('click', handleViewJobApplication);
        });

        // Accept Job Application
        document.querySelectorAll('.accept-job-application').forEach(btn => {
            btn.addEventListener('click', handleAcceptJobApplication);
        });

        // Review Job Application
        document.querySelectorAll('.review-job-application').forEach(btn => {
            btn.addEventListener('click', handleReviewJobApplication);
        });

        // Reject Job Application
        document.querySelectorAll('.reject-job-application').forEach(btn => {
            btn.addEventListener('click', handleRejectJobApplication);
        });
    }

    function handleViewJobApplication(e) {
        const index = e.target.dataset.index;
        const jobApplications = JSON.parse(localStorage.getItem('job_applications') || '[]');
        const application = jobApplications[index];

        Swal.fire({
            title: 'تفاصيل طلب التوظيف',
            html: `
                <div class="job-application-details animate__animated animate__zoomIn">
                    <div class="details-grid">
                        <div class="detail-section personal-info animate__animated animate__fadeInRight">
                            <div class="section-header">
                                <i class="fas fa-user-circle fa-3x text-primary mb-3"></i>
                                <h4>المعلومات الشخصية</h4>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">الاسم الكامل</span>
                                <span class="detail-value">${application.fullName}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">البريد الإلكتروني</span>
                                <span class="detail-value">${application.email}</span>
                            </div>
                        </div>

                        <div class="detail-section job-info animate__animated animate__fadeInLeft" style="animation-delay: 0.2s;">
                            <div class="section-header">
                                <i class="fas fa-briefcase fa-3x text-success mb-3"></i>
                                <h4>معلومات الوظيفة</h4>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">الوظيفة المطلوبة</span>
                                <span class="detail-value">
                                    ${getJobPositionIcon(application.jobPosition)} 
                                    ${getJobPositionLabel(application.jobPosition)}
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">تاريخ التقديم</span>
                                <span class="detail-value">
                                    <i class="fas fa-calendar-alt me-2"></i>
                                    ${new Date(application.submissionDate).toLocaleString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div class="detail-section discord-info animate__animated animate__fadeInRight" style="animation-delay: 0.4s;">
                            <div class="section-header">
                                <i class="fab fa-discord fa-3x text-blurple mb-3"></i>
                                <h4>معلومات التواصل</h4>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">اسم المستخدم في ديسكورد</span>
                                <span class="detail-value">${application.discordUsername}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">معرف الديسكورد</span>
                                <span class="detail-value">${application.discordId}</span>
                            </div>
                        </div>

                        <div class="detail-section experience-section animate__animated animate__fadeInLeft" style="animation-delay: 0.6s;">
                            <div class="section-header">
                                <i class="fas fa-history fa-3x text-warning mb-3"></i>
                                <h4>الخبرات السابقة</h4>
                            </div>
                            <div class="detail-item experience-content">
                                <p class="experience-text">${application.previousExperience}</p>
                                
                            </div>
                        </div>

                        <div class="detail-section motivation-section animate__animated animate__fadeInRight" style="animation-delay: 0.8s;">
                            <div class="section-header">
                                <i class="fas fa-comment-dots fa-3x text-info mb-3"></i>
                                <h4>سبب التقديم</h4>
                            </div>
                            <div class="detail-item motivation-content">
                                <p class="motivation-text">${application.applicationReason}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'إغلاق',
            width: '80%',
            customClass: {
                popup: 'job-application-modal',
                confirmButton: 'btn btn-secondary animate__animated animate__pulse'
            }
        });
    }

    function getJobPositionIcon(position) {
        const iconMap = {
            'police': '👮',
            'medic': '🚑',
            'mechanic': '🔧',
            'admin': '🛠️'
        };
        return iconMap[position] || '💼';
    }

    function handleAcceptJobApplication(e) {
        const index = e.target.dataset.index;
        const jobApplications = JSON.parse(localStorage.getItem('job_applications') || '[]');
        jobApplications[index].status = 'accepted';
        localStorage.setItem('job_applications', JSON.stringify(jobApplications));

        Swal.fire({
            title: 'تم قبول الطلب',
            text: `تم قبول طلب التوظيف الخاص بـ ${jobApplications[index].fullName}`,
            icon: 'success'
        });

        loadJobApplicationsManagement();
    }

    function handleReviewJobApplication(e) {
        const index = e.target.dataset.index;
        const jobApplications = JSON.parse(localStorage.getItem('job_applications') || '[]');
        jobApplications[index].status = 'under_review';
        localStorage.setItem('job_applications', JSON.stringify(jobApplications));

        Swal.fire({
            title: 'قيد المراجعة',
            text: `تم وضع طلب التوظيف الخاص بـ ${jobApplications[index].fullName} قيد المراجعة`,
            icon: 'info'
        });

        loadJobApplicationsManagement();
    }

    function handleRejectJobApplication(e) {
        const index = e.target.dataset.index;
        const jobApplications = JSON.parse(localStorage.getItem('job_applications') || '[]');
        jobApplications[index].status = 'rejected';
        localStorage.setItem('job_applications', JSON.stringify(jobApplications));

        Swal.fire({
            title: 'تم الرفض',
            text: `تم رفض طلب التوظيف الخاص بـ ${jobApplications[index].fullName}`,
            icon: 'warning'
        });

        loadJobApplicationsManagement();
    }

    function getJobPositionLabel(position) {
        const labels = {
            'police': 'شرطي',
            'medic': 'مسعف',
            'mechanic': 'ميكانيكي',
            'admin': 'إداري'
        };
        return labels[position] || position;
    }

    function getStatusBadge(status) {
        const badgeMap = {
            'pending': 'bg-warning',
            'accepted': 'bg-success',
            'rejected': 'bg-danger',
            'under_review': 'bg-info'
        };
        return badgeMap[status] || 'bg-secondary';
    }

    function getStatusLabel(status) {
        const labelMap = {
            'pending': 'قيد الانتظار',
            'accepted': 'موافق عليه',
            'rejected': 'مرفوض',
            'under_review': 'قيد المراجعة'
        };
        return labelMap[status] || 'غير محدد';
    }

    function loadJobManagement() {
        const jobPositionsList = document.getElementById('jobPositionsList');
        const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');

        // Clear existing job positions
        jobPositionsList.innerHTML = '';

        jobPositions.forEach((job, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <label class="form-check-label">
                        <input type="checkbox" class="form-check-input job-checkbox" data-index="${index}">
                        <span class="me-2">${job.icon}</span>
                        ${job.title}
                    </label>
                </td>
                <td>
                    <span class="badge ${job.status === 'open' ? 'bg-success' : 'bg-danger'}">
                        ${job.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </span>
                </td>
                <td>${job.questions.length} أسئلة</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-info btn-sm edit-job-position" data-index="${index}">
                            <i class="fas fa-edit me-1"></i>تعديل
                        </button>
                        <button class="btn btn-danger btn-sm delete-job-position" data-index="${index}">
                            <i class="fas fa-trash me-1"></i>حذف
                        </button>
                    </div>
                </td>
            `;
            jobPositionsList.appendChild(row);
        });

        setupJobPositionActionListeners();
    }

    function setupJobPositionActionListeners() {
        // Add Job Position
        document.getElementById('addNewJobPositionBtn').addEventListener('click', handleAddJobPosition);

        // Edit Job Position
        document.querySelectorAll('.edit-job-position').forEach(btn => {
            btn.addEventListener('click', handleEditJobPosition);
        });

        // Delete Job Position
        document.querySelectorAll('.delete-job-position').forEach(btn => {
            btn.addEventListener('click', handleDeleteJobPosition);
        });

        // Toggle Job Applications
        document.getElementById('toggleJobApplicationsBtn').addEventListener('click', handleToggleJobApplications);
    }

    function handleAddJobPosition() {
        Swal.fire({
            title: 'إضافة وظيفة جديدة',
            html: `
                <div class="form-group mb-3">
                    <label>اسم الوظيفة</label>
                    <input type="text" id="newJobTitle" class="form-control" required>
                </div>
                <div class="form-group mb-3">
                    <label>الأيقونة</label>
                    <input type="text" id="newJobIcon" class="form-control" placeholder="مثل: 👮" required>
                </div>
                <div class="form-group mb-3">
                    <label>الأسئلة</label>
                    <div id="newJobQuestions">
                        <div class="input-group mb-2">
                            <input type="text" class="form-control job-question" placeholder="أدخل السؤال">
                            <button class="btn btn-success add-question-btn" type="button">+</button>
                        </div>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label>التصنيف</label>
                    <select id="newJobCategory" class="form-control" required>
                        <option value="law_enforcement">إنفاذ القانون</option>
                        <option value="medical">الخدمات الطبية</option>
                        <option value="services">الخدمات العامة</option>
                        <option value="government">الحكومة</option>
                        <option value="other">أخرى</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'إضافة',
            cancelButtonText: 'إلغاء',
            didRender: () => {
                const addQuestionBtn = document.querySelector('.add-question-btn');
                const questionsContainer = document.getElementById('newJobQuestions');

                addQuestionBtn.addEventListener('click', () => {
                    const newQuestionGroup = document.createElement('div');
                    newQuestionGroup.classList.add('input-group', 'mb-2');
                    newQuestionGroup.innerHTML = `
                        <input type="text" class="form-control job-question" placeholder="أدخل السؤال">
                        <button class="btn btn-danger remove-question-btn" type="button">-</button>
                    `;
                    questionsContainer.appendChild(newQuestionGroup);

                    // Add remove functionality
                    newQuestionGroup.querySelector('.remove-question-btn').addEventListener('click', () => {
                        newQuestionGroup.remove();
                    });
                });
            },
            preConfirm: () => {
                const title = document.getElementById('newJobTitle').value;
                const icon = document.getElementById('newJobIcon').value;
                const category = document.getElementById('newJobCategory').value;
                const questions = Array.from(document.querySelectorAll('.job-question'))
                    .map(q => q.value)
                    .filter(q => q.trim() !== '');

                if (!title || !icon || !category || questions.length === 0) {
                    Swal.showValidationMessage('يرجى ملء جميع الحقول');
                    return false;
                }

                return { title, icon, category, questions };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');
                
                const newJob = {
                    id: Date.now().toString(), // Unique identifier
                    title: result.value.title,
                    icon: result.value.icon,
                    category: result.value.category,
                    status: 'open', // Default to open
                    createdAt: new Date().toISOString(),
                    questions: result.value.questions.map(q => ({
                        label: q,
                        type: 'textarea'
                    }))
                };

                jobPositions.push(newJob);
                localStorage.setItem('jobPositions', JSON.stringify(jobPositions));

                Swal.fire({
                    title: 'تمت الإضافة',
                    text: 'تمت إضافة الوظيفة بنجاح',
                    icon: 'success'
                });

                loadJobManagement();
            }
        });
    }

    function handleEditJobPosition(e) {
        const index = e.target.dataset.index;
        const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');
        const job = jobPositions[index];

        Swal.fire({
            title: 'تعديل الوظيفة',
            html: `
                <div class="form-group mb-3">
                    <label>اسم الوظيفة</label>
                    <input type="text" id="editJobTitle" class="form-control" value="${job.title}" required>
                </div>
                <div class="form-group mb-3">
                    <label>الأيقونة</label>
                    <input type="text" id="editJobIcon" class="form-control" value="${job.icon}" required>
                </div>
                <div class="form-group mb-3">
                    <label>الأسئلة</label>
                    <div id="editJobQuestions">
                        ${job.questions.map((q, qIndex) => `
                            <div class="input-group mb-2">
                                <input type="text" class="form-control job-question" value="${q.label}" placeholder="أدخل السؤال">
                                <button class="btn btn-danger remove-question-btn" type="button">-</button>
                            </div>
                        `).join('')}
                        <button class="btn btn-success add-question-btn" type="button">+</button>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'حفظ التعديلات',
            cancelButtonText: 'إلغاء',
            didRender: () => {
                const addQuestionBtn = document.querySelector('.add-question-btn');
                const questionsContainer = document.getElementById('editJobQuestions');

                document.querySelectorAll('.remove-question-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.target.closest('.input-group').remove();
                    });
                });

                addQuestionBtn.addEventListener('click', () => {
                    const newQuestionGroup = document.createElement('div');
                    newQuestionGroup.classList.add('input-group', 'mb-2');
                    newQuestionGroup.innerHTML = `
                        <input type="text" class="form-control job-question" placeholder="أدخل السؤال">
                        <button class="btn btn-danger remove-question-btn" type="button">-</button>
                    `;
                    questionsContainer.insertBefore(newQuestionGroup, addQuestionBtn);

                    // Add remove functionality
                    newQuestionGroup.querySelector('.remove-question-btn').addEventListener('click', () => {
                        newQuestionGroup.remove();
                    });
                });
            },
            preConfirm: () => {
                const title = document.getElementById('editJobTitle').value;
                const icon = document.getElementById('editJobIcon').value;
                const questions = Array.from(document.querySelectorAll('.job-question'))
                    .map(q => q.value)
                    .filter(q => q.trim() !== '');

                if (!title || !icon || questions.length === 0) {
                    Swal.showValidationMessage('يرجى ملء جميع الحقول');
                    return false;
                }

                return { title, icon, questions };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                jobPositions[index] = {
                    ...job,
                    title: result.value.title,
                    icon: result.value.icon,
                    questions: result.value.questions.map(q => ({
                        label: q,
                        type: 'textarea'
                    }))
                };

                localStorage.setItem('jobPositions', JSON.stringify(jobPositions));

                Swal.fire({
                    title: 'تم التعديل',
                    text: 'تم تحديث الوظيفة بنجاح',
                    icon: 'success'
                });

                loadJobManagement();
            }
        });
    }

    function handleDeleteJobPosition(e) {
        const index = e.target.dataset.index;
        const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');

        Swal.fire({
            title: 'حذف الوظيفة',
            text: 'هل أنت متأكد من رغبتك في حذف هذه الوظيفة؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                jobPositions.splice(index, 1);
                localStorage.setItem('jobPositions', JSON.stringify(jobPositions));

                Swal.fire({
                    title: 'تم الحذف',
                    text: 'تم حذف الوظيفة بنجاح',
                    icon: 'success'
                });

                loadJobManagement();
            }
        });
    }

    function handleToggleJobApplications() {
        const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');

        Swal.fire({
            title: 'فتح وقفل الوظائف',
            html: `
                <div class="job-management-container">
                    <div class="row g-3">
                        ${jobPositions.map((job, index) => `
                            <div class="col-md-6">
                                <div class="job-selection-card animate__animated animate__fadeIn">
                                    <div class="form-check d-flex justify-content-between align-items-center">
                                        <label class="form-check-label flex-grow-1">
                                            <input class="form-check-input job-checkbox" type="checkbox" id="job-${index}" data-index="${index}">
                                            <span class="job-icon me-2">${job.icon}</span>
                                            ${job.title}
                                        </label>
                                        <span class="badge ${job.status === 'open' ? 'bg-success' : 'bg-danger'} ms-2">
                                            ${job.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="job-actions mt-4 d-flex justify-content-center">
                        <button id="openSelectedJobsBtn" class="btn btn-success me-2">
                            <i class="fas fa-lock-open me-2"></i>فتح الوظائف المحددة
                        </button>
                        <button id="closeSelectedJobsBtn" class="btn btn-danger">
                            <i class="fas fa-lock me-2"></i>قفل الوظائف المحددة
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            didRender: () => {
                const openSelectedJobsBtn = document.getElementById('openSelectedJobsBtn');
                const closeSelectedJobsBtn = document.getElementById('closeSelectedJobsBtn');

                function getSelectedJobs() {
                    return Array.from(document.querySelectorAll('.job-checkbox:checked'))
                        .map(checkbox => parseInt(checkbox.dataset.index));
                }

                openSelectedJobsBtn.addEventListener('click', () => {
                    const selectedJobs = getSelectedJobs();
                    
                    if (selectedJobs.length === 0) {
                        Swal.fire('خطأ', 'يرجى اختيار وظيفة على الأقل', 'warning');
                        return;
                    }

                    const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');
                    selectedJobs.forEach(index => {
                        jobPositions[index].status = 'open';
                    });
                    
                    localStorage.setItem('jobPositions', JSON.stringify(jobPositions));
                    
                    Swal.fire({
                        title: 'تم الفتح',
                        text: `تم فتح ${selectedJobs.length} وظيفة بنجاح`,
                        icon: 'success'
                    }).then(() => {
                        // Reload job management section
                        loadJobManagement();
                    });
                });

                closeSelectedJobsBtn.addEventListener('click', () => {
                    const selectedJobs = getSelectedJobs();
                    
                    if (selectedJobs.length === 0) {
                        Swal.fire('خطأ', 'يرجى اختيار وظيفة على الأقل', 'warning');
                        return;
                    }

                    const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');
                    selectedJobs.forEach(index => {
                        jobPositions[index].status = 'closed';
                    });
                    
                    localStorage.setItem('jobPositions', JSON.stringify(jobPositions));
                    
                    Swal.fire({
                        title: 'تم الإغلاق',
                        text: `تم إغلاق ${selectedJobs.length} وظيفة بنجاح`,
                        icon: 'warning'
                    }).then(() => {
                        // Reload job management section
                        loadJobManagement();
                    });
                });
            }
        });
    }
});