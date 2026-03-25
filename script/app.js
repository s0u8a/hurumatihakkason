// 1. ハッカソン用設定（直接書き込み）
const CLOUD_NAME = 'djhjyfe3k';
const UPLOAD_PRESET = 'my_preset';
const GOOGLE_API_KEY = 'AIzaSyDAfzLdri00Mghw-5jO6-ubYp66ZHxVJ1A';

// 2. スポットデータ
const spots = [
  { id: 1, name: "本町市場", icon: "🛒", desc: "新鮮な海産物や野菜が並ぶ老舗市場。日本海の幸を堪能できる。", tags: ["グルメ", "歴史"], stamped: false, lat: 37.9175, lng: 139.0365 },
  { id: 2, name: "白山神社", icon: "⛩️", desc: "1000年以上の歴史を持つ古町の守り神。境内の楼門は必見。", tags: ["歴史", "パワスポ"], stamped: false, lat: 37.9156, lng: 139.0412 },
  { id: 3, name: "古町通り", icon: "🏮", desc: "江戸時代から続くメインストリート。七番町・八番町が中心。", tags: ["散策", "買い物"], stamped: false, lat: 37.9168, lng: 139.0380 },
  { id: 4, name: "砂丘館", icon: "🏛️", desc: "旧日本銀行新潟支店長宅。文化財指定の洋館でアートを鑑賞。", tags: ["アート", "歴史"], stamped: false, lat: 37.9200, lng: 139.0350 },
  { id: 5, name: "新潟県政記念館", icon: "🏛️", desc: "明治時代の洋風建築。国重要文化財で古町の歴史を伝える。", tags: ["歴史", "建築"], stamped: false, lat: 37.9190, lng: 139.0360 }
];

// 3. localStorageからスタンプ状態を復元
const saved = JSON.parse(localStorage.getItem('stamps') || '{}');
spots.forEach(spot => {
  if (saved[spot.id]) spot.stamped = true;
});

let stampCount = spots.filter(s => s.stamped).length;
let mapInitialized = false;

// 4. 画面表示の制御
function showPage(name, tabEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (tabEl) tabEl.classList.add('active');

  if (name === 'map' && !mapInitialized) {
    mapInitialized = true;
    setTimeout(initMap, 100);
  }
}

// 5. 地図の初期化 (Leaflet)
function initMap() {
  const map = L.map('map').setView([37.9175, 139.0375], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  spots.forEach(spot => {
    const marker = L.marker([spot.lat, spot.lng]).addTo(map);
    marker.bindPopup(`<b>${spot.icon} ${spot.name}</b><br>${spot.desc}`);
  });
}

// 6. スポット一覧の描画
function renderSpots(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
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

// 7. スタンプ取得処理
function getStamp(spot, el) {
  if (!spot.stamped) {
    spot.stamped = true;
    el.classList.add('stamped');
    stampCount++;
    const data = {};
    spots.forEach(s => { if (s.stamped) data[s.id] = true; });
    localStorage.setItem('stamps', JSON.stringify(data));
    updateUI();
  }
}

// 8. UIの更新
function updateUI() {
  document.getElementById('stampCountHeader').textContent = stampCount;
  document.getElementById('progressText').textContent = `${stampCount}/9`;
  document.getElementById('progressBar').style.width = (stampCount / 9 * 100) + '%';

  const grid = document.getElementById('stampGrid');
  if (!grid) return;
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

// 9. 写真アップロード (Cloudinary) & AI解析
async function uploadToCloudinary() {
  const fileInput = document.getElementById('photo-input');
  const file = fileInput.files; // 修正: filesに変更
  const statusMsg = document.getElementById('upload-status');
  const previewImg = document.getElementById('photo-preview');

  if (!file) {
    alert("写真を選択してください");
    return;
  }

  statusMsg.textContent = "写真を保存中...";
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.secure_url) {
      const imageUrl = data.secure_url;
      previewImg.src = imageUrl;
      previewImg.style.display = 'block';
      statusMsg.textContent = "AIが写真を解析しています...";
      await analyzeWithAI(imageUrl);
    } else {
      statusMsg.textContent = "保存失敗: " + (data.error ? data.error.message : "原因不明");
    }
  } catch (error) {
    console.error(error);
    statusMsg.textContent = "エラーが発生しました";
  }
}

// 10. AI解析処理
async function analyzeWithAI(imageUrl) {
  const statusMsg = document.getElementById('upload-status');
  const visionURL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;

  const requestData = {
    requests: [{
      image: { source: { imageUri: imageUrl } },
      features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
    }]
  };

  try {
    const response = await fetch(visionURL, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    const labels = data.responses.labelAnnotations; // 修正:を追加

    if (!labels) {
      statusMsg.textContent = "解析結果が得られませんでした。";
      return;
    }

    const descriptions = labels.map(l => l.description.toLowerCase());
    let aiMessage = "素敵な写真ですね！";

    if (descriptions.some(d => d.includes('noodle') || d.includes('ramen'))) {
      aiMessage = "🍜 おっ、古町の美味しそうなラーメンを認識しました！";
    } else if (descriptions.some(d => d.includes('shrine') || d.includes('temple') || d.includes('torii'))) {
      aiMessage = "⛩️ 歴史を感じる建物ですね。古町さんぽの思い出にぴったりです！";
    } else if (descriptions.some(d => d.includes('food') || d.includes('dish'))) {
      aiMessage = "😋 美味しそうなグルメ写真ですね！お味はいかがでしたか？";
    } else if (descriptions.some(d => d.includes('building') || d.includes('town'))) {
      aiMessage = "🏙️ 古町の街並みが綺麗に写っていますね。";
    }

    statusMsg.innerHTML = `<span style="color:var(--red); font-weight:bold;">AIガイド：</span> ${aiMessage}`;
  } catch (error) {
    console.error("AI解析エラー:", error);
    statusMsg.textContent = "解析中にエラーが発生しました。";
  }
}

function selectRoute(el) {
  document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

window.onload = () => {
  renderSpots('spotList');
  renderSpots('spotListMap');
  updateUI();
};