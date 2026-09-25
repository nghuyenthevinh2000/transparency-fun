/**
 * donation-timeline script.js
 * Method 2: Synchronized Interactive Timeline Bar (Playable Chronological Flow)
 * Uses standardized dataset from '../data/foster-relief/v1/foster_data.js'
 * Follows Open notebook design system (DESIGN.md)
 */

import { FOSTER_DATA } from '../data/foster-relief/v1/foster_data.js';
import { initSoundToggle } from '../../sound.js';

initSoundToggle();

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
const formatShortVND = (num) => {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M ₫`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}k ₫`;
  return `${num} ₫`;
};

const CYCLES = FOSTER_DATA.cycles;

// Playback state
let currentIndex = 0;
let isPlaying = false;
let playTimer = null;
let playSpeed = 1200; // ms
let currentMode = 'discrete'; // 'discrete' or 'cumulative'
let selectedDistrict = 'all';

function init() {
  renderTimelinePips();
  setupEventListeners();
  updateView();
}

function renderTimelinePips() {
  const container = document.getElementById('timeline-pips');
  container.innerHTML = '';
  CYCLES.forEach((c, idx) => {
    const pip = document.createElement('div');
    pip.className = `timeline-pip ${idx === currentIndex ? 'is-active' : ''} ${idx < currentIndex ? 'is-past' : ''}`;
    pip.title = `${c.label} (${c.code}) - ${c.foster_count} trạm foster`;
    pip.addEventListener('click', () => {
      seekTo(idx);
    });
    container.appendChild(pip);
  });
}

function setupEventListeners() {
  // Play / Pause Button
  const playBtn = document.getElementById('play-btn');
  playBtn.addEventListener('click', togglePlay);

  // Prev / Next Buttons
  document.getElementById('prev-btn').addEventListener('click', () => {
    pause();
    if (currentIndex > 0) seekTo(currentIndex - 1);
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    pause();
    if (currentIndex < CYCLES.length - 1) seekTo(currentIndex + 1);
  });

  // Mode Buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentMode = btn.dataset.mode;
      document.getElementById('active-mode-label').textContent = btn.textContent;
      updateView();
    });
  });

  // Speed Buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      playSpeed = parseInt(btn.dataset.speed, 10);
      document.getElementById('active-speed-label').textContent = btn.textContent;
      if (isPlaying) {
        clearInterval(playTimer);
        playTimer = setInterval(stepNext, playSpeed);
      }
    });
  });

  // District Filter
  document.querySelectorAll('.district-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.district-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedDistrict = btn.dataset.district;
      document.getElementById('active-district-label').textContent = btn.textContent;
      updateView();
    });
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowLeft') {
      pause();
      if (currentIndex > 0) seekTo(currentIndex - 1);
    } else if (e.code === 'ArrowRight') {
      pause();
      if (currentIndex < CYCLES.length - 1) seekTo(currentIndex + 1);
    }
  });
}

function togglePlay() {
  if (isPlaying) {
    pause();
  } else {
    play();
  }
}

function play() {
  isPlaying = true;
  const btn = document.getElementById('play-btn');
  btn.textContent = '⏸ PAUSE';
  btn.classList.add('is-playing');
  document.getElementById('playback-status-label').textContent = `PLAYING (${currentIndex + 1}/${CYCLES.length})`;

  // If at end, loop to beginning
  if (currentIndex >= CYCLES.length - 1) {
    currentIndex = 0;
    updateView();
  }

  playTimer = setInterval(stepNext, playSpeed);
}

function pause() {
  isPlaying = false;
  clearInterval(playTimer);
  const btn = document.getElementById('play-btn');
  btn.textContent = '▶ PLAY';
  btn.classList.remove('is-playing');
  document.getElementById('playback-status-label').textContent = `PAUSED (CYCLE ${currentIndex + 1}/${CYCLES.length})`;
}

function stepNext() {
  if (currentIndex < CYCLES.length - 1) {
    currentIndex++;
    updateView();
  } else {
    pause();
  }
}

function seekTo(index) {
  currentIndex = index;
  updateView();
}

function updateView() {
  const currentCycle = CYCLES[currentIndex];

  // Update Scrubber Track UI
  const progressPct = (currentIndex / (CYCLES.length - 1)) * 100;
  document.getElementById('timeline-progress-fill').style.width = `${progressPct}%`;
  document.getElementById('timeline-current-date').textContent = `CYCLE ${String(currentIndex + 1).padStart(2, '0')} · ${currentCycle.label}`;

  // Update Pips Active Status
  const pips = document.querySelectorAll('.timeline-pip');
  pips.forEach((p, idx) => {
    p.classList.remove('is-active', 'is-past');
    if (idx === currentIndex) p.classList.add('is-active');
    else if (idx < currentIndex) p.classList.add('is-past');
  });

  // Calculate Cumulative vs Discrete
  let displaySpending = currentCycle.used_fund;
  let displayFostersCount = currentCycle.foster_count;
  if (currentMode === 'cumulative') {
    displaySpending = CYCLES.slice(0, currentIndex + 1).reduce((acc, c) => acc + c.used_fund, 0);
    const uniqueShelters = new Set();
    CYCLES.slice(0, currentIndex + 1).forEach(c => c.fosters.forEach(f => uniqueShelters.add(f.name)));
    displayFostersCount = uniqueShelters.size;
  }

  // Update Header KPIs
  document.getElementById('kpi-cycle').textContent = currentCycle.label;
  document.getElementById('kpi-spending').textContent = formatVND(displaySpending);
  document.getElementById('kpi-fosters').textContent = `${displayFostersCount} Trạm Foster`;

  // Update Event Banner
  const bannerText = document.getElementById('event-text');
  bannerText.textContent = currentCycle.sponsor_notes || 'Phêrô Nguyễn tài trợ 100% chi phí vận chuyển toàn bộ các phần quà trong đợt này.';

  // Render 4-Stage Flow Columns
  renderStage1Donors(currentCycle);
  renderStage2Fund(currentCycle);
  renderStage3Supplies(currentCycle);
  renderStage4Fosters(currentCycle);

  // Update Inspector Drawer
  renderInspectorInvoice(currentCycle);
}

function renderStage1Donors(currentCycle) {
  const container = document.getElementById('stage-donor-cards');
  container.innerHTML = '';

  const activeYear = currentCycle.year;

  const allDonors = Object.entries(FOSTER_DATA.donors_summary)
    .map(([name, info]) => {
      const yearRecords = FOSTER_DATA.donors_records.filter(r => r.donor === name && r.year === activeYear);
      const yearAmt = yearRecords.reduce((acc, r) => acc + r.amount, 0);
      const yearCount = yearRecords.length;
      const isYearActive = info.years.includes(activeYear);
      const yearInKind = yearRecords.filter(r => r.in_kind).map(r => r.in_kind);

      return {
        name,
        amt: isYearActive ? yearAmt : info.total_amount,
        count: isYearActive ? yearCount : info.count,
        lifetimeAmt: info.total_amount,
        lifetimeCount: info.count,
        years: info.years,
        isYearActive,
        inKind: yearInKind.length ? yearInKind.join(', ') : (info.in_kind && info.in_kind.length ? info.in_kind.join(', ') : null)
      };
    })
    .sort((a, b) => {
      if (a.isYearActive !== b.isYearActive) return b.isYearActive ? 1 : -1;
      return b.amt - a.amt || b.count - a.count;
    });

  allDonors.forEach(d => {
    const card = document.createElement('div');
    card.className = `node-card ${d.isYearActive ? 'is-active' : 'is-dimmed'}`;
    const displayAmt = d.isYearActive
      ? (d.amt > 0 ? formatShortVND(d.amt) : 'Tài trợ hiện vật')
      : formatShortVND(d.lifetimeAmt);

    card.innerHTML = `
      <span class="node-name">${d.name}</span>
      <div class="node-sub">
        <span class="node-highlight">${displayAmt}</span>
        <span>${d.count} lượt</span>
      </div>
      <span class="badge-tag">${d.inKind ? d.inKind : (d.isYearActive ? 'Đồng hành ' + activeYear : 'Bảo trợ ' + d.years.join(', '))}</span>
    `;
    card.addEventListener('click', () => inspectDonor(d, activeYear));
    container.appendChild(card);
  });
}

function inspectDonor(donor, activeYear) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');

  title.textContent = `Chi Tiết Ân Nhân: ${donor.name}`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Hồ Sơ Đóng Góp</h5>
      <ul>
        <li><span>Danh xưng hảo tâm</span><strong>${donor.name}</strong></li>
        <li><span>Lượt ủng hộ năm ${activeYear}</span><strong>${donor.isYearActive ? donor.count + ' lần' : 'Không có trong ' + activeYear}</strong></li>
        <li><span>Tiền ủng hộ năm ${activeYear}</span><strong style="color:var(--orange)">${donor.isYearActive ? (donor.amt > 0 ? formatVND(donor.amt) : 'Tài trợ hiện vật') : '0 ₫'}</strong></li>
        <li><span>Tổng lũy kế 3 năm</span><strong>${formatVND(donor.lifetimeAmt)} (${donor.lifetimeCount} lần)</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Hình Thức & Giai Đoạn</h5>
      <ul>
        <li><span>Các năm đồng hành</span><strong>${donor.years.join(', ')}</strong></li>
        <li><span>Hiện vật / Đóng góp đặc biệt</span><strong>${donor.inKind || 'Đóng góp tịnh tài mua sắm hạt & pate'}</strong></li>
      </ul>
    </div>
  `;
}

function renderStage2Fund(cycle) {
  const container = document.getElementById('stage-fund-cards');
  container.innerHTML = '';

  const fundCards = [
    { name: 'Xuất quỹ mua đồ ăn', amt: formatVND(cycle.used_fund), tag: '100% tiền quỹ' },
    { name: 'Admin bù thâm hụt', amt: cycle.admin_topup > 0 ? formatVND(cycle.admin_topup) : '0 ₫ (Đủ quỹ)', tag: cycle.admin_topup > 0 ? 'Admin tự bỏ tiền túi' : 'Không thâm hụt' },
    { name: 'Hỗ trợ vận chuyển', amt: '0 ₫ (Miễn phí)', tag: 'Phêrô Nguyễn bao 100% ship' }
  ];

  fundCards.forEach(f => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    card.innerHTML = `
      <span class="node-name">${f.name}</span>
      <div class="node-sub">
        <span class="node-highlight">${f.amt}</span>
      </div>
      <span class="badge-tag">${f.tag}</span>
    `;
    container.appendChild(card);
  });
}

function renderStage3Supplies(cycle) {
  const container = document.getElementById('stage-provision-cards');
  container.innerHTML = '';

  if (!cycle.supplies || cycle.supplies.length === 0) {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    card.innerHTML = `<span class="node-name">${cycle.supplies_per_gift || 'Khẩu phần dinh dưỡng'}</span>`;
    container.appendChild(card);
    return;
  }

  cycle.supplies.forEach(s => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    const costStr = s.unit_price ? formatShortVND(s.unit_price) : formatShortVND(cycle.used_fund);
    const qtyStr = s.total_cost ? `${s.total_cost} phần quà` : (cycle.supplies_per_gift || 'Khẩu phần sỉ');
    card.innerHTML = `
      <span class="node-name">${s.item}</span>
      <div class="node-sub">
        <span class="node-highlight">${costStr}</span>
        <span>${qtyStr}</span>
      </div>
      <span class="badge-tag">Giá sỉ cứu trợ đợt ${cycle.label}</span>
    `;
    container.appendChild(card);
  });
}

function renderStage4Fosters(cycle) {
  const container = document.getElementById('stage-foster-cards');
  container.innerHTML = '';

  const isCumulative = currentMode === 'cumulative';

  let fosters = [];
  if (isCumulative) {
    const pastCycles = CYCLES.slice(0, currentIndex + 1);
    const fosterMap = {};
    pastCycles.forEach(c => {
      c.fosters.forEach(f => {
        if (selectedDistrict !== 'all' && f.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
          return;
        }
        if (!fosterMap[f.name]) {
          fosterMap[f.name] = {
            name: f.name,
            district: f.district,
            portions: 0,
            cyclesCount: 0,
            drive_stt: f.drive_stt,
            note: f.note
          };
        }
        fosterMap[f.name].portions += f.portions;
        fosterMap[f.name].cyclesCount += 1;
      });
    });
    fosters = Object.values(fosterMap).sort((a, b) => b.portions - a.portions || b.cyclesCount - a.cyclesCount);
  } else {
    fosters = cycle.fosters || [];
    if (selectedDistrict !== 'all') {
      fosters = fosters.filter(f => f.district.toLowerCase() === selectedDistrict.toLowerCase());
    }
  }

  if (fosters.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'node-card is-dimmed';
    emptyCard.innerHTML = `<span class="node-name">Không có trạm ở ${selectedDistrict} ${isCumulative ? 'đến thời điểm này' : 'trong đợt này'}.</span>`;
    container.appendChild(emptyCard);
    return;
  }

  fosters.forEach(f => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    const subStr = isCumulative
      ? `${f.portions} phần (${f.cyclesCount} đợt)`
      : `${f.portions} phần`;
    const tagStr = isCumulative
      ? `Lũy kế ${f.cyclesCount} đợt`
      : `${f.drive_stt ? 'Drive STT #' + f.drive_stt : 'Đã trao'} ${f.note ? '· ' + f.note : ''}`;

    card.innerHTML = `
      <span class="node-name">${f.name}</span>
      <div class="node-sub">
        <span class="node-highlight">${f.district}</span>
        <span>${subStr}</span>
      </div>
      <span class="badge-tag">${tagStr}</span>
    `;
    container.appendChild(card);
  });
}

function renderInspectorInvoice(cycle) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');

  title.textContent = `Hóa Đơn & Danh Sách Nhận Quà: ${cycle.label} (${cycle.code})`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Hạch Toán Đợt Này</h5>
      <ul>
        <li><span>Dùng từ quỹ chung</span><strong>${formatVND(cycle.used_fund)}</strong></li>
        <li><span>Admin bù túi riêng</span><strong style="color:var(--orange)">${cycle.admin_topup > 0 ? formatVND(cycle.admin_topup) : '0 ₫'}</strong></li>
        <li><span>Tổng giá trị hàng hóa</span><strong>${formatVND(cycle.total_value)}</strong></li>
        <li><span>Chi phí vận chuyển</span><strong>Phêrô Nguyễn đài thọ</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Vật Phẩm Cấp Phát (${cycle.supplies.length} loại)</h5>
      <ul>
        ${cycle.supplies.map(s => `<li><span>${s.item}</span><strong>${s.unit_price ? formatVND(s.unit_price) : formatVND(cycle.used_fund)} (${s.total_cost ? s.total_cost + ' phần' : (cycle.supplies_per_gift || 'Sỉ')})</strong></li>`).join('')}
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Danh Sách ${cycle.foster_count} Trạm Foster Nhận Đợt Này</h5>
      <ul style="max-height:160px; overflow-y:auto; padding-right:4px;">
        ${cycle.fosters.map(f => `<li><span>${f.name} (${f.district})</span><strong style="font-weight:normal;">#${f.drive_stt || '-'} (${f.portions}p) ${f.note ? '[' + f.note + ']' : ''}</strong></li>`).join('')}
      </ul>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', init);
