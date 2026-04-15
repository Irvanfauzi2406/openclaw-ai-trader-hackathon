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

const state = {
  tickets: 1284,
  validation: 94,
  review: 27,
  risk: 8,
};

const kpiTickets = document.getElementById('kpiTickets');
const kpiValidation = document.getElementById('kpiValidation');
const kpiReview = document.getElementById('kpiReview');
const kpiRisk = document.getElementById('kpiRisk');
const reviewList = document.getElementById('reviewList');
const auditRows = document.getElementById('auditRows');

const reviewQueueData = [
  {
    asset: 'Forklift FL-12',
    note: 'Current location does not match last approved record',
    level: 'High',
    className: 'critical'
  },
  {
    asset: 'Conveyor CV-08',
    note: 'Possible duplicate ticket submitted within 2 hours',
    level: 'Medium',
    className: 'medium'
  },
  {
    asset: 'Truck TR-77',
    note: 'Maintenance note too short and missing key detail',
    level: 'Low',
    className: 'low'
  }
];

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

function renderKpis() {
  if (kpiTickets) kpiTickets.textContent = state.tickets.toLocaleString();
  if (kpiValidation) kpiValidation.textContent = `${state.validation}%`;
  if (kpiReview) kpiReview.textContent = state.review;
  if (kpiRisk) kpiRisk.textContent = state.risk;
}

function renderReviewQueue() {
  if (!reviewList) return;
  reviewList.innerHTML = '';

  reviewQueueData.forEach(item => {
    const div = document.createElement('div');
    div.className = `review-item ${item.className}`;
    div.innerHTML = `
      <div>
        <strong>${item.asset}</strong>
        <p>${item.note}</p>
      </div>
      <span>${item.level}</span>
    `;
    reviewList.appendChild(div);
  });
}

function renderAuditTable() {
  if (!auditRows) return;
  auditRows.innerHTML = '';

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

function getNowLabel() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', ' ·');
}

function prependAuditRow(row) {
  auditData.unshift(row);
  renderAuditTable();
}

document.getElementById('simulateClean')?.addEventListener('click', () => {
  state.tickets += 1;
  state.validation = Math.min(99, state.validation + 1);
  renderKpis();

  prependAuditRow({
    time: getNowLabel(),
    asset: 'WH-NEW-21',
    action: 'Clean Submission',
    user: 'Demo User',
    status: 'Valid',
    note: 'New maintenance record passed validation without issues'
  });
});

document.getElementById('simulateRisk')?.addEventListener('click', () => {
  state.tickets += 1;
  state.review += 1;
  state.risk += 1;
  state.validation = Math.max(85, state.validation - 1);

  reviewQueueData.unshift({
    asset: `Asset RK-${state.tickets}`,
    note: 'AI detected inconsistent location and repeated issue pattern',
    level: 'High',
    className: 'critical'
  });

  renderKpis();
  renderReviewQueue();

  prependAuditRow({
    time: getNowLabel(),
    asset: `RK-${state.tickets}`,
    action: 'Risk Flagged',
    user: 'System AI Check',
    status: 'Warning',
    note: 'Submission moved to review queue due to anomaly detection'
  });
});

document.getElementById('simulateApprove')?.addEventListener('click', () => {
  if (reviewQueueData.length > 0) {
    const approved = reviewQueueData.shift();
    state.review = Math.max(0, state.review - 1);
    state.validation = Math.min(99, state.validation + 1);
    renderReviewQueue();
    renderKpis();

    prependAuditRow({
      time: getNowLabel(),
      asset: approved.asset,
      action: 'Approved by Reviewer',
      user: 'Supervisor Demo',
      status: 'Approved',
      note: 'Flag reviewed and record approved for scheduling'
    });
  }
});

renderKpis();
renderReviewQueue();
renderAuditTable();

const revealItems = document.querySelectorAll('.issue-card, .kpi-card, .card, .workflow-card, .table-card, .summary-card, .impact-card, .demo-toolbar');

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