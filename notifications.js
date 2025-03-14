document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.getElementById('notificationsList');
    const announcementsCount = document.getElementById('announcementsCount');
    const notificationBadge = document.getElementById('notificationBadge');

    // Function to update notification badge
    function updateNotificationBadge() {
        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        const unreadNotifications = notifications.filter(n => !n.read);
        
        if (notificationBadge) {
            if (unreadNotifications.length > 0) {
                notificationBadge.textContent = unreadNotifications.length;
                notificationBadge.classList.remove('d-none');
                
                // Add pulsing animation for new notifications
                notificationBadge.classList.add('animate__animated', 'animate__pulse');
            } else {
                notificationBadge.classList.add('d-none');
                notificationBadge.classList.remove('animate__animated', 'animate__pulse');
            }
        }
    }

    // Function to load and display notifications
    function loadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        
        // Clear existing notifications
        notificationsList.innerHTML = '';

        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="text-center text-white py-5">
                    <i class="fas fa-bell-slash fa-4x mb-3 text-muted"></i>
                    <p>لا توجد إشعارات جديدة</p>
                </div>
            `;
            return;
        }

        // Sort notifications by date (most recent first)
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render notifications
        notifications.forEach((notification, index) => {
            const notificationEl = document.createElement('div');
            notificationEl.classList.add(
                'notification-item', 
                'p-3', 
                'text-white', 
                'animate__animated', 
                'animate__fadeIn'
            );
            notificationEl.style.animationDelay = `${index * 0.1}s`;

            // Determine icon and color based on notification type
            const { icon, color } = getNotificationTypeDetails(notification.type);

            notificationEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="mb-0">
                        <i class="${icon} me-2 ${color}"></i>
                        ${notification.title}
                    </h5>
                    <small class="text-muted">${formatDate(notification.date)}</small>
                </div>
                <p class="mb-2">${notification.message}</p>
                <div class="text-end">
                    <button class="btn btn-sm btn-outline-light delete-notification" data-id="${notification.id}">
                        <i class="fas fa-trash me-2"></i>حذف
                    </button>
                </div>
            `;

            notificationsList.appendChild(notificationEl);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-notification').forEach(button => {
            button.addEventListener('click', handleDeleteNotification);
        });

        // Update notification badge
        updateNotificationBadge();
    }

    // Function to get notification type details
    function getNotificationTypeDetails(type) {
        const typeDetails = {
            'ticket': { icon: 'fas fa-ticket-alt', color: 'text-warning' },
            'application': { icon: 'fas fa-user-plus', color: 'text-success' },
            'update': { icon: 'fas fa-sync', color: 'text-info' },
            'announcement': { icon: 'fas fa-bullhorn', color: 'text-primary' },
            'default': { icon: 'fas fa-bell', color: 'text-secondary' }
        };

        return typeDetails[type] || typeDetails['default'];
    }

    // Function to handle deleting a single notification
    function handleDeleteNotification(e) {
        const notificationId = e.target.dataset.id;
        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        
        localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
        loadNotifications();
        updateNotificationBadge();
    }

    // Function to add a new notification
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
        
        // Update notification badge
        updateNotificationBadge();
        
        // Optional: Trigger sound or visual notification
        triggerNotificationAlert();
    }

    // Function to trigger notification alert
    function triggerNotificationAlert() {
        // Add a pulsing effect to notification badge
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            notificationBadge.classList.add('animate__animated', 'animate__pulse');
            
            // Remove animation after a short time
            setTimeout(() => {
                notificationBadge.classList.remove('animate__animated', 'animate__pulse');
            }, 2000);
        }
    }

    // Function to clear all notifications
    const clearAllBtn = document.getElementById('clearAllNotifications');
    clearAllBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'مسح جميع الإشعارات',
            text: 'هل أنت متأكد من رغبتك في مسح جميع الإشعارات؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، امسح الكل',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('userNotifications');
                loadNotifications();
                updateNotificationBadge();
            }
        });
    });

    // Utility function to format date
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

    // Initial load of notifications
    loadNotifications();
    updateNotificationBadge();

    // Expose addNotification function globally
    window.addNotification = addNotification;
});