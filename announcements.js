document.addEventListener('DOMContentLoaded', () => {
    const announcementsList = document.getElementById('announcementsList');
    const announcementsCount = document.getElementById('announcementsCount');
    const typeFilter = document.getElementById('announcementTypeFilter');
    const searchInput = document.getElementById('searchAnnouncements');
    const dateFilter = document.getElementById('announcementDateFilter');
    const backButton = document.querySelector('.back-button');

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
                <div class="col-12 text-center text-white py-5">
                    <i class="fas fa-file-alt fa-4x mb-3 text-muted"></i>
                    <p>لا توجد إعلانات حاليًا</p>
                </div>
            `;
            return;
        }

        filteredAnnouncements.forEach((announcement, index) => {
            const announcementCol = document.createElement('div');
            announcementCol.classList.add('col-md-6');
            
            // Determine type and colors
            const { badgeClass, icon } = getAnnouncementTypeDetails(announcement.type);

            announcementCol.innerHTML = `
                <div class="announcement-card animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0 text-white">${announcement.title}</h5>
                        <span class="badge ${badgeClass}">
                            <i class="${icon} me-2"></i>
                            ${getTypeLabel(announcement.type)}
                        </span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${truncateText(announcement.content, 100)}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <small class="text-muted">
                                <i class="fas fa-calendar-alt me-2"></i>
                                ${formatDate(announcement.date)}
                            </small>
                            <button class="btn btn-sm btn-outline-primary view-full-announcement" data-id="${announcement.id}">
                                اقرأ المزيد <i class="fas fa-chevron-left me-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            announcementsList.appendChild(announcementCol);
        });

        // Add event listeners for "Read More" buttons
        document.querySelectorAll('.view-full-announcement').forEach(button => {
            button.addEventListener('click', showFullAnnouncement);
        });
    }

    // Get announcement type details
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

    // Show full announcement details with enhanced modal
    function showFullAnnouncement(e) {
        const announcementId = e.target.dataset.id;
        const announcements = JSON.parse(localStorage.getItem('serverAnnouncements') || '[]');
        const announcement = announcements.find(a => a.id.toString() === announcementId);

        if (announcement) {
            const { badgeClass, icon } = getAnnouncementTypeDetails(announcement.type);

            Swal.fire({
                title: announcement.title,
                html: `
                    <div class="announcement-details text-start p-3">
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
                        <div class="announcement-footer mt-3 d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-user me-2"></i>
                                نشر بواسطة: ${announcement.author || 'المسؤول'}
                            </small>
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

    function addAnnouncementEventListeners() {
        // Existing code for type, search, and date filters
        typeFilter.addEventListener('change', () => {
            renderAnnouncements(typeFilter.value, searchInput.value, dateFilter.value);
        });

        searchInput.addEventListener('input', () => {
            renderAnnouncements(typeFilter.value, searchInput.value, dateFilter.value);
        });

        dateFilter.addEventListener('change', () => {
            renderAnnouncements(typeFilter.value, searchInput.value, dateFilter.value);
        });

        // Add listener for full announcements view
        const viewAllAnnouncementsBtn = document.querySelector('.btn-outline-light');
        if (viewAllAnnouncementsBtn) {
            viewAllAnnouncementsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'announcements.html';
            });
        }

        // Back Button Functionality
        backButton.addEventListener('click', () => {
            window.history.length > 1 ? window.history.back() : window.location.href = 'index.html';
        });

        // Initial load
        renderAnnouncements();
    }

    addAnnouncementEventListeners();
});