document.addEventListener('DOMContentLoaded', () => {
    // Add null checks for all element selections
    const profileImageUpload = document.getElementById('changeProfileImageBtn');
    const profileImage = document.getElementById('profileImage');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const languageSelect = document.getElementById('languageSelect');
    const usernameInput = document.getElementById('username');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const emailNotificationsToggle = document.getElementById('emailNotifications');
    const discordNotificationsToggle = document.getElementById('discordNotifications');
    const accountStatusContainer = document.getElementById('accountStatusContainer');

    // Safely add event listeners with checks
    if (profileImageUpload) {
        profileImageUpload.addEventListener('click', () => {
            const fileInput = document.getElementById('profileImageUpload');
            if (fileInput) fileInput.click();
        });
    }

    const fileInput = document.getElementById('profileImageUpload');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && profileImage) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    profileImage.src = event.target.result;
                    localStorage.setItem('profileImage', event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Safe event listeners with null checks
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeToggle.checked);
            localStorage.setItem('darkMode', darkModeToggle.checked);
        });
    }

    if (languageSelect) {
        languageSelect.addEventListener('change', () => {
            const selectedLanguage = languageSelect.value;
            localStorage.setItem('siteLanguage', selectedLanguage);
        });
    }

    // Function to save current settings
    function saveCurrentSettings() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];

            const usernameInput = document.getElementById('username');
            const newUsername = usernameInput ? usernameInput.value.trim() : currentUser;

            // Check if username is being changed
            if (newUsername !== currentUser) {
                // Remove old user entry
                delete users[currentUser];
                
                // Update user with new username
                user.username = newUsername;
                users[newUsername] = user;
                
                // Update current user in localStorage
                localStorage.setItem('currentUser', newUsername);
            }

            // Save profile image
            const profileImage = localStorage.getItem('profileImage');
            if (profileImage) {
                user.profileImage = profileImage;
                
                // Save profile image specific to this user
                const profileImageKey = `profileImage_${newUsername}`;
                localStorage.setItem(profileImageKey, profileImage);
                localStorage.removeItem('profileImage');
            }

            // Save dark mode preference
            if (darkModeToggle) {
                user.darkMode = darkModeToggle.checked;
            }

            // Save language preference
            if (languageSelect) {
                user.language = languageSelect.value;
            }

            // Save notification preferences
            if (emailNotificationsToggle) {
                user.emailNotifications = emailNotificationsToggle.checked;
            }

            if (discordNotificationsToggle) {
                user.discordNotifications = discordNotificationsToggle.checked;
            }

            // Handle password change
            const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmNewPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

            if (newPassword && newPassword === confirmNewPassword) {
                user.password = newPassword;
            } else if (newPassword && newPassword !== confirmNewPassword) {
                Swal.fire('خطأ', 'كلمات المرور غير متطابقة', 'error');
                return false;
            }

            // Update user in localStorage
            users[newUsername || currentUser] = user;
            localStorage.setItem('users', JSON.stringify(users));

            return true;
        }
        return false;
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const newUsername = usernameInput ? usernameInput.value.trim() : '';
            
            // Validate username if changed
            if (newUsername) {
                const usernameRegex = /^[a-zA-Z0-9_]+$/;
                if (!usernameRegex.test(newUsername)) {
                    Swal.fire('خطأ', 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط', 'error');
                    return;
                }
            }

            // Save settings with username change handling
            const settingsSaved = saveCurrentSettings();

            if (settingsSaved !== false) {
                Swal.fire('نجاح', 'تم حفظ الإعدادات بنجاح', 'success');
            }
        });
    }

    // Existing loadSettings function with additional null checks
    function loadSettings() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];

            if (profileImage) {
                const profileImageKey = `profileImage_${currentUser}`;
                const savedProfileImage = localStorage.getItem(profileImageKey) || user.profileImage;
                if (savedProfileImage) {
                    profileImage.src = savedProfileImage;
                }
            }

            if (darkModeToggle) {
                const darkMode = user.darkMode;
                darkModeToggle.checked = darkMode;
                document.body.classList.toggle('dark-mode', darkMode);
            }

            if (languageSelect) {
                const savedLanguage = user.language;
                languageSelect.value = savedLanguage;
            }

            if (emailNotificationsToggle && discordNotificationsToggle) {
                const emailNotifications = user.emailNotifications;
                const discordNotifications = user.discordNotifications;
                
                emailNotificationsToggle.checked = emailNotifications;
                discordNotificationsToggle.checked = discordNotifications;
            }
        }
    }

    // Function to get user status details
    function getUserStatusDetails(status) {
        const statusConfig = {
            'active': {
                badgeClass: 'badge bg-success animate__animated animate__tada user-status-badge',
                icon: 'fas fa-check-circle',
                text: 'مفعل'
            },
            'inactive': {
                badgeClass: 'badge bg-warning animate__animated animate__shake user-status-badge',
                icon: 'fas fa-exclamation-circle',
                text: 'غير مفعل'
            },
            'blocked': {
                badgeClass: 'badge bg-danger animate__animated animate__flash user-status-badge',
                icon: 'fas fa-ban',
                text: 'محظور'
            },
            'pending': {
                badgeClass: 'badge bg-secondary animate__animated animate__pulse user-status-badge',
                icon: 'fas fa-hourglass-half',
                text: 'قيد المراجعة'
            }
        };

        return statusConfig[status] || statusConfig['inactive'];
    }

    // Function to load account status
    function loadAccountStatus() {
        const accountStatusContainer = document.getElementById('accountStatusContainer');
        
        // Add null check for accountStatusContainer
        if (!accountStatusContainer) {
            console.warn('Account status container not found');
            return;
        }

        const currentUser = localStorage.getItem('currentUser');

        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            const user = users[currentUser];

            if (user) {
                const statusDetails = getUserStatusDetails(user.status || 'inactive');

                accountStatusContainer.innerHTML = `
                    <span class="${statusDetails.badgeClass} d-flex align-items-center">
                        <i class="${statusDetails.icon} me-2"></i>
                        ${statusDetails.text}
                    </span>
                    ${user.status === 'blocked' ? `
                        <div class="ms-3 text-muted small">
                            <strong>سبب الحظر:</strong> ${user.blockReason || 'غير محدد'}
                        </div>
                    ` : ''}
                `;
            }
        }
    }

    // Enhanced back button creation
    function createBackButton() {
        const backButton = document.createElement('div');
        backButton.classList.add('back-button', 'animate__animated');
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
        document.body.appendChild(backButton);

        backButton.addEventListener('click', () => {
            // Attempt to save settings
            const settingsSaved = saveCurrentSettings();
            
            // If settings save was successful or skipped, navigate to home
            if (settingsSaved !== false) {
                // Animate and navigate
                backButton.classList.add('animate__bounceOut');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 300);
            }
        });

        // Hover and interaction effects for back button
        backButton.addEventListener('mouseenter', () => {
            backButton.classList.add('animate__pulse');
        });

        backButton.addEventListener('mouseleave', () => {
            backButton.classList.remove('animate__pulse');
        });
    }

    // Call back button creation
    createBackButton();

    // Initial load of settings
    loadSettings();
    loadAccountStatus();
});