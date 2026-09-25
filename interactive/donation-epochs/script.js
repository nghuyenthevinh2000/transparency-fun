/**
 * donation-epochs script.js
 * Method 1: The 5-Stage "Time Epoch" Sankey Architecture
 * Uses standardized dataset from '../data/foster-relief/v1/foster_data.js'
 * Follows Open notebook design system (DESIGN.md)
 */

import { FOSTER_DATA } from '../data/foster-relief/v1/foster_data.js';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
const formatShortVND = (num) => {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M ₫`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}k ₫`;
  return `${num} ₫`;
};

// Compile dynamic epoch structures from standardized FOSTER_DATA
const CYCLES = FOSTER_DATA.cycles;

function getEpochStats(year) {
  const isAll = year === 'all';
  const targetYear = parseInt(year, 10);
  const yearCycles = isAll ? CYCLES : CYCLES.filter(c => c.year === targetYear);
  const disbursed = yearCycles.reduce((acc, c) => acc + c.used_fund, 0);
  const adminTopup = yearCycles.reduce((acc, c) => acc + c.admin_topup, 0);
  const totalVal = yearCycles.reduce((acc, c) => acc + c.total_value, 0);

  // Compute donors dynamically from records matching this epoch
  const records = isAll
    ? FOSTER_DATA.donors_records
    : FOSTER_DATA.donors_records.filter(r => r.year === targetYear);

  const donorMap = {};
  records.forEach(r => {
    if (!donorMap[r.donor]) {
      const summaryInfo = FOSTER_DATA.donors_summary[r.donor] || {};
      donorMap[r.donor] = {
        name: r.donor,
        amt: 0,
        count: 0,
        inKind: [],
        lifetimeAmt: summaryInfo.total_amount || 0,
        lifetimeCount: summaryInfo.count || 0,
        years: summaryInfo.years || []
      };
    }
    donorMap[r.donor].amt += r.amount;
    donorMap[r.donor].count += 1;
    if (r.in_kind) donorMap[r.donor].inKind.push(r.in_kind);
  });

  const donors = Object.values(donorMap).sort((a, b) => b.amt - a.amt || b.count - a.count);
  const inflow = donors.reduce((acc, d) => acc + d.amt, 0);
  const uniqueFosters = new Set();
  yearCycles.forEach(c => c.fosters.forEach(f => uniqueFosters.add(f.name)));

  return {
    cycleCount: yearCycles.length,
    disbursed,
    adminTopup,
    totalVal,
    inflow,
    donors,
    sheltersCount: uniqueFosters.size,
    cyclesList: yearCycles.map(c => c.label)
  };
}

function getActiveCycles() {
  let cycles = CYCLES;
  if (currentEpoch !== 'all') {
    cycles = cycles.filter(c => c.year === parseInt(currentEpoch, 10));
  }
  if (currentCycle !== 'all') {
    cycles = cycles.filter(c => c.label === currentCycle);
  }
  return cycles;
}

function getFostersForActiveScope() {
  const activeCycles = getActiveCycles();
  const fosterMap = {};

  activeCycles.forEach(c => {
    c.fosters.forEach(f => {
      if (currentDistrict !== 'all' && f.district.toLowerCase() !== currentDistrict.toLowerCase()) {
        return;
      }
      if (!fosterMap[f.name]) {
        fosterMap[f.name] = {
          name: f.name,
          district: f.district,
          portions: 0,
          cyclesCount: 0,
          cycles: [],
          notes: [],
          driveStts: []
        };
      }
      fosterMap[f.name].portions += f.portions;
      fosterMap[f.name].cyclesCount += 1;
      fosterMap[f.name].cycles.push(c.label);
      if (f.note) fosterMap[f.name].notes.push(f.note);
      if (f.drive_stt) fosterMap[f.name].driveStts.push(`${c.label}: #${f.drive_stt}`);
    });
  });

  return Object.values(fosterMap).sort((a, b) => b.portions - a.portions || b.cyclesCount - a.cyclesCount);
}

// State
let currentEpoch = 'all';
let currentCycle = 'all';
let currentDistrict = 'all';

function init() {
  setupEventListeners();
  renderCyclePills();
  renderFlow();
  renderInspectorDefault();
}

function setupEventListeners() {
  // Epoch Buttons
  document.querySelectorAll('.epoch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.epoch-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentEpoch = btn.dataset.epoch;
      currentCycle = 'all';
      document.getElementById('active-epoch-label').textContent = btn.textContent.split(' ')[0].toUpperCase();
      document.getElementById('active-cycle-label').textContent = 'All Batches';
      renderCyclePills();
      renderFlow();
      renderInspectorDefault();
    });
  });

  // District Buttons
  document.querySelectorAll('.district-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.district-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentDistrict = btn.dataset.district;
      document.getElementById('active-district-label').textContent = btn.textContent;
      renderFlow();
      renderInspectorDefault();
    });
  });
}

function renderCyclePills() {
  const container = document.getElementById('cycle-pills-container');
  container.innerHTML = '';

  const allPill = document.createElement('button');
  allPill.type = 'button';
  allPill.className = `cycle-pill ${currentCycle === 'all' ? 'is-active' : ''}`;
  allPill.textContent = 'All Batches';
  allPill.addEventListener('click', () => {
    currentCycle = 'all';
    document.querySelectorAll('.cycle-pill').forEach(p => p.classList.remove('is-active'));
    allPill.classList.add('is-active');
    document.getElementById('active-cycle-label').textContent = 'All Batches';
    renderFlow();
    renderInspectorDefault();
  });
  container.appendChild(allPill);

  const activeCycles = currentEpoch === 'all' ? CYCLES : CYCLES.filter(c => c.year === parseInt(currentEpoch, 10));

  activeCycles.forEach(cyc => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `cycle-pill ${currentCycle === cyc.label ? 'is-active' : ''}`;
    pill.textContent = cyc.label;
    pill.addEventListener('click', () => {
      currentCycle = cyc.label;
      document.querySelectorAll('.cycle-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      document.getElementById('active-cycle-label').textContent = cyc.label;
      renderFlow();
      inspectCycle(cyc);
    });
    container.appendChild(pill);
  });
}

function renderFlow() {
  updateKPIs();
  renderStage1Epochs();
  renderStage2Benefactors();
  renderStage3FundPool();
  renderStage4Provisions();
  renderStage5Fosters();
}

function updateKPIs() {
  const activeCycles = getActiveCycles();
  const fosters = getFostersForActiveScope();

  if (currentCycle !== 'all') {
    const cycle = activeCycles[0];
    const stats = getEpochStats(currentEpoch);
    document.getElementById('kpi-inflow').textContent = formatVND(stats.inflow);
    document.getElementById('kpi-disbursed').textContent = formatVND(cycle ? cycle.used_fund : 0);
    document.getElementById('kpi-shelters').textContent = `${fosters.length} Trạm Foster`;
    return;
  }

  const stats = getEpochStats(currentEpoch);
  document.getElementById('kpi-inflow').textContent = formatVND(stats.inflow);
  document.getElementById('kpi-disbursed').textContent = formatVND(stats.disbursed);
  document.getElementById('kpi-shelters').textContent = `${fosters.length} Trạm Foster`;
}

function renderStage1Epochs() {
  const container = document.getElementById('stage-epoch-cards');
  container.innerHTML = '';

  const epochData = [
    { id: '2024', title: '2024 Epoch', stats: getEpochStats('2024') },
    { id: '2025', title: '2025 Epoch', stats: getEpochStats('2025') },
    { id: '2026', title: '2026 Epoch', stats: getEpochStats('2026') }
  ];

  epochData.forEach(ep => {
    const isSelected = currentEpoch === 'all' || currentEpoch === ep.id;
    const card = document.createElement('div');
    card.className = `node-card ${isSelected ? 'is-active' : 'is-dimmed'}`;
    card.innerHTML = `
      <span class="node-name">${ep.title}</span>
      <div class="node-sub">
        <span>${ep.stats.cycleCount} đợt</span>
        <span class="node-highlight">${formatShortVND(ep.stats.disbursed)}</span>
      </div>
      <span class="badge-tag">${ep.stats.sheltersCount} trạm nuôi</span>
    `;
    card.addEventListener('click', () => {
      document.querySelector(`.epoch-btn[data-epoch="${ep.id}"]`).click();
    });
    container.appendChild(card);
  });
}

function renderStage2Benefactors() {
  const container = document.getElementById('stage-donor-cards');
  container.innerHTML = '';

  const stats = getEpochStats(currentEpoch);

  stats.donors.forEach(d => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    const tagText = d.inKind && d.inKind.length > 0
      ? d.inKind[0]
      : (d.amt === 0 ? 'Bao 100% Phí Ship' : 'Hảo tâm bảo trợ');
    card.innerHTML = `
      <span class="node-name">${d.name}</span>
      <div class="node-sub">
        <span class="node-highlight">${d.amt > 0 ? formatShortVND(d.amt) : 'Phi tiền mặt'}</span>
        <span>${d.count} lượt</span>
      </div>
      <span class="badge-tag">${tagText}</span>
    `;
    card.addEventListener('click', () => inspectDonor(d));
    container.appendChild(card);
  });
}

function renderStage3FundPool() {
  const container = document.getElementById('stage-fund-cards');
  container.innerHTML = '';

  if (currentCycle !== 'all') {
    const activeCycles = getActiveCycles();
    const cycle = activeCycles[0];
    if (!cycle) return;

    const fundItems = [
      { title: `Xuất quỹ đợt ${cycle.label}`, amt: cycle.used_fund, badge: '100% mua lương thực sỉ' },
      { title: 'Admin bù túi riêng', amt: cycle.admin_topup, badge: cycle.admin_topup > 0 ? 'Admin bù thâm hụt' : 'Đủ ngân sách' },
      { title: 'Tài trợ 100% Phí Ship', amt: 0, badge: 'Phêrô Nguyễn đài thọ' }
    ];

    fundItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'node-card is-active';
      card.innerHTML = `
        <span class="node-name">${item.title}</span>
        <div class="node-sub">
          <span class="node-highlight">${item.amt > 0 ? formatShortVND(item.amt) : (item.title.includes('Ship') ? 'Miễn phí' : '0 ₫')}</span>
        </div>
        <span class="badge-tag">${item.badge}</span>
      `;
      card.addEventListener('click', () => inspectFund(item));
      container.appendChild(card);
    });
    return;
  }

  const stats = getEpochStats(currentEpoch);
  const reserve = Math.max(0, stats.inflow - stats.disbursed);

  const fundItems = [
    { title: 'Xuất quỹ mua đồ ăn', amt: stats.disbursed, badge: '100% tiền quỹ ➔ Lương thực' },
    { title: 'Quỹ dự phòng viện phí', amt: reserve, badge: 'Dành ca bệnh khẩn cấp' },
    { title: 'Admin tự bỏ tiền túi bù', amt: stats.adminTopup, badge: stats.adminTopup > 0 ? 'Admin bù thâm hụt' : 'Đủ ngân sách' },
    { title: 'Tài trợ 100% Phí Ship', amt: 0, badge: 'Phêrô Nguyễn đài thọ' }
  ];

  fundItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    card.innerHTML = `
      <span class="node-name">${item.title}</span>
      <div class="node-sub">
        <span class="node-highlight">${item.amt > 0 ? formatShortVND(item.amt) : 'Miễn phí'}</span>
      </div>
      <span class="badge-tag">${item.badge}</span>
    `;
    card.addEventListener('click', () => inspectFund(item));
    container.appendChild(card);
  });
}

function renderStage4Provisions() {
  const container = document.getElementById('stage-provision-cards');
  container.innerHTML = '';

  const activeCycles = getActiveCycles();

  if (currentCycle !== 'all') {
    const cycle = activeCycles[0];
    if (!cycle) return;

    if (cycle.supplies && cycle.supplies.length > 0) {
      cycle.supplies.forEach((s, idx) => {
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
          <span class="badge-tag">Đợt ${cycle.label} · Vật phẩm #${idx + 1}</span>
        `;
        card.addEventListener('click', () => inspectProvisionItem(s, cycle));
        container.appendChild(card);
      });
    }

    const shipCard = document.createElement('div');
    shipCard.className = 'node-card is-active';
    shipCard.innerHTML = `
      <span class="node-name">Vận Chuyển Cứu Trợ Tận Trạm</span>
      <div class="node-sub">
        <span class="node-highlight">0 ₫ (Miễn phí)</span>
        <span>${cycle.foster_count} trạm nhận</span>
      </div>
      <span class="badge-tag">${cycle.sponsor_notes || 'Phêrô Nguyễn bao 100% ship'}</span>
    `;
    shipCard.addEventListener('click', () => inspectShipNote(cycle));
    container.appendChild(shipCard);
    return;
  }

  let dryCost = 0;
  let wetCost = 0;
  let totalGifts = 0;
  const dryBrandSet = new Set();
  const wetBrandSet = new Set();

  activeCycles.forEach(c => {
    totalGifts += c.total_gifts || 0;
    c.supplies.forEach(s => {
      const lower = s.item.toLowerCase();
      const cost = s.unit_price || 0;
      if (lower.includes('pate')) {
        wetCost += cost;
        const brand = s.item.replace(/\d+.*$/, '').trim();
        wetBrandSet.add(brand || s.item);
      } else {
        dryCost += cost;
        const brand = s.item.replace(/\d+.*$/, '').trim();
        dryBrandSet.add(brand || s.item);
      }
    });
  });

  const totalFoodCost = dryCost + wetCost;
  const dryPct = totalFoodCost > 0 ? Math.round((dryCost / totalFoodCost) * 100) : 85;
  const wetPct = 100 - dryPct;

  const targetYear = currentEpoch === 'all' ? null : parseInt(currentEpoch, 10);
  const inKindRecords = FOSTER_DATA.donors_records.filter(r => r.in_kind && (targetYear === null || r.year === targetYear));
  const inKindSummary = inKindRecords.map(r => `${r.in_kind} (${r.donor})`).slice(0, 3).join(', ');

  const provisions = [
    {
      title: 'Hạt khô dinh dưỡng',
      share: `${dryPct}% ngân sách lương thực`,
      amt: dryCost,
      sub: `${activeCycles.length} đợt cấp (${totalGifts} phần quà)`,
      items: Array.from(dryBrandSet).slice(0, 4).join(', ') || 'Wonder, Hypro, Catta, Tony',
      badge: 'Chủ lực dinh dưỡng hàng tháng'
    },
    {
      title: 'Pate lon & pate gói bổ sung',
      share: `${wetPct}% ngân sách lương thực`,
      amt: wetCost,
      sub: `${wetCost > 0 ? formatShortVND(wetCost) : 'Bổ trợ khẩu phần'}`,
      items: Array.from(wetBrandSet).slice(0, 3).join(', ') || 'Pate Wow, Loveat, Kucinta, Chaozol',
      badge: 'Dành mèo con, mèo ốm suy kiệt'
    },
    {
      title: 'Hiện vật ngoài quỹ & Vận chuyển',
      share: 'Hiện vật & Phí vận chuyển',
      amt: 0,
      sub: `${inKindRecords.length} khoản hiện vật đóng góp`,
      items: inKindSummary || 'Phêrô Nguyễn bao 100% phí ship toàn bộ 22 đợt',
      badge: 'Phêrô Nguyễn bao 100% ship'
    }
  ];

  provisions.forEach(prov => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';
    card.innerHTML = `
      <span class="node-name">${prov.title}</span>
      <div class="node-sub">
        <span class="node-highlight">${prov.amt > 0 ? formatShortVND(prov.amt) : prov.share}</span>
        <span>${prov.sub}</span>
      </div>
      <span class="badge-tag">${prov.badge}</span>
    `;
    card.addEventListener('click', () => inspectProvision(prov));
    container.appendChild(card);
  });
}

function renderStage5Fosters() {
  const container = document.getElementById('stage-foster-cards');
  container.innerHTML = '';

  const fosters = getFostersForActiveScope();

  if (fosters.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'node-card is-dimmed';
    emptyCard.innerHTML = `<span class="node-name">Không có trạm ở ${currentDistrict} trong phạm vi lọc này.</span>`;
    container.appendChild(emptyCard);
    return;
  }

  const isBatchView = currentCycle !== 'all';

  fosters.forEach(f => {
    const card = document.createElement('div');
    card.className = 'node-card is-active';

    const subDetail = isBatchView
      ? `${f.portions} phần`
      : `${f.portions} phần (${f.cyclesCount} đợt)`;

    const badgeText = isBatchView
      ? `Đợt ${currentCycle} ${f.driveStts.length ? '· STT #' + f.driveStts[0].split(': #')[1] : ''}`
      : `Đã nhận ${f.cyclesCount} đợt trong ${currentEpoch === 'all' ? 'toàn kỳ' : currentEpoch}`;

    card.innerHTML = `
      <span class="node-name">${f.name}</span>
      <div class="node-sub">
        <span class="node-highlight">${f.district}</span>
        <span>${subDetail}</span>
      </div>
      <span class="badge-tag">${badgeText}</span>
    `;
    card.addEventListener('click', () => inspectFoster(f));
    container.appendChild(card);
  });
}

function renderInspectorDefault() {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');

  const stats = getEpochStats(currentEpoch);
  const tamAn = stats.donors.find(d => d.name === 'Tâm An');
  const dieuTrinh = stats.donors.find(d => d.name === 'Diệu Trinh');

  title.textContent = `Tổng quan minh bạch: ${currentEpoch === 'all' ? 'Toàn bộ 3 năm (2024–2026)' : 'Thời kỳ ' + currentEpoch}`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Luồng Tiền Thu (${formatShortVND(stats.inflow)})</h5>
      <ul>
        <li><span>Tổng số lượt ủng hộ</span><strong>${stats.donors.reduce((a, d) => a + d.count, 0)} lượt</strong></li>
        <li><span>Số MTQ / Ân nhân</span><strong>${stats.donors.length} vị</strong></li>
        <li><span>Đại thí chủ Tâm An</span><strong>${formatVND(tamAn?.amt || 0)} (${tamAn?.count || 0} lượt)</strong></li>
        <li><span>Thí chủ Diệu Trinh</span><strong>${formatVND(dieuTrinh?.amt || 0)} (${dieuTrinh?.count || 0} lượt)</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Lương Thực & Đợt Cấp Phát</h5>
      <ul>
        <li><span>Số chu kỳ định kỳ</span><strong>${stats.cycleCount} đợt</strong></li>
        <li><span>Quỹ chi mua đồ ăn</span><strong>${formatVND(stats.disbursed)}</strong></li>
        <li><span>Admin bù túi riêng</span><strong style="color:var(--orange)">${formatVND(stats.adminTopup)}</strong></li>
        <li><span>Chi phí vận chuyển</span><strong>Phêrô Nguyễn bao 100% ship</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Trạm Foster Nhận Trợ Cấp</h5>
      <ul>
        <li><span>Trạm foster được cấp</span><strong>${stats.sheltersCount} trạm cứu trợ</strong></li>
        <li><span>Toàn bộ 42 trạm</span><strong>Phủ khắp 11 quận huyện SG</strong></li>
        <li><span>Minh chứng hình ảnh</span><strong>100% hình Drive công khai</strong></li>
      </ul>
    </div>
  `;
}

function inspectDonor(donor) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');
  const epochLabel = currentEpoch === 'all' ? 'Toàn bộ 3 năm' : `Năm ${currentEpoch}`;

  title.textContent = `Chi tiết Ân nhân: ${donor.name} (${epochLabel})`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Hồ Sơ Đóng Góp (${epochLabel})</h5>
      <ul>
        <li><span>Danh xưng hảo tâm</span><strong>${donor.name}</strong></li>
        <li><span>Số lượt ủng hộ (${currentEpoch === 'all' ? 'Tổng' : currentEpoch})</span><strong>${donor.count} lần</strong></li>
        <li><span>Giá trị tịnh tài (${currentEpoch === 'all' ? 'Tổng' : currentEpoch})</span><strong style="color:var(--orange)">${donor.amt > 0 ? formatVND(donor.amt) : 'Tài trợ hiện vật / vận chuyển'}</strong></li>
        ${currentEpoch !== 'all' ? `<li><span>Tổng lũy kế 3 năm</span><strong>${formatVND(donor.lifetimeAmt)} (${donor.lifetimeCount} lần)</strong></li>` : ''}
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Ý Nghĩa Thực Tế</h5>
      <p style="font-size:13px; line-height:1.6; color:var(--muted); margin:0;">
        Khoản tịnh tài của <strong>${donor.name}</strong> đã trực tiếp mua các tải hạt Catta 18kg, Tony 24kg và các thùng pate lon 400g dinh dưỡng để phân phát đều đặn tới 42 trạm foster nuôi mèo lang thang trong ${epochLabel}.
        ${donor.inKind && donor.inKind.length ? `<br><br><strong>Hiện vật đồng hành:</strong> ${donor.inKind.join(', ')}.` : ''}
      </p>
    </div>
  `;
}

function inspectFoster(foster) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');

  const lifetimeInfo = FOSTER_DATA.fosters_summary[foster.name] || {};
  const isBatchView = currentCycle !== 'all';
  const scopeLabel = isBatchView
    ? `Đợt ${currentCycle}`
    : (currentEpoch === 'all' ? 'Toàn bộ 3 năm' : `Năm ${currentEpoch}`);

  title.textContent = `Hồ Sơ Trạm Foster: ${foster.name} (${foster.district})`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Khẩu Phần (${scopeLabel})</h5>
      <ul>
        <li><span>Khu vực hoạt động</span><strong>${foster.district}</strong></li>
        <li><span>Số phần nhận trong kỳ</span><strong style="color:var(--orange)">${foster.portions} phần quà</strong></li>
        <li><span>Số đợt tham gia kỳ này</span><strong>${foster.cyclesCount} đợt</strong></li>
        ${(!isBatchView && currentEpoch !== 'all') ? `<li><span>Tổng lũy kế 3 năm</span><strong>${lifetimeInfo.total_portions || foster.portions} phần (${lifetimeInfo.cycles_count || foster.cyclesCount} đợt)</strong></li>` : ''}
        ${isBatchView ? `<li><span>Tổng lũy kế 3 năm</span><strong>${lifetimeInfo.total_portions || foster.portions} phần (${lifetimeInfo.cycles_count || 1} đợt)</strong></li>` : ''}
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Minh Chứng & Ghi Chú Đợt</h5>
      <div style="font-size:12px; color:var(--muted); line-height:1.6; max-height:120px; overflow-y:auto;">
        ${foster.notes && foster.notes.length ? `<p style="margin:0 0 6px 0;"><strong>Ghi chú:</strong> ${foster.notes.join('; ')}</p>` : ''}
        ${foster.driveStts && foster.driveStts.length ? `<p style="margin:0 0 6px 0;"><strong>STT hình Drive:</strong> ${foster.driveStts.join(', ')}</p>` : ''}
        <p style="margin:0;"><strong>Các đợt đã nhận:</strong> ${foster.cycles ? foster.cycles.join(', ') : 'Đầy đủ các chu kỳ'}</p>
      </div>
    </div>
  `;
}

function inspectFund(item) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');
  title.textContent = `Phân Phối Quỹ: ${item.title}`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Chỉ Số Phân Bổ</h5>
      <ul>
        <li><span>Hạng mục</span><strong>${item.title}</strong></li>
        <li><span>Quy chế chi</span><strong>${item.badge}</strong></li>
        <li><span>Số tiền / Giá trị</span><strong style="color:var(--orange)">${item.amt > 0 ? formatVND(item.amt) : 'Được đài thọ'}</strong></li>
      </ul>
    </div>
  `;
}

function inspectProvision(prov) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');
  title.textContent = `Danh Mục Lương Thực: ${prov.title}`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Chỉ Số & Quy Cách</h5>
      <ul>
        <li><span>Tỷ trọng chi tiêu</span><strong style="color:var(--orange)">${prov.share}</strong></li>
        <li><span>Tổng tiền phân bổ</span><strong>${prov.amt > 0 ? formatVND(prov.amt) : 'Được tài trợ riêng'}</strong></li>
        <li><span>Quy mô đợt cấp</span><strong>${prov.sub}</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Các Mặt Hàng Chi Tiết</h5>
      <p style="font-size:13px; line-height:1.6; color:var(--muted); margin:0;">
        <strong>Hàng mục đại diện:</strong> ${prov.items}
      </p>
    </div>
  `;
}

function inspectProvisionItem(s, cycle) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');
  title.textContent = `Vật Phẩm Cứu Trợ: ${s.item}`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Chi Tiết Nhập Hàng (${cycle.label})</h5>
      <ul>
        <li><span>Tên sản phẩm</span><strong>${s.item}</strong></li>
        <li><span>Đơn giá / Thành tiền</span><strong style="color:var(--orange)">${s.unit_price ? formatVND(s.unit_price) : formatVND(cycle.used_fund)}</strong></li>
        <li><span>Quy cách chia quà</span><strong>${s.total_cost ? s.total_cost + ' phần' : (cycle.supplies_per_gift || 'Phân phối đều các trạm')}</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Hạch Toán Đợt Cấp Phát</h5>
      <p style="font-size:13px; line-height:1.6; color:var(--muted); margin:0;">
        Sản phẩm nhập sỉ cho <strong>Đợt ${cycle.label}</strong> thuộc đợt chi <strong>${formatVND(cycle.used_fund)}</strong>, vận chuyển tới ${cycle.foster_count} trạm foster cứu trợ.
      </p>
    </div>
  `;
}

function inspectShipNote(cycle) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');
  title.textContent = `Hậu Cần Vận Chuyển: Đợt ${cycle.label}`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Đài Thọ Vận Chuyển</h5>
      <ul>
        <li><span>Ân nhân tài trợ</span><strong>Phêrô Nguyễn</strong></li>
        <li><span>Chính sách ship</span><strong>Tài trợ 100% phí giao hạt & pate</strong></li>
        <li><span>Số trạm nhận đợt này</span><strong>${cycle.foster_count} trạm</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Ý Nghĩa Minh Bạch</h5>
      <p style="font-size:13px; line-height:1.6; color:var(--muted); margin:0;">
        ${cycle.sponsor_notes || 'Phêrô Nguyễn hỗ trợ tiền ship'} — Nhờ khoản đài thọ này, 100% tiền quỹ của các MTQ khác được dồn toàn bộ vào việc mua hạt và pate giá sỉ, không bị hao hụt chi phí logistics.
      </p>
    </div>
  `;
}

function inspectCycle(cycle) {
  const title = document.getElementById('inspector-title');
  const content = document.getElementById('inspector-content');
  title.textContent = `Chi Tiết Đợt ${cycle.label} (${cycle.code})`;
  content.innerHTML = `
    <div class="inspector-col">
      <h5>Hạch Toán Đợt ${cycle.label}</h5>
      <ul>
        <li><span>Trích từ quỹ</span><strong>${formatVND(cycle.used_fund)}</strong></li>
        <li><span>Admin bù riêng</span><strong style="color:var(--orange)">${cycle.admin_topup > 0 ? formatVND(cycle.admin_topup) : '0 ₫'}</strong></li>
        <li><span>Tổng giá trị hàng</span><strong>${formatVND(cycle.total_value)}</strong></li>
      </ul>
    </div>
    <div class="inspector-col">
      <h5>Trạm Nhận Quà (${cycle.foster_count} trạm)</h5>
      <ul style="max-height:140px; overflow-y:auto; padding-right:4px;">
        ${cycle.fosters.map(f => `<li><span>${f.name} (${f.district})</span><strong style="font-weight:normal;">#${f.drive_stt || '-'} (${f.portions}p) ${f.note ? '[' + f.note + ']' : ''}</strong></li>`).join('')}
      </ul>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', init);
