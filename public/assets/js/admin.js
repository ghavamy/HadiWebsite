// ✅ Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// ✅ Close sidebar on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// ✅ Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const subject = this.dataset.subject;
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + subject).classList.add('active');
    });
});

// ✅ Section toggle
function toggleSection(header) {
    const body = header.nextElementSibling;
    const icon = header.querySelector('.fa-chevron-down');
    body.classList.toggle('open');
    icon.classList.toggle('rotated');
}

// ✅ Open first section by default
document.addEventListener('DOMContentLoaded', function() {
    const firstSection = document.querySelector('.section-header');
    if (firstSection) {
        const body = firstSection.nextElementSibling;
        const icon = firstSection.querySelector('.fa-chevron-down');
        body.classList.add('open');
        icon.classList.add('rotated');
    }
});