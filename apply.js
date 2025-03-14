document.addEventListener('DOMContentLoaded', () => {
    const applicationForm = document.getElementById('applicationForm');
    const applicationsLockedSection = document.getElementById('applicationsLockedSection');
    const applicationLockedMessage = document.getElementById('applicationLockedMessage');

    // Check if user is blocked before allowing application submission
    function checkUserBlockStatus() {
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        if (currentUser && users[currentUser] && users[currentUser].status === 'blocked') {
            // Hide application form and show blocked message
            applicationForm.classList.add('d-none');
            applicationsLockedSection.classList.remove('d-none');
            applicationLockedMessage.innerHTML = `
                <div class="alert alert-danger text-center animate__animated animate__shakeX">
                    <h4>
                        <i class="fas fa-ban fa-2x mb-3"></i>
                        <br>
                        حسابك محظور
                    </h4>
                    <p>عذرًا، لا يمكنك تقديم طلب انضمام</p>
                    <p class="text-muted">سبب الحظر: ${users[currentUser].blockReason || 'غير محدد'}</p>
                    <p class="text-muted small">يرجى التواصل مع الإدارة للحصول على مزيد من المعلومات</p>
                </div>
            `;
            return false;
        }
        return true;
    }

    // Function to save application details to admin dashboard
    function saveJoinRequest(formData) {
        const applicationsLocked = localStorage.getItem('applicationsLocked') === 'true';
        
        if (applicationsLocked) {
            Swal.fire({
                title: 'التقديم مقفل',
                text: 'عذرًا، التقديم للسيرفر مغلق حاليًا',
                icon: 'warning'
            });
            return null;
        }

        // Retrieve existing join requests or initialize an empty array
        const joinRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
        
        // Add unique identifier and status
        const newJoinRequest = {
            id: Date.now(), // Unique ID
            ...formData,
            status: 'pending', // Initial status
            submissionDate: new Date().toISOString()
        };

        // Add to join requests array
        joinRequests.push(newJoinRequest);
        
        // Save join requests to localStorage
        localStorage.setItem('joinRequests', JSON.stringify(joinRequests));

        return newJoinRequest;
    }

    // Modify existing form submission logic
    applicationForm.addEventListener('submit', (e) => {
        // First check if user is blocked
        if (!checkUserBlockStatus()) {
            e.preventDefault();
            return;
        }

        e.preventDefault();

        const applicationsLocked = localStorage.getItem('applicationsLocked') === 'true';
        
        if (applicationsLocked) {
            Swal.fire({
                title: 'التقديم مقفل',
                html: `
                    <div class="text-center animate__animated animate__shake">
                        <i class="fas fa-lock fa-3x text-warning mb-3"></i>
                        <p>عذرًا، التقديم للسيرفر مغلق حاليًا</p>
                        <p class="text-muted">يرجى الانتظار حتى يتم فتح التقديم</p>
                    </div>
                `,
                icon: 'warning',
                confirmButtonText: 'حسنًا'
            });
            return;
        }

        // Collect form data
        const formData = {
            gameName: document.getElementById('gameName').value,
            discordLink: document.getElementById('discordLink').value,
            age: document.getElementById('age').value,
            rpExperience: document.getElementById('rpExperience').value,
            joinReason: document.getElementById('joinReason').value
        };

        // Validate form data
        if (!validateForm(formData)) return;

        // Confirmation modal with enhanced styling
        Swal.fire({
            title: 'تأكيد الطلب',
            html: `
                <div class="text-start application-preview">
                    <div class="preview-item">
                        <strong>الاسم داخل اللعبة:</strong> 
                        <span>${formData.gameName}</span>
                    </div>
                    <div class="preview-item">
                        <strong>رابط الديسكورد:</strong> 
                        <span>${formData.discordLink}</span>
                    </div>
                    <div class="preview-item">
                        <strong>العمر:</strong> 
                        <span>${formData.age}</span>
                    </div>
                    <div class="preview-item">
                        <strong>الخبرة:</strong> 
                        <span>${formData.rpExperience}</span>
                    </div>
                </div>
                <p class="mt-3 text-center">هل أنت متأكد من صحة المعلومات؟</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، إرسال',
            cancelButtonText: 'مراجعة',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn btn-success animate__animated animate__pulse',
                cancelButton: 'btn btn-secondary animate__animated animate__tada'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Save join request details to admin dashboard
                const savedJoinRequest = saveJoinRequest(formData);

                if (savedJoinRequest) {
                    // Success modal with animation
                    Swal.fire({
                        title: 'تم إرسال الطلب',
                        html: `
                            <div class="application-success-modal">
                                <i class="fas fa-paper-plane fa-4x text-success mb-3 animate__animated animate__bounceIn"></i>
                                <p>سيتم مراجعة طلبك من قبل الإدارة قريبًا</p>
                                <p><strong>رقم الطلب:</strong> ${savedJoinRequest.id}</p>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'حسنًا',
                        customClass: {
                            confirmButton: 'btn btn-primary animate__animated animate__rubberBand'
                        }
                    }).then(() => {
                        // Reset form
                        applicationForm.reset();
                        applicationForm.classList.remove('was-validated');
                    });

                    // Add a notification for the admin dashboard directly to applications
                    addNotification(
                        'طلب انضمام جديد', 
                        `تم تقديم طلب انضمام جديد من ${formData.gameName}`, 
                        'application'
                    );
                }
            }
        });
    });

    // Existing validation function remains the same
    function validateForm(data) {
        // Enhanced validation
        for (let key in data) {
            if (!data[key] || data[key].trim() === '') {
                Swal.fire('خطأ', 'يرجى ملء جميع الحقول', 'error');
                return false;
            }
        }

        if (data.age < 16 || data.age > 50) {
            Swal.fire('خطأ', 'يجب أن يكون العمر بين 16 و50 عامًا', 'error');
            return false;
        }

        return true;
    }

    // Call block status check on page load
    checkUserBlockStatus();

    // Create back button with save functionality
    function createBackButton() {
        const backButton = document.createElement('div');
        backButton.classList.add('back-button', 'animate__animated');
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
        document.body.appendChild(backButton);

        backButton.addEventListener('click', () => {
            // Animate and navigate
            backButton.classList.add('animate__bounceOut');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
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
});

function addNotification(title, message, type) {
    // Add a notification for the admin dashboard directly to applications
    // This function is not specified in the plan but was present in the current code
    // For the purpose of this exercise, it will be left as is.
    // You may need to implement or modify it based on your actual requirements.
}