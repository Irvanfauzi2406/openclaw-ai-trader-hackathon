const STORAGE_KEY = 'governanceflow-state-v1';

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

const defaultState = {
  metrics: {
    tickets: 1284,
    validation: 94,
    review: 27,
    risk: 8,
    validatedMini: 148,
    needReviewMini: 12,
  },
  records: [],
  reviewQueue: [
    {
      id: 'review-1',
      asset: 'Forklift FL-12',
      note: 'Lokasi saat ini tidak sesuai dengan data approved terakhir',
      level: 'Tinggi',
      className: 'critical',
      location: 'Depot Barat',
      maintenanceType: 'Inspection'
    },
    {
      id: 'review-2',
      asset: 'Conveyor CV-08',
      note: 'Ada kemungkinan tiket duplikat dikirim dalam 2 jam yang sama',
      level: 'Sedang',
      className: 'medium',
      location: 'Line 2',
      maintenanceType: 'Preventive Maintenance'
    },
    {
      id: 'review-3',
      asset: 'Truck TR-77',
      note: 'Catatan maintenance terlalu singkat dan kurang detail penting',
      level: 'Rendah',
      className: 'low',
      location: 'Pool A',
      maintenanceType: 'Corrective Maintenance'
    }
  ],
  auditData: [
    {
      time: '14 Apr 2026 · 08:14',
      asset: 'TRK-PLT-204',
      action: 'Pengajuan Baru',
      user: 'Admin Gudang',
      status: 'Valid',
      note: 'Tiket preventive maintenance berhasil dibuat'
    },
    {
      time: '14 Apr 2026 · 08:17',
      asset: 'CV-08',
      action: 'Ditandai Berisiko',
      user: 'Sistem Validasi',
      status: 'Warning',
      note: 'Potensi duplikasi dengan issue serupa dalam 2 jam sebelumnya'
    },
    {
      time: '14 Apr 2026 · 08:23',
      asset: 'FL-12',
      action: 'Revisi Field',
      user: 'Supervisor Area',
      status: 'Revised',
      note: 'Lokasi diperbaiki ke Depot Barat setelah mismatch terdeteksi'
    },
    {
      time: '14 Apr 2026 · 08:30',
      asset: 'TR-77',
      action: 'Disetujui untuk Penjadwalan',
      user: 'Manajer Operasional',
      status: 'Approved',
      note: 'Data diterima dan diteruskan ke penjadwalan teknisi'
    }
  ]
};

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultState();
    const parsed = JSON.parse(raw);
    return {
      ...cloneDefaultState(),
      ...parsed,
      metrics: { ...cloneDefaultState().metrics, ...(parsed.metrics || {}) },
      records: Array.isArray(parsed.records) ? parsed.records : [],
      reviewQueue: Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue : cloneDefaultState().reviewQueue,
      auditData: Array.isArray(parsed.auditData) ? parsed.auditData : cloneDefaultState().auditData,
    };
  } catch {
    return cloneDefaultState();
  }
}

const state = loadState();

const els = {
  kpiTickets: document.getElementById('kpiTickets'),
  kpiValidation: document.getElementById('kpiValidation'),
  kpiReview: document.getElementById('kpiReview'),
  kpiRisk: document.getElementById('kpiRisk'),
  miniValidated: document.getElementById('miniValidated'),
  miniNeedReview: document.getElementById('miniNeedReview'),
  reviewList: document.getElementById('reviewList'),
  auditRows: document.getElementById('auditRows'),
  recordsRows: document.getElementById('recordsRows'),
  statusFilter: document.getElementById('statusFilter'),
  form: document.getElementById('maintenanceForm'),
  assetId: document.getElementById('assetId'),
  location: document.getElementById('location'),
  maintenanceType: document.getElementById('maintenanceType'),
  maintenanceDate: document.getElementById('maintenanceDate'),
  technician: document.getElementById('technician'),
  workflowStatus: document.getElementById('workflowStatus'),
  maintenanceNote: document.getElementById('maintenanceNote'),
  validationBox: document.getElementById('validationBox'),
  formFeedback: document.getElementById('formFeedback'),
  formStatusPill: document.getElementById('formStatusPill'),
  snapshotAsset: document.getElementById('snapshotAsset'),
  snapshotLocation: document.getElementById('snapshotLocation'),
  snapshotType: document.getElementById('snapshotType'),
  snapshotAlert: document.getElementById('snapshotAlert'),
  simulateClean: document.getElementById('simulateClean'),
  simulateRisk: document.getElementById('simulateRisk'),
  simulateApprove: document.getElementById('simulateApprove'),
  sendReviewer: document.getElementById('sendReviewer'),
  resetForm: document.getElementById('resetForm'),
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getNowLabel() {
  return new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace('.', ':');
}

function getStatusClass(status) {
  switch (String(status).toLowerCase()) {
    case 'valid':
    case 'approved':
      return 'badge badge-green';
    case 'warning':
      return 'badge badge-orange';
    case 'revised':
      return 'badge badge-blue';
    case 'menunggu review':
      return 'badge badge-orange';
    default:
      return 'badge';
  }
}

function setFeedback(message = '', type = '') {
  if (!els.formFeedback) return;
  els.formFeedback.textContent = message;
  els.formFeedback.className = `form-feedback${type ? ` ${type}` : ''}`;
}

function updateFormPill(text) {
  if (els.formStatusPill) els.formStatusPill.textContent = text;
}

function getFormData() {
  return {
    assetId: els.assetId.value.trim(),
    location: els.location.value.trim(),
    maintenanceType: els.maintenanceType.value,
    maintenanceDate: els.maintenanceDate.value,
    technician: els.technician.value.trim(),
    workflowStatus: els.workflowStatus.value,
    maintenanceNote: els.maintenanceNote.value.trim(),
  };
}

function validateForm(data) {
  const messages = [];
  const normalizedAsset = data.assetId.toUpperCase();
  const normalizedLocation = data.location.toLowerCase();
  const normalizedNote = data.maintenanceNote.toLowerCase();

  if (!data.assetId || !data.location || !data.maintenanceType || !data.maintenanceDate || !data.technician || !data.maintenanceNote) {
    messages.push({ type: 'error', text: 'Lengkapi semua field wajib sebelum menyimpan.' });
  }

  if (data.assetId && !/^[A-Za-z0-9-]{5,}$/.test(data.assetId)) {
    messages.push({ type: 'warn', text: 'Format ID aset terlihat tidak standar.' });
  } else if (data.assetId) {
    messages.push({ type: 'ok', text: 'ID aset memenuhi format dasar.' });
  }

  const duplicate = state.records.find(record => record.assetId.toUpperCase() === normalizedAsset && record.maintenanceDate === data.maintenanceDate);
  if (duplicate) {
    messages.push({ type: 'warn', text: 'Kemungkinan duplikasi: aset ini sudah pernah disimpan di tanggal yang sama.' });
  }

  if (normalizedLocation && (normalizedLocation.includes('unknown') || normalizedLocation.length < 4)) {
    messages.push({ type: 'warn', text: 'Lokasi perlu dibuat lebih spesifik agar mudah diaudit.' });
  } else if (data.location) {
    messages.push({ type: 'ok', text: 'Lokasi terisi cukup jelas.' });
  }

  if (data.maintenanceNote && data.maintenanceNote.length < 24) {
    messages.push({ type: 'warn', text: 'Catatan maintenance terlalu singkat dan berisiko kurang informatif.' });
  } else if (data.maintenanceNote) {
    messages.push({ type: 'ok', text: 'Catatan cukup detail untuk review awal.' });
  }

  if (normalizedNote.includes('urgent') || normalizedNote.includes('abnormal') || normalizedNote.includes('critical')) {
    messages.push({ type: 'warn', text: 'Catatan mengandung indikasi risiko, pertimbangkan kirim ke reviewer.' });
  }

  return messages;
}

function renderValidation(messages) {
  if (!els.validationBox) return;
  els.validationBox.innerHTML = '';

  if (!messages.length) {
    els.validationBox.innerHTML = '<div class="validation-item">Isi form untuk melihat hasil validasi.</div>';
    return;
  }

  messages.forEach(message => {
    const div = document.createElement('div');
    const cls = message.type === 'ok' ? 'ok' : message.type === 'warn' ? 'warn' : 'error';
    div.className = `validation-item ${cls}`;
    div.textContent = message.text;
    els.validationBox.appendChild(div);
  });
}

function updateSnapshot(data, messages) {
  if (els.snapshotAsset) els.snapshotAsset.textContent = data.assetId || 'TRK-PLT-204';
  if (els.snapshotLocation) els.snapshotLocation.textContent = data.location || 'Warehouse Bekasi 2';
  if (els.snapshotType) els.snapshotType.textContent = data.maintenanceType || 'Preventive';
  if (els.snapshotAlert) {
    const summary = messages.slice(0, 3).map(msg => {
      if (msg.type === 'ok') return `✓ ${msg.text}`;
      if (msg.type === 'warn') return `⚠ ${msg.text}`;
      return `✕ ${msg.text}`;
    });
    els.snapshotAlert.textContent = summary.length ? summary.join(' · ') : 'Isi form untuk melihat hasil validasi.';
  }
}

function renderKpis() {
  if (els.kpiTickets) els.kpiTickets.textContent = state.metrics.tickets.toLocaleString('id-ID');
  if (els.kpiValidation) els.kpiValidation.textContent = `${state.metrics.validation}%`;
  if (els.kpiReview) els.kpiReview.textContent = state.metrics.review;
  if (els.kpiRisk) els.kpiRisk.textContent = state.metrics.risk;
  if (els.miniValidated) els.miniValidated.textContent = state.metrics.validatedMini;
  if (els.miniNeedReview) els.miniNeedReview.textContent = state.metrics.needReviewMini;
}

function renderReviewQueue() {
  if (!els.reviewList) return;
  els.reviewList.innerHTML = '';

  if (!state.reviewQueue.length) {
    els.reviewList.innerHTML = '<div class="empty-state">Tidak ada item review. Antrian sedang bersih.</div>';
    return;
  }

  state.reviewQueue.forEach(item => {
    const div = document.createElement('div');
    div.className = `review-item ${item.className}`;
    div.innerHTML = `
      <div class="review-main">
        <strong>${item.asset}</strong>
        <p>${item.note}</p>
        <small>${item.location || '-'} · ${item.maintenanceType || '-'}</small>
      </div>
      <div class="review-side">
        <span>${item.level}</span>
        <div class="review-actions-inline">
          <button type="button" class="small-btn approve-btn" data-action="approve" data-id="${item.id}">Setujui</button>
          <button type="button" class="small-btn revise-btn" data-action="revise" data-id="${item.id}">Minta Revisi</button>
          <button type="button" class="small-btn risk-btn" data-action="risk" data-id="${item.id}">Tandai Risiko</button>
        </div>
      </div>
    `;
    els.reviewList.appendChild(div);
  });
}

function renderRecordsTable() {
  if (!els.recordsRows) return;
  const selectedStatus = els.statusFilter?.value || 'Semua';
  const records = selectedStatus === 'Semua'
    ? state.records
    : state.records.filter(record => record.status === selectedStatus);

  els.recordsRows.innerHTML = '';

  if (!records.length) {
    els.recordsRows.innerHTML = `<tr><td colspan="7" class="empty-table">Belum ada data yang cocok dengan filter yang dipilih.</td></tr>`;
    return;
  }

  records.forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${record.assetId}</strong></td>
      <td>${record.location}</td>
      <td>${record.maintenanceType}</td>
      <td>${record.maintenanceDate || '-'}</td>
      <td>${record.technician}</td>
      <td><span class="${getStatusClass(record.status)}">${record.status}</span></td>
      <td>${record.maintenanceNote}</td>
    `;
    els.recordsRows.appendChild(tr);
  });
}

function renderAuditTable() {
  if (!els.auditRows) return;
  els.auditRows.innerHTML = '';

  state.auditData.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.time}</td>
      <td><strong>${item.asset}</strong></td>
      <td>${item.action}</td>
      <td>${item.user}</td>
      <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
      <td>${item.note}</td>
    `;
    els.auditRows.appendChild(tr);
  });
}

function prependAuditRow(row) {
  state.auditData.unshift(row);
  state.auditData = state.auditData.slice(0, 30);
}

function persistAndRender() {
  saveState();
  renderKpis();
  renderReviewQueue();
  renderRecordsTable();
  renderAuditTable();
}

function recalculateValidation() {
  const cleanRecords = state.records.filter(record => record.status === 'Valid' || record.status === 'Approved').length;
  const total = Math.max(1, state.metrics.tickets);
  const computed = Math.round((cleanRecords / total) * 100);
  state.metrics.validation = Math.max(70, Math.min(99, computed || state.metrics.validation));
}

function createRecord(data, mode) {
  const messages = validateForm(data);
  const hasBlockingError = messages.some(message => message.type === 'error');
  renderValidation(messages);
  updateSnapshot(data, messages);

  if (hasBlockingError) {
    setFeedback('Form belum bisa diproses. Cek field wajib yang masih kosong.', 'error');
    updateFormPill('Validasi Error');
    return null;
  }

  const duplicateWarn = messages.some(message => message.text.includes('duplikasi'));
  const riskWarn = messages.some(message => message.type === 'warn');

  const record = {
    id: `rec-${Date.now()}`,
    ...data,
    submittedAt: getNowLabel(),
    status: mode === 'review' ? 'Menunggu Review' : duplicateWarn || riskWarn ? 'Warning' : 'Valid',
  };

  state.records.unshift(record);
  state.metrics.tickets += 1;

  if (record.status === 'Valid') {
    state.metrics.validatedMini += 1;
  }

  if (mode === 'review' || record.status === 'Warning') {
    state.metrics.review += 1;
    state.metrics.needReviewMini += 1;
    if (record.status === 'Warning') state.metrics.risk += 1;

    state.reviewQueue.unshift({
      id: `queue-${record.id}`,
      asset: record.assetId,
      note: record.maintenanceNote,
      level: record.status === 'Warning' ? 'Tinggi' : 'Sedang',
      className: record.status === 'Warning' ? 'critical' : 'medium',
      location: record.location,
      maintenanceType: record.maintenanceType,
      sourceRecordId: record.id,
    });
  }

  prependAuditRow({
    time: record.submittedAt,
    asset: record.assetId,
    action: mode === 'review' ? 'Dikirim ke Reviewer' : 'Data Disimpan',
    user: record.technician,
    status: record.status,
    note: mode === 'review' ? 'Data diarahkan ke antrian review untuk keputusan supervisor' : 'Data disimpan di browser secara lokal'
  });

  recalculateValidation();
  persistAndRender();

  setFeedback(mode === 'review' ? 'Data berhasil dikirim ke reviewer.' : 'Data berhasil disimpan di browser.', 'success');
  updateFormPill(mode === 'review' ? 'Terkirim ke Reviewer' : 'Tersimpan Lokal');
  return record;
}

function resetFormState() {
  if (els.form) els.form.reset();
  if (els.workflowStatus) els.workflowStatus.value = 'Menunggu Approval';
  renderValidation([]);
  updateSnapshot({}, []);
  setFeedback('');
  updateFormPill('Siap Diisi');
}

function processQueueAction(action, id) {
  const index = state.reviewQueue.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = state.reviewQueue[index];
  const relatedRecord = state.records.find(record => item.sourceRecordId && record.id === item.sourceRecordId);

  if (action === 'approve') {
    state.reviewQueue.splice(index, 1);
    state.metrics.review = Math.max(0, state.metrics.review - 1);
    state.metrics.needReviewMini = Math.max(0, state.metrics.needReviewMini - 1);
    if (item.className === 'critical') state.metrics.risk = Math.max(0, state.metrics.risk - 1);
    if (relatedRecord) relatedRecord.status = 'Approved';
    prependAuditRow({
      time: getNowLabel(),
      asset: item.asset,
      action: 'Disetujui Reviewer',
      user: 'Supervisor Demo',
      status: 'Approved',
      note: 'Data disetujui dan siap diteruskan ke penjadwalan'
    });
    setFeedback(`${item.asset} berhasil disetujui.`, 'success');
  }

  if (action === 'revise') {
    state.reviewQueue[index].level = 'Sedang';
    state.reviewQueue[index].className = 'medium';
    state.reviewQueue[index].note = `Perlu revisi: ${item.note}`;
    if (relatedRecord) relatedRecord.status = 'Revised';
    prependAuditRow({
      time: getNowLabel(),
      asset: item.asset,
      action: 'Diminta Revisi',
      user: 'Supervisor Demo',
      status: 'Revised',
      note: 'Supervisor meminta klarifikasi tambahan sebelum approval'
    });
    setFeedback(`${item.asset} diminta revisi.`, 'warn');
  }

  if (action === 'risk') {
    state.reviewQueue[index].level = 'Tinggi';
    state.reviewQueue[index].className = 'critical';
    state.reviewQueue[index].note = `Risiko ditingkatkan: ${item.note}`;
    state.metrics.risk += 1;
    if (relatedRecord) relatedRecord.status = 'Warning';
    prependAuditRow({
      time: getNowLabel(),
      asset: item.asset,
      action: 'Risiko Dinaikkan',
      user: 'Supervisor Demo',
      status: 'Warning',
      note: 'Data dinaikkan menjadi high risk untuk perhatian manajemen'
    });
    setFeedback(`${item.asset} ditandai sebagai risiko tinggi.`, 'warn');
  }

  recalculateValidation();
  persistAndRender();
}

function bindFormEvents() {
  const watchedInputs = [
    els.assetId,
    els.location,
    els.maintenanceType,
    els.maintenanceDate,
    els.technician,
    els.workflowStatus,
    els.maintenanceNote,
  ].filter(Boolean);

  watchedInputs.forEach(input => {
    input.addEventListener('input', () => {
      const data = getFormData();
      const messages = validateForm(data);
      renderValidation(messages);
      updateSnapshot(data, messages);
      updateFormPill('Sedang Diedit');
    });
  });

  els.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    createRecord(getFormData(), 'save');
  });

  els.sendReviewer?.addEventListener('click', () => {
    createRecord(getFormData(), 'review');
  });

  els.resetForm?.addEventListener('click', () => {
    resetFormState();
  });

  els.statusFilter?.addEventListener('change', () => {
    renderRecordsTable();
  });
}

function bindDemoButtons() {
  els.simulateClean?.addEventListener('click', () => {
    const record = {
      assetId: `SIM-${state.metrics.tickets + 1}`,
      location: 'Gudang Demo A',
      maintenanceType: 'Inspection',
      maintenanceDate: new Date().toISOString().slice(0, 10),
      technician: 'Pengguna Demo',
      workflowStatus: 'Draft',
      maintenanceNote: 'Pemeriksaan rutin selesai dilakukan dengan detail lengkap dan format yang sesuai.'
    };
    createRecord(record, 'save');
  });

  els.simulateRisk?.addEventListener('click', () => {
    const record = {
      assetId: `RISK-${state.metrics.tickets + 1}`,
      location: 'Unknown',
      maintenanceType: 'Emergency Repair',
      maintenanceDate: new Date().toISOString().slice(0, 10),
      technician: 'Sistem Validasi',
      workflowStatus: 'Sedang Direview',
      maintenanceNote: 'Critical abnormal vibration detected. urgent repeat abnormal issue.'
    };
    createRecord(record, 'review');
  });

  els.simulateApprove?.addEventListener('click', () => {
    if (!state.reviewQueue.length) {
      setFeedback('Tidak ada item review untuk disetujui.', 'warn');
      return;
    }
    processQueueAction('approve', state.reviewQueue[0].id);
  });
}

els.reviewList?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  processQueueAction(button.dataset.action, button.dataset.id);
});

bindFormEvents();
bindDemoButtons();
persistAndRender();
renderValidation([]);
updateSnapshot({}, []);

const revealItems = document.querySelectorAll('.issue-card, .kpi-card, .card, .table-card, .summary-card, .impact-card, .demo-toolbar, .records-toolbar');

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