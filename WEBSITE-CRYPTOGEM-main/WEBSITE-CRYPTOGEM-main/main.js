const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
});

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

const auditData = [
  {
    time: '14 Apr 2026 · 08:14',
    asset: 'TRK-PLT-204',
    action: 'Input Baru',
    user: 'Admin Gudang',
    status: 'Valid',
    note: 'Tiket preventive berhasil dibuat'
  },
  {
    time: '14 Apr 2026 · 08:17',
    asset: 'CV-08',
    action: 'Butuh Review',
    user: 'System',
    status: 'Warning',
    note: 'Terdeteksi kemungkinan duplikat'
  },
  {
    time: '14 Apr 2026 · 08:23',
    asset: 'FL-12',
    action: 'Revisi Lokasi',
    user: 'Supervisor Area',
    status: 'Revisi',
    note: 'Lokasi diperbaiki ke Depot Barat'
  },
  {
    time: '14 Apr 2026 · 08:30',
    asset: 'TR-77',
    action: 'Approval',
    user: 'Manager Operasional',
    status: 'Approved',
    note: 'Siap dijadwalkan untuk teknisi'
  },
  {
    time: '14 Apr 2026 · 08:44',
    asset: 'MC-11',
    action: 'Catatan Ditambah',
    user: 'Teknisi Lapangan',
    status: 'Updated',
    note: 'Tambah detail suara abnormal pada motor'
  }
];

const auditRows = document.getElementById('auditRows');

function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'valid':
    case 'approved':
      return 'badge badge-green';
    case 'warning':
      return 'badge badge-orange';
    case 'revisi':
    case 'updated':
      return 'badge badge-blue';
    default:
      return 'badge';
  }
}

if (auditRows) {
  auditData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.time}</td>
      <td><strong>${item.asset}</strong></td>
      <td>${item.action}</td>
      <td>${item.user}</td>
      <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
      <td>${item.note}</td>
    `;
    auditRows.appendChild(tr);
  });
}

const revealItems = document.querySelectorAll('.issue-card, .kpi-card, .card, .workflow-card, .table-card, .summary-card');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach(item => {
  item.classList.add('reveal');
  revealObserver.observe(item);
});