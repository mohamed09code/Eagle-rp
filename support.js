document.addEventListener('DOMContentLoaded', () => {
    const newTicketBtn = document.getElementById('newTicketBtn');
    const newTicketForm = document.getElementById('newTicketForm');
    const supportForm = document.getElementById('supportForm');
    const ticketsList = document.getElementById('ticketsList');

    // Function to save support ticket details
    function saveSupportTicket(ticketData) {
        const supportTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        
        const newTicket = {
            id: Date.now(),
            ...ticketData,
            status: 'processing',
            createdAt: new Date().toISOString()
        };

        supportTickets.push(newTicket);
        localStorage.setItem('supportTickets', JSON.stringify(supportTickets));

        return newTicket;
    }

    // Load tickets from localStorage
    function loadTickets() {
        const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
        ticketsList.innerHTML = '';
        
        tickets.forEach((ticket, index) => {
            const ticketEl = document.createElement('div');
            ticketEl.classList.add('list-group-item', 'list-group-item-action');
            
            let statusClass = '';
            let statusText = '';
            switch(ticket.status) {
                case 'processing':
                    statusClass = 'text-warning';
                    statusText = 'قيد المعالجة';
                    break;
                case 'resolved':
                    statusClass = 'text-success';
                    statusText = 'تم الحل';
                    break;
                case 'rejected':
                    statusClass = 'text-danger';
                    statusText = 'مرفوض';
                    break;
                default:
                    statusClass = 'text-secondary';
                    statusText = 'جديد';
            }

            ticketEl.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${ticket.issueType}</h5>
                    <small class="${statusClass}">${statusText}</small>
                </div>
                <p class="mb-1">${ticket.playerName} - ${ticket.issueDetails.substring(0, 50)}...</p>
            `;

            ticketsList.appendChild(ticketEl);
        });
    }

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

    // Toggle new ticket form
    newTicketBtn.addEventListener('click', () => {
        newTicketForm.classList.toggle('d-none');
    });

    // Submit support ticket
    supportForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const playerName = document.getElementById('playerName').value;
        const discordLink = document.getElementById('discordLink').value;
        const issueType = document.getElementById('issueType').value;
        const issueDetails = document.getElementById('issueDetails').value;

        const ticketData = {
            playerName,
            discordLink,
            issueType,
            issueDetails
        };

        // Validate ticket data
        if (!validateTicket(ticketData)) return;

        // Save ticket and show confirmation
        const newTicket = saveSupportTicket(ticketData);

        // Show success message
        Swal.fire({
            title: 'تم إرسال التذكرة',
            text: 'سيتم الرد عليك قريبًا',
            icon: 'success',
            confirmButtonText: 'حسنًا'
        });

        // Reset form and hide
        supportForm.reset();
        newTicketForm.classList.add('d-none');

        // Reload tickets
        loadTickets();

        // Add notification for admin dashboard
        addNotification(
            'تذكرة دعم جديدة', 
            `تم إرسال تذكرة جديدة من ${playerName} - ${issueType}`, 
            'ticket'
        );
    });

    // Ticket validation function
    function validateTicket(data) {
        for (let key in data) {
            if (!data[key] || data[key].trim() === '') {
                Swal.fire('خطأ', 'يرجى ملء جميع الحقول', 'error');
                return false;
            }
        }
        return true;
    }

    // Call back button creation
    createBackButton();

    // Initial tickets load
    loadTickets();
});