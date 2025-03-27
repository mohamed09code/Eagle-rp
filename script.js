document.addEventListener('DOMContentLoaded', () => {
    // Safer element selection with optional chaining and fallback
    const homePage = document.getElementById('homePage');
    const requestPage = document.getElementById('requestPage');
    const successPage = document.getElementById('successPage');
    const requestServiceBtn = document.getElementById('requestServiceBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const backToHomeFromSuccessBtn = document.getElementById('backToHomeBtn');
    const form = document.getElementById('websiteRequestForm');
    const successMessage = document.getElementById('successMessage');

    // Error logging and graceful handling
    const safeAddEventListener = (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        } else {
            console.warn(`Element not found for ${event} event`);
        }
    };

    // Project Examples Modal Functionality
    const exampleItems = document.querySelectorAll('.example-item');
    const exampleModal = document.getElementById('exampleModal');
    const exampleModalClose = document.getElementById('exampleModalClose');
    const exampleModalContent = document.getElementById('exampleModalContent');

    // Configuration settings
    const CONFIG = {
        DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1353754561294372864/kNO8NTodZKSBA0Cz-7xoZ3kB7qNQvVPb0s8mnCLH1pjkT88LBSxe_SM8EjJYjWeEvsVZ', // Replace with actual webhook
        ANIMATION_DURATION: 500 // ms for smooth transitions
    };

    // Enhanced Page Navigation with Smooth Transitions
    function navigateToPage(hidePage, showPage) {
        if (hidePage && showPage) {
            // Add fade out effect to hide page
            hidePage.classList.add('page-fade-out');
            
            // Use a slight delay to create smoother transition
            setTimeout(() => {
                hidePage.classList.remove('active', 'page-fade-out');
                showPage.classList.add('active');
                
                // Scroll to top of the new page
                window.scrollTo(0, 0);
            }, 300);
        }
    }

    // Event Listeners for Navigation
    if (requestServiceBtn) {
        requestServiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(homePage, requestPage);
        });
    }

    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(requestPage, homePage);
        });
    }

    // Project Examples Modal Logic
    exampleItems.forEach(item => {
        safeAddEventListener(item, 'click', () => {
            const title = item.querySelector('h3')?.textContent || 'مشروع';
            const description = item.querySelector('p')?.textContent || 'تفاصيل المشروع';
            const exampleType = item.dataset.type || 'default';

            // Ensure exampleModalContent exists before updating
            if (exampleModalContent) {
                exampleModalContent.innerHTML = `
                    <div class="example-modal-inner">
                        <h2>${title}</h2>
                        <div class="example-modal-image" style="background-image: url('/images/${exampleType}.jpg')"></div>
                        <p>${description}</p>
                        <ul class="example-details">
                            ${getExampleDetails(exampleType)}
                        </ul>
                    </div>
                `;
            }

            if (exampleModal) {
                exampleModal.classList.add('modal-active');
            }
        });
    });

    // Close modal with safe event listener
    safeAddEventListener(exampleModalClose, 'click', () => {
        if (exampleModal) {
            exampleModal.classList.remove('modal-active');
        }
    });

    // Function to get dynamic details based on example type
    function getExampleDetails(type) {
        const details = {
            'ecommerce': `
                <li>لوحة تحكم متكاملة</li>
                <li>نظام دفع آمن</li>
                <li>تصميم متجاوب</li>
                <li>إدارة المنتجات</li>
            `,
            'blog': `
                <li>واجهة سهلة الاستخدام</li>
                <li>نظام نشر محتوى متطور</li>
                <li>دعم المدونين</li>
                <li>تحليلات متقدمة</li>
            `,
            'corporate': `
                <li>تصميم احترافي</li>
                <li>عرض الخدمات</li>
                <li>معلومات الاتصال</li>
                <li>سلس وسريع التحميل</li>
            `,
            'default': `
                <li>تصميم احترافي</li>
                <li>أداء عالي</li>
                <li>متوافق مع جميع الأجهزة</li>
                <li>دعم فني متميز</li>
            `
        };
        return details[type] || details['default'];
    }

    // Enhanced Form Validation
    function validateForm() {
        const form = document.getElementById('websiteRequestForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            
            // Special validation for Discord ID
            if (field.id === 'discord') {
                // Validate Discord ID is numeric and between 17-20 digits
                const discordIdRegex = /^\d{17,20}$/;
                if (!discordIdRegex.test(field.value.trim())) {
                    formGroup.classList.add('error');
                    isValid = false;
                } else {
                    formGroup.classList.remove('error');
                }
            } else if (!field.value.trim()) {
                formGroup.classList.add('error');
                isValid = false;
            } else {
                formGroup.classList.remove('error');
            }
        });

        return isValid;
    }

    // Add event listeners for real-time validation
    document.getElementById('websiteRequestForm')?.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });

    // Add real-time validation on input
    document.getElementById('websiteRequestForm')?.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            
            if (this.value.trim()) {
                formGroup.classList.remove('error');
            } else {
                formGroup.classList.add('error');
            }
        });
    });

    // Form Submission with Enhanced Error Handling
    safeAddEventListener(form, 'submit', async (e) => {
        e.preventDefault();

        // Safely get submit button
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'جاري الإرسال...';
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const message = {
            content: "طلب موقع جديد ",
            embeds: [{
                title: 'طلب برمجة موقع جديد',
                color: 3066993, 
                fields: [
                    { name: 'الاسم', value: data.name, inline: true },
                    { name: 'معرف ديسكورد', value: data.discord, inline: true },
                    { name: 'نوع الموقع', value: data.websiteType, inline: true },
                    { name: 'الميزانية', value: data.budget, inline: true },
                    { name: 'طريقة الدفع', value: data.paymentMethod, inline: true },
                    { name: 'التفاصيل', value: data.details || 'لا توجد تفاصيل إضافية' }
                ]
            }]
        };

        try {
            const response = await fetch(CONFIG.DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            });

            if (response.ok) {
                // Navigate to success page instead of showing message
                navigateToPage(requestPage, successPage);
                form?.reset();
            } else {
                throw new Error('فشل إرسال الطلب');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        } finally {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'إرسال الطلب';
            }
        }
    });

    // Back to home from success page
    if (backToHomeFromSuccessBtn) {
        backToHomeFromSuccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(successPage, homePage);
        });
    }

    // Optional: Add some page load animations
    setTimeout(() => {
        document.querySelectorAll('.animate-on-load').forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);
});