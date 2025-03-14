document.addEventListener('DOMContentLoaded', () => {
    // Enhanced Authentication Management
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    const usernameSpan = document.querySelector('#userProfileDropdown span');
    const navLinks = document.querySelectorAll('.nav-link');

    // Initialize Users Storage
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify({}));
    }

    // Function to save user details to admin dashboard
    function saveUserToAdminDashboard(userData) {
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('adminUsers', JSON.stringify(users));

        return newUser;
    }

    function getUserStatusBadge(user) {
        // Determine badge based on user status
        const statusBadges = {
            'active': {
                class: 'badge bg-success animate__animated animate__tada',
                icon: 'fa-user-check',
                text: 'مفعل'
            },
            'inactive': {
                class: 'badge bg-danger animate__animated animate__shake',
                icon: 'fa-user-lock',
                text: 'غير مفعل'
            },
            'rejected': {
                class: 'badge bg-warning animate__animated animate__flash',
                icon: 'fa-user-times',
                text: 'مرفوض'
            },
            'pending': {
                class: 'badge bg-secondary animate__animated animate__pulse',
                icon: 'fa-hourglass-half',
                text: 'قيد المراجعة'
            }
        };

        // Default to inactive if no status is set
        const status = user.status || 'inactive';
        const badgeConfig = statusBadges[status] || statusBadges['inactive'];

        return `
            <span class="${badgeConfig.class} ms-2 user-status-badge" title="${badgeConfig.text}">
                <i class="fas ${badgeConfig.icon} me-1"></i>
                ${badgeConfig.text}
            </span>
        `;
    }

    // Navigation Protection
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const currentUser = localStorage.getItem('currentUser');
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            // Check if user is blocked
            if (currentUser && users[currentUser] && users[currentUser].status === 'blocked') {
                e.preventDefault();
                Swal.fire({
                    title: 'حساب محظور',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-ban fa-4x text-danger mb-3 animate__animated animate__shakeX"></i>
                            <p>عذرًا، حسابك محظور ولا يمكنك الوصول إلى هذه الصفحة</p>
                            <p class="text-muted">سبب الحظر: ${users[currentUser].blockReason || 'غير محدد'}</p>
                        </div>
                    `,
                    icon: 'error',
                    confirmButtonText: 'فهمت'
                });
                return;
            }

            // Prevent navigation to other pages if not logged in
            if (!currentUser && link.getAttribute('href') !== '#home' && link.getAttribute('href') !== '') {
                e.preventDefault();
                Swal.fire({
                    title: 'تسجيل الدخول مطلوب',
                    text: 'يجب عليك تسجيل الدخول أولاً للوصول إلى هذه الصفحة',
                    icon: 'warning',
                    confirmButtonText: 'تسجيل الدخول',
                    cancelButtonText: 'إلغاء'
                }).then((result) => {
                    if (result.isConfirmed) {
                        loginBtn.click(); // Trigger login modal
                    }
                });
            }
        });
    });

    // Profile Settings Navigation
    const settingsLink = document.querySelector('.dropdown-item[href="#"]');
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = localStorage.getItem('currentUser');
            
            if (currentUser) {
                window.location.href = 'settings.html';
            } else {
                Swal.fire({
                    title: 'تسجيل الدخول مطلوب',
                    text: 'يجب عليك تسجيل الدخول أولاً للوصول إلى الإعدادات',
                    icon: 'warning',
                    confirmButtonText: 'تسجيل الدخول',
                    cancelButtonText: 'إلغاء'
                }).then((result) => {
                    if (result.isConfirmed) {
                        loginBtn.click(); // Trigger login modal
                    }
                });
            }
        });
    }

    // Authentication Check on Page Load
    function checkAuthenticationState() {
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];
            
            if (user) {
                // Check if user is blocked
                if (user.status === 'blocked') {
                    // Show blocked user message and prevent login
                    Swal.fire({
                        title: 'حساب محظور',
                        html: `
                            <div class="text-center">
                                <i class="fas fa-ban fa-4x text-danger mb-3 animate__animated animate__shakeX"></i>
                                <p>عذرًا، حسابك محظور</p>
                                <p class="text-muted">سبب الحظر: ${user.blockReason || 'غير محدد'}</p>
                                <p class="text-muted">تاريخ الحظر: ${new Date(user.blockedAt).toLocaleString('ar-EG')}</p>
                            </div>
                        `,
                        icon: 'error',
                        confirmButtonText: 'فهمت'
                    });

                    // Remove current user and prevent further access
                    localStorage.removeItem('currentUser');
                    return false;
                }
                
                // Existing authentication logic remains the same
                loginBtn.style.display = 'none';
                userProfileDropdown.closest('.d-flex').style.display = 'flex';
                usernameSpan.textContent = user.username;
                
                updateNavbarProfile();
                
                updateJobApplicationVisibility();

                return true;
            }
        }
        
        // Hide user profile, show login button
        loginBtn.style.display = 'block';
        userProfileDropdown.closest('.d-flex').style.display = 'none';
        return false;
    }

    function updateJobApplicationVisibility() {
        const jobApplicationNav = document.querySelector('.job-application-nav');
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (currentUser && users[currentUser] && users[currentUser].status === 'active') {
            jobApplicationNav.style.display = 'block';
        } else {
            jobApplicationNav.style.display = 'none';
        }
    }

    // Registration Function
    function registerUser(username, email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (users[username]) {
            return false; // User already exists
        }
        
        const userData = {
            username,
            email,
            password,
            profileImage: 'https://via.placeholder.com/40',
            status: 'inactive', // Set default status to inactive
            createdAt: new Date().toISOString(),
            darkMode: false,
            language: 'ar',
            emailNotifications: false,
            discordNotifications: false
        };

        users[username] = userData;
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', username);

        // Save user to admin dashboard user management
        saveUserToAdminDashboard(userData);

        return true;
    }

    // Login Function
    function loginUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (users[username] && users[username].password === password) {
            localStorage.setItem('currentUser', username);
            return true;
        }
        
        return false;
    }

    // Logout Function
    function logoutUser() {
        localStorage.removeItem('currentUser');
        checkAuthenticationState();
    }

    function updateNavbarProfile() {
        const currentUser = localStorage.getItem('currentUser');
        const navbarProfileImage = document.getElementById('navbarProfileImage');
        const usernameSpan = document.getElementById('username');

        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];

            if (user) {
                // Retrieve profile image specific to the current user
                const profileImageKey = `profileImage_${currentUser}`;
                const profileImage = localStorage.getItem(profileImageKey) || user.profileImage || 'https://via.placeholder.com/40';
                navbarProfileImage.src = profileImage;

                // Update username with status badge
                usernameSpan.innerHTML = `
                    ${user.username || currentUser}
                    ${getUserStatusBadge(user)}
                `;
            }
        }
    }

    // Login Modal
    loginBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'تسجيل الدخول',
            html: `
                <div class="login-container">
                    <div class="login-header">
                        <h2 class="login-title">مرحبًا بعودتك</h2>
                        <p class="login-subtitle">سجل دخولك للاستمتاع بتجربة EAGLE RP</p>
                    </div>
                    <div class="login-form">
                        <div class="form-floating mb-3">
                            <input type="text" id="loginUsername" class="form-control" placeholder="اسم المستخدم" required>
                            <label for="loginUsername">اسم المستخدم</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="password" id="loginPassword" class="form-control" placeholder="كلمة المرور" required>
                            <label for="loginPassword">كلمة المرور</label>
                        </div>
                        <div class="login-actions">
                            <button id="loginSubmitBtn" class="btn btn-login btn-primary w-100 mb-3">
                                <i class="fas fa-sign-in-alt me-2"></i>تسجيل الدخول
                            </button>
                            <button id="adminLoginBtn" class="btn btn-secondary w-100 mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-user-shield me-2"></i>
                                    <span>تسجيل دخول الإدارة</span>
                                    <span class="badge bg-danger ms-2 animate__animated animate__pulse">
                                        <i class="fas fa-lock"></i>
                                    </span>
                                </div>
                            </button>
                            <button id="createAccountBtn" class="btn btn-outline-primary w-100">
                                <i class="fas fa-user-plus me-2"></i>إنشاء حساب جديد
                            </button>
                        </div>
                        <div class="login-footer">
                            <p>مستخدم جديد؟ <a href="#" id="createAccountLink">إنشاء حساب</a></p>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            didRender: () => {
                const loginSubmitBtn = document.getElementById('loginSubmitBtn');
                const adminLoginBtn = document.getElementById('adminLoginBtn');
                const createAccountBtn = document.getElementById('createAccountBtn');
                const loginUsername = document.getElementById('loginUsername');
                const loginPassword = document.getElementById('loginPassword');

                // Login Submit Button
                loginSubmitBtn.addEventListener('click', performLogin);

                // Admin Login Button
                adminLoginBtn.addEventListener('click', () => {
                    Swal.fire({
                        title: 'تسجيل دخول الإدارة',
                        html: `
                            <div class="admin-login-container">
                                <div class="admin-login-header text-center mb-4">
                                    <i class="fas fa-user-shield fa-3x text-primary mb-3"></i>
                                    <h3>لوحة تحكم الإدارة</h3>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="text" id="adminCode" class="form-control" placeholder="أدخل كود الإدارة">
                                    <label for="adminCode">كود الإدارة</label>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'دخول',
                        cancelButtonText: 'إلغاء',
                        preConfirm: () => {
                            const adminCode = document.getElementById('adminCode').value;
                            if (adminCode === '2000') {
                                window.location.href = 'admin-dashboard.html';
                            } else {
                                Swal.showValidationMessage('كود الإدارة غير صحيح');
                                return false;
                            }
                        }
                    });
                });

                // Create Account Button
                createAccountBtn.addEventListener('click', () => {
                    Swal.fire({
                        title: 'إنشاء حساب جديد',
                        html: `
                            <div class="create-account-container">
                                <div class="form-floating mb-3">
                                    <input type="text" id="newUsername" class="form-control" placeholder="اسم المستخدم">
                                    <label for="newUsername">اسم المستخدم</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="email" id="newEmail" class="form-control" placeholder="البريد الإلكتروني">
                                    <label for="newEmail">البريد الإلكتروني</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="password" id="newPassword" class="form-control" placeholder="كلمة المرور">
                                    <label for="newPassword">كلمة المرور</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input type="password" id="confirmPassword" class="form-control" placeholder="تأكيد كلمة المرور">
                                    <label for="confirmPassword">تأكيد كلمة المرور</label>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'إنشاء حساب',
                        cancelButtonText: 'إلغاء',
                        preConfirm: () => {
                            const username = document.getElementById('newUsername').value.trim();
                            const email = document.getElementById('newEmail').value;
                            const password = document.getElementById('newPassword').value;
                            const confirmPassword = document.getElementById('confirmPassword').value;

                            if (!username) {
                                Swal.showValidationMessage('يرجى إدخال اسم مستخدم');
                                return false;
                            }

                            const usernameRegex = /^[a-zA-Z0-9_]+$/;
                            if (!usernameRegex.test(username)) {
                                Swal.showValidationMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط');
                                return false;
                            }

                            if (!email || !password || !confirmPassword) {
                                Swal.showValidationMessage('يرجى ملء جميع الحقول');
                                return false;
                            }

                            if (password !== confirmPassword) {
                                Swal.showValidationMessage('كلمات المرور غير متطابقة');
                                return false;
                            }

                            if (registerUser(username, email, password)) {
                                return { username, email };
                            } else {
                                Swal.showValidationMessage('اسم المستخدم موجود بالفعل');
                                return false;
                            }
                        }
                    }).then((result) => {
                        if (result.value) {
                            Swal.fire('نجاح', 'تم إنشاء الحساب بنجاح', 'success');
                            checkAuthenticationState();
                        }
                    });
                });

                // Enter key login
                loginUsername.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter' && loginPassword.value) {
                        performLogin();
                    }
                });

                loginPassword.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter' && loginUsername.value) {
                        performLogin();
                    }
                });
            }
        });

        function performLogin() {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (loginUser(username, password)) {
                Swal.close();
                checkAuthenticationState();
            } else {
                Swal.fire('خطأ', 'اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
            }
        }
    });

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];
            
            // Save profile image specific to the current user
            const profileImage = localStorage.getItem('profileImage');
            if (profileImage) {
                const profileImageKey = `profileImage_${currentUser}`;
                localStorage.setItem(profileImageKey, profileImage);
                
                // Remove the generic profileImage
                localStorage.removeItem('profileImage');
            }
            
            // Update user information in localStorage
            users[currentUser] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Remove current user session
        localStorage.removeItem('currentUser');
        
        // Redirect to main page
        window.location.href = 'index.html';
    });

    // Enhanced Announcements Rendering Function
    function populateHomepageAnnouncements() {
        const homepageAnnouncements = document.getElementById('homepageAnnouncements');
        
        // Ensure homepage announcements container exists
        if (!homepageAnnouncements) return console.warn('Homepage announcements container not found.');

        // Get announcements from localStorage
        const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
        
        // Sort announcements by date (most recent first) and limit to 3
        const recentAnnouncements = announcements
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        // Clear existing content
        homepageAnnouncements.innerHTML = '';

        // If no announcements, show placeholder
        if (recentAnnouncements.length === 0) {
            homepageAnnouncements.innerHTML = `
                <div class="col-12 text-center text-muted py-5 animate__animated animate__fadeIn">
                    <i class="fas fa-bullhorn fa-4x mb-3 opacity-50"></i>
                    <p>لا توجد إعلانات حديثة</p>
                </div>
            `;
            return;
        }

        // Render announcements with enhanced styling
        recentAnnouncements.forEach((announcement, index) => {
            const { badgeClass, icon } = getAnnouncementTypeDetails(announcement.type);

            const announcementCard = document.createElement('div');
            announcementCard.classList.add(
                'col-md-4', 
                'animate__animated', 
                'announcement-card-wrapper'
            );
            announcementCard.style.animationDelay = `${index * 0.2}s`;

            announcementCard.innerHTML = `
                <div class="announcement-card position-relative overflow-hidden shadow-lg">
                    <div class="announcement-image-overlay position-absolute w-100 h-100" style="
                        background: linear-gradient(
                            135deg, 
                            rgba(${getGradientColors(announcement.type)}, 0.8), 
                            rgba(${getGradientColors(announcement.type)}, 0.5)
                        );
                    "></div>
                    <div class="card-content position-relative p-4 text-white">
                        <div class="announcement-header d-flex justify-content-between align-items-center mb-3">
                            <h5 class="announcement-title mb-0">${announcement.title}</h5>
                            <span class="badge ${badgeClass}">
                                <i class="${icon} me-2"></i>
                                ${getTypeLabel(announcement.type)}
                            </span>
                        </div>
                        <p class="announcement-excerpt mb-3">
                            ${truncateText(announcement.content, 100)}
                        </p>
                        <div class="announcement-footer d-flex justify-content-between align-items-center">
                            <small class="text-light">
                                <i class="fas fa-calendar-alt me-2"></i>
                                ${formatDate(announcement.date)}
                            </small>
                            <button class="btn btn-sm btn-outline-light view-announcement" data-id="${announcement.id}">
                                اقرأ المزيد
                                <i class="fas fa-chevron-left ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            homepageAnnouncements.appendChild(announcementCard);
        });

        // Add event listeners for "Read More" buttons
        document.querySelectorAll('.view-announcement').forEach(button => {
            button.addEventListener('click', showFullAnnouncement);
        });
    }

    // Helper function to get gradient colors based on announcement type
    function getGradientColors(type) {
        const colorMap = {
            'updates': '31, 41, 153',     // Deep Blue
            'rules': '173, 54, 54',       // Dark Red
            'events': '39, 174, 96',      // Green
            'warnings': '231, 76, 60',    // Bright Red
            'default': '52, 152, 219'     // Azure
        };
        return colorMap[type] || colorMap['default'];
    }

    // Existing helper functions remain the same
    function getAnnouncementTypeDetails(type) {
        const typeDetails = {
            'updates': { 
                badgeClass: 'bg-info', 
                icon: 'fas fa-sync'
            },
            'rules': { 
                badgeClass: 'bg-warning', 
                icon: 'fas fa-gavel'
            },
            'events': { 
                badgeClass: 'bg-success', 
                icon: 'fas fa-calendar-alt'
            },
            'warnings': { 
                badgeClass: 'bg-danger', 
                icon: 'fas fa-exclamation-triangle'
            },
            'default': { 
                badgeClass: 'bg-primary', 
                icon: 'fas fa-bell'
            }
        };

        return typeDetails[type] || typeDetails['default'];
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

    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function showFullAnnouncement(e) {
        const announcementId = e.target.dataset.id;
        const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
        const announcement = announcements.find(a => a.id.toString() === announcementId);

        if (announcement) {
            const { badgeClass, icon } = getAnnouncementTypeDetails(announcement.type);

            Swal.fire({
                title: announcement.title,
                html: `
                    <div class="announcement-details text-start">
                        <div class="announcement-meta mb-3 d-flex justify-content-between align-items-center">
                            <span class="badge ${badgeClass} fs-6">
                                <i class="${icon} me-2"></i>
                                ${getTypeLabel(announcement.type)}
                            </span>
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-2"></i>
                                ${formatDate(announcement.date)}
                            </small>
                        </div>
                        <div class="announcement-content">
                            <p class="lead">${announcement.content}</p>
                        </div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'إغلاق',
                customClass: {
                    popup: 'animate__animated animate__zoomIn',
                    confirmButton: 'btn btn-primary animate__animated animate__pulse'
                }
            });
        }
    }

    // Add event listener for announcements navigation
    const announcementsNavLink = document.querySelector('a[href="announcements.html"]');
    if (announcementsNavLink) {
        announcementsNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'announcements.html';
        });
    }

    // Listen for storage changes to update announcements
    window.addEventListener('storage', (e) => {
        if (e.key === 'serverAnnouncements') {
            populateHomepageAnnouncements();
        }
    });

    // Add event listeners for profile updates
    window.addEventListener('storage', (e) => {
        if (e.key === 'profileImage' || e.key === 'currentUser') {
            updateNavbarProfile();
        }
    });

    // Initial authentication check
    checkAuthenticationState();

    // Initial call to populate announcements
    populateHomepageAnnouncements();

    // Load user-specific settings
    document.addEventListener('DOMContentLoaded', () => {
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];

            // Load user-specific settings
            const darkModeToggle = document.getElementById('darkModeToggle');
            const languageSelect = document.getElementById('languageSelect');
            const emailNotificationsToggle = document.getElementById('emailNotifications');
            const discordNotificationsToggle = document.getElementById('discordNotifications');

            if (darkModeToggle) {
                darkModeToggle.checked = user.darkMode || false;
                document.body.classList.toggle('dark-mode', user.darkMode);
            }

            if (languageSelect) {
                languageSelect.value = user.language || 'ar';
            }

            if (emailNotificationsToggle) {
                emailNotificationsToggle.checked = user.emailNotifications || false;
            }

            if (discordNotificationsToggle) {
                discordNotificationsToggle.checked = user.discordNotifications || false;
            }

            // Similar modifications for other settings...
        }
    });
});