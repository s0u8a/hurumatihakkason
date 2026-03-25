const spots = [
  { id:1, name:"本町市場", icon:"🛒", desc:"新鮮な海産物や野菜が並ぶ老舗市場。日本海の幸を堪能できる。", tags:["グルメ","歴史"], stamped: true,  lat:37.9175, lng:139.0365 },
  { id:2, name:"白山神社", icon:"⛩️", desc:"1000年以上の歴史を持つ古町の守り神。境内の楼門は必見。", tags:["歴史","パワスポ"], stamped: false, lat:37.9156, lng:139.0412 },
  { id:3, name:"古町通り", icon:"🏮", desc:"江戸時代から続くメインストリート。七番町・八番町が中心。", tags:["散策","買い物"], stamped: false, lat:37.9168, lng:139.0380 },
  { id:4, name:"砂丘館", icon:"🏛️", desc:"旧日本銀行新潟支店長宅。文化財指定の洋館でアートを鑑賞。", tags:["アート","歴史"], stamped: false, lat:37.9200, lng:139.0350 },
  { id:5, name:"新潟県政記念館", icon:"🏛️", desc:"明治時代の洋風建築。国重要文化財で古町の歴史を伝える。", tags:["歴史","建築"], stamped: false, lat:37.9190, lng:139.0360 },
];

let stampCount = 1;

function renderSpots(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  spots.forEach(spot => {
    const div = document.createElement('div');
    div.className = 'spot-item' + (spot.stamped ? ' stamped' : '');
    div.innerHTML = `
      <div class="spot-icon">${spot.icon}</div>
      <div class="spot-info">
        <div class="spot-name">${spot.name}</div>
        <div class="spot-desc">${spot.desc}</div>
        <div class="spot-tags">${spot.tags.map(t => `<span class="spot-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="stamp-badge">✓</div>
    `;
    div.onclick = () => getStamp(spot, div);
    container.appendChild(div);
  });
}

function getStamp(spot, el) {
  if (!spot.stamped) {
    spot.stamped = true;
    el.classList.add('stamped');
    stampCount++;
    updateStampCount();
    renderStampGrid();
    const badge = el.querySelector('.stamp-badge');
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = 'scale(1)', 300);
    renderSpots('spotListMap');
  }
}

function updateStampCount() {
  document.getElementById('stampCountHeader').textContent = stampCount;
  document.getElementById('progressText').textContent = stampCount + '/9';
  document.getElementById('progressBar').style.width = (stampCount / 9 * 100) + '%';
}

function renderStampGrid() {
  const grid = document.getElementById('stampGrid');
  grid.innerHTML = '';
  spots.forEach((spot, i) => {
    const cell = document.createElement('div');
    cell.className = 'stamp-cell' + (spot.stamped ? ' earned' : '');
    cell.innerHTML = `
      <div class="stamp-number">${i + 1}</div>
      <div class="stamp-emoji">${spot.stamped ? spot.icon : '❓'}</div>
      <div class="stamp-name">${spot.stamped ? spot.name : '未取得'}</div>
    `;
    grid.appendChild(cell);
  });
  for (let i = spots.length; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'stamp-cell';
    cell.innerHTML = `
      <div class="stamp-number">${i + 1}</div>
      <div class="stamp-emoji" style="opacity:0.3">📍</div>
      <div class="stamp-name" style="color:#ccc">スポット追加予定</div>
    `;
    grid.appendChild(cell);
  }
}

let mapInitialized = false;

function showPage(name, tabEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  tabEl.classList.add('active');

  if (name === 'map' && !mapInitialized) {
    mapInitialized = true;
    initMap();
  }
}

function selectRoute(el) {
  document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// 初期化
renderSpots('spotList');
renderSpots('spotListMap');
renderStampGrid();
updateStampCount();
function initMap() {
  const map = L.map('map').setView([37.9175, 139.0375], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  spots.forEach(spot => {
    L.marker([spot.lat, spot.lng])
      .addTo(map)
      .bindPopup(`<b>${spot.icon} ${spot.name}</b><br>${spot.desc}`);
  });
}
