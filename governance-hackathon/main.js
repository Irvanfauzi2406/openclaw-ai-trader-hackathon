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
    action: 'New Submission',
    user: 'Warehouse Admin',
    status: 'Valid',
    note: 'Preventive maintenance ticket created successfully'
  },
  {
    time: '14 Apr 2026 · 08:17',
    asset: 'CV-08',
    action: 'Risk Flagged',
    user: 'System AI Check',
    status: 'Warning',
    note: 'Potential duplicate with similar issue reported 2 hours earlier'
  },
  {
    time: '14 Apr 2026 · 08:23',
    asset: 'FL-12',
    action: 'Field Revision',
    user: 'Area Supervisor',
    status: 'Revised',
    note: 'Location corrected to West Depot after mismatch detected'
  },
  {
    time: '14 Apr 2026 · 08:30',
    asset: 'TR-77',
    action: 'Approved for Scheduling',
    user: 'Operations Manager',
    status: 'Approved',
    note: 'Record accepted and forwarded for technician scheduling'
  },
  {
    time: '14 Apr 2026 · 08:44',
    asset: 'MC-11',
    action: 'Additional Note Added',
    user: 'Field Technician',
    status: 'Updated',
    note: 'Added abnormal motor noise detail for future traceability'
  },
  {
    time: '14 Apr 2026 · 09:02',
    asset: 'CR-03',
    action: 'Escalated',
    user: 'System AI Check',
    status: 'Warning',
    note: 'Repeated issue pattern detected across 3 recent maintenance cycles'
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
    case 'revised':
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

const revealItems = document.querySelectorAll('.issue-card, .kpi-card, .card, .workflow-card, .table-card, .summary-card, .impact-card');

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