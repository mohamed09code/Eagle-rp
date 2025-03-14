document.addEventListener('DOMContentLoaded', () => {
    const jobsGrid = document.getElementById('jobsGrid');
    const jobDetailsModal = new bootstrap.Modal(document.getElementById('jobDetailsModal'));
    const jobModalTitle = document.getElementById('jobModalTitle');
    const jobModalContent = document.getElementById('jobModalContent');

    // Check user authorization
    function checkUserAuthorization() {
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        return currentUser && users[currentUser] && users[currentUser].status === 'active';
    }

    // Render job cards
    function renderJobCards() {
        jobsGrid.innerHTML = '';
        const isAuthorized = checkUserAuthorization();

        // Get job positions from localStorage
        const jobPositions = JSON.parse(localStorage.getItem('jobPositions') || '[]');

        jobPositions.forEach((jobConfig) => {
            const jobCard = document.createElement('div');
            jobCard.classList.add('job-card', 'animate__animated', 'animate__fadeIn');
            
            jobCard.innerHTML = `
                <div class="job-card-header">
                    <h4 class="mb-0">${jobConfig.icon} ${jobConfig.title}</h4>
                    <span class="job-status ${jobConfig.status}">
                        ${jobConfig.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </span>
                </div>
                <div class="card-body text-center p-4">
                    <button 
                        class="btn btn-primary job-action-btn" 
                        data-job="${jobConfig.id}"
                        ${jobConfig.status !== 'open' || !isAuthorized ? 'disabled' : ''}
                    >
                        ${jobConfig.status === 'open' ? 'تقديم الآن' : 'غير متاح حاليًا'}
                    </button>
                </div>
            `;

            jobsGrid.appendChild(jobCard);

            // Add event listener to job action button
            const jobActionBtn = jobCard.querySelector('.job-action-btn');
            jobActionBtn.addEventListener('click', () => showJobApplicationForm(jobConfig));
        });
    }

    // Show job application form
    function showJobApplicationForm(jobConfig) {
        jobModalTitle.innerHTML = `
            <i class="fas fa-file-alt me-2"></i>
            نموذج التقديم - ${jobConfig.icon} ${jobConfig.title}
        `;

        const questionsHTML = jobConfig.questions.map((question, index) => `
            <div class="form-floating mb-3">
                <${question.type === 'textarea' ? 'textarea' : 'input'}
                    class="form-control job-input"
                    id="question${index}"
                    placeholder="${question.label}"
                    ${question.type === 'textarea' ? 'style="height: 120px"' : ''}
                    required
                ></${question.type === 'textarea' ? 'textarea' : 'input'}>
                <label for="question${index}">${question.label}</label>
            </div>
        `).join('');

        jobModalContent.innerHTML = `
            <form id="jobApplicationForm">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control job-input" id="discordUsername" placeholder="اسم المستخدم في ديسكورد" required>
                            <label for="discordUsername">اسم المستخدم في ديسكورد</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control job-input" id="discordId" placeholder="معرف حساب ديسكورد" required>
                            <label for="discordId">معرف حساب ديسكورد</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control job-input" id="inGameName" placeholder="اسمك داخل اللعبة" required>
                            <label for="inGameName">اسمك داخل اللعبة</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-floating mb-3">
                            <input type="email" class="form-control job-input" id="email" placeholder="البريد الإلكتروني" required>
                            <label for="email">البريد الإلكتروني</label>
                        </div>
                    </div>
                    ${questionsHTML}
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary btn-lg w-100 job-action-btn">
                            <i class="fas fa-paper-plane me-2"></i>
                            إرسال الطلب
                        </button>
                    </div>
                </div>
            </form>
        `;

        jobDetailsModal.show();

        const jobApplicationForm = document.getElementById('jobApplicationForm');
        jobApplicationForm.addEventListener('submit', (e) => submitJobApplication(e, jobConfig));
    }

    // Submit job application
    function submitJobApplication(e, jobConfig) {
        e.preventDefault();

        const formData = {
            jobId: jobConfig.id,
            jobTitle: jobConfig.title,
            discordUsername: document.getElementById('discordUsername').value,
            discordId: document.getElementById('discordId').value,
            inGameName: document.getElementById('inGameName').value,
            email: document.getElementById('email').value,
            questions: jobConfig.questions.map((_, index) => 
                document.getElementById(`question${index}`).value
            )
        };

        // Validate Discord username format
        const discordUsernameRegex = /^.+#\d{4}$/;
        if (!discordUsernameRegex.test(formData.discordUsername)) {
            Swal.fire({
                title: 'خطأ في اسم المستخدم',
                text: 'يرجى إدخال اسم مستخدم ديسكورد بالصيغة الصحيحة (مثل: User#1234)',
                icon: 'error'
            });
            return;
        }

        // Save job application
        const jobApplications = JSON.parse(localStorage.getItem('job_applications') || '[]');
        const newApplication = {
            ...formData,
            id: Date.now(),
            status: 'pending',
            submissionDate: new Date().toISOString(),
            applicantUsername: localStorage.getItem('currentUser')
        };

        jobApplications.push(newApplication);
        localStorage.setItem('job_applications', JSON.stringify(jobApplications));

        // Send notification
        addNotification(
            'طلب توظيف جديد', 
            `طلب توظيف جديد لوظيفة ${jobConfig.title}`, 
            'job_application'
        );

        // Close modal and show success message
        jobDetailsModal.hide();
        Swal.fire({
            title: 'تم إرسال الطلب',
            text: 'سيتم مراجعة طلبك من قبل الإدارة',
            icon: 'success'
        });
    }

    // Add notification function
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

    // Initial render
    renderJobCards();
});