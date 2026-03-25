const spots = [
  { id: 1, name: "本町市場", icon: "🛒", desc: "新鮮な海産物や野菜が並ぶ老舗市場。日本海の幸を堪能できる。", tags: ["グルメ", "歴史"], stamped: true },
  { id: 2, name: "白山神社", icon: "⛩️", desc: "1000年以上の歴史を持つ古町の守り神。境内の楼門は必見。", tags: ["歴史", "パワスポ"], stamped: false },
  { id: 3, name: "古町通り", icon: "🏮", desc: "江戸時代から続くメインストリート。七番町・八番町が中心。", tags: ["散策", "買い物"], stamped: false },
  { id: 4, name: "砂丘館", icon: "🏛️", desc: "旧日本銀行新潟支店長宅。文化財指定の洋館でアートを鑑賞。", tags: ["アート", "歴史"], stamped: false },
  { id: 5, name: "新潟県政記念館", icon: "🏛️", desc: "明治時代の洋風建築。国重要文化財で古町の歴史を伝える。", tags: ["歴史", "建築"], stamped: false },
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

function showPage(name, tabEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  tabEl.classList.add('active');
}

function selectRoute(el) {
  document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}// --- ここを自分の設定に書き換えてください ---
const CLOUD_NAME = 'djhjyfe3k';
const UPLOAD_PRESET = 'my_preset';
// ------------------------------------------

async function uploadImage() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files;
  const loadingMsg = document.getElementById('loading-msg');

  if (!file) {
    alert("ファイルを選択してください");
    return;
  }

  // ローディング表示
  loadingMsg.style.display = 'block';

  // データを準備（FormData）
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    // CloudinaryのAPIへリクエスト送信
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.secure_url) {
      // 成功：URLを表示して画像を表示
      document.getElementById('url-text').innerHTML =
        `成功！ URL: <a href="${data.secure_url}" target="_blank">${data.secure_url}</a>`;

      const imgPreview = document.getElementById('preview');
      imgPreview.src = data.secure_url;
      imgPreview.style.display = 'block';
    } else {
      alert("アップロード失敗: " + data.error.message);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
    alert("通信エラーが発生しました");
  } finally {
    loadingMsg.style.display = 'none';
  }
}



// 初期化
renderSpots('spotList');
renderSpots('spotListMap');
renderStampGrid();
updateStampCount();
