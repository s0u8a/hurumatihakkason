// 1. ハッカソン用設定（直接書き込み）
const CLOUD_NAME = 'djhjyfe3k';
const UPLOAD_PRESET = 'my_preset';
const GOOGLE_API_KEY = 'AIzaSyC5kzwBBS---IAAa_012ce4a2XQdQqDOjw';

// 2. スポットデータ
const spots = [
  { id: 1, name: "本町市場", icon: "🛒", desc: "新鮮な海産物や野菜が並ぶ老舗市場。日本海の幸を堪能できる。", tags: ["グルメ", "歴史", "食べ歩き"], stamped: false, lat: 37.9175, lng: 139.0365 },
  { id: 2, name: "白山神社", icon: "⛩️", desc: "1000年以上の歴史を持つ古町の守り神。境内の楼門は必見。", tags: ["歴史", "パワスポ", "映え"], stamped: false, lat: 37.9156, lng: 139.0412 },
  { id: 3, name: "古町通り", icon: "🏮", desc: "江戸時代から続くメインストリート。七番町・八番町が中心。", tags: ["散策", "買い物", "食べ歩き", "グルメ"], stamped: false, lat: 37.9168, lng: 139.0380 },
  { id: 4, name: "砂丘館", icon: "🏛️", desc: "旧日本銀行新潟支店長宅。文化財指定の洋館でアートを鑑賞。", tags: ["アート", "歴史", "映え"], stamped: false, lat: 37.9200, lng: 139.0350 },
  { id: 5, name: "新潟県政記念館", icon: "🏛️", desc: "明治時代の洋風建築。国重要文化財で古町の歴史を伝える。", tags: ["歴史", "建築", "映え"], stamped: false, lat: 37.9190, lng: 139.0360 },
  { id: 6, name: "NEXT21", icon: "🏙️", desc: "古町を代表するランドマークタワー。展望ラウンジからの景色は絶景。", tags: ["景色", "ランドマーク", "映え", "グルメ"], stamped: false, lat: 37.9232, lng: 139.0435 },
  { id: 7, name: "旧齋藤家別邸", icon: "🏡", desc: "豪商の別荘。美しい庭園と近代和風建築が見どころ。", tags: ["歴史", "庭園", "映え"], stamped: false, lat: 37.9238, lng: 139.0385 },
  { id: 8, name: "みなとぴあ", icon: "🏛️", desc: "新潟市歴史博物館。信濃川のほとりに建つレトロな洋館。", tags: ["歴史", "博物館", "映え"], stamped: false, lat: 37.9265, lng: 139.0520 },
  { id: 9, name: "萬代橋", icon: "🌉", desc: "新潟市のシンボル。信濃川にかかる重要文化財の石造りアーチ橋。", tags: ["歴史", "ランドマーク", "映え", "散策"], stamped: false, lat: 37.9197, lng: 139.0531 }
];

const coupons = [
  { id: 1, reqStamps: 1, shop: "🍶 越乃寒梅 本店", title: "試飲1杯無料サービス" },
  { id: 2, reqStamps: 2, shop: "☕ 古町珈琲", title: "コーヒー1杯100円引き" },
  { id: 3, reqStamps: 3, shop: "🍜 いたりあん 古町店", title: "ランチ10%OFFクーポン" },
  { id: 6, reqStamps: 4, shop: "💆 古町リラクゼーション", title: "マッサージ無料クーポン" },
  { id: 7, reqStamps: 5, shop: "🍜 古町のラーメン屋", title: "餃子無料券" },
  { id: 4, reqStamps: 6, shop: "🏨 古町旅館", title: "日帰り温泉500円引き" },
  { id: 8, reqStamps: 7, shop: "💳 JCB", title: "JCBカードgiftクーポン" },
  { id: 5, reqStamps: 9, shop: "🎉 古町グルメ", title: "豪華コンプリート招待券" }
];

// 3. localStorageからスタンプ状態を復元
const saved = JSON.parse(localStorage.getItem('stamps') || '{}');
const savedCoupons = JSON.parse(localStorage.getItem('used_coupons') || '{}');
spots.forEach(spot => {
  if (saved[spot.id]) {
    spot.stamped = true;
    // 古いデータと新しいデータの両方に対応
    if (saved[spot.id].imageUrl) spot.imageUrl = saved[spot.id].imageUrl;
    if (saved[spot.id].imageHash) spot.imageHash = saved[spot.id].imageHash;
  }
});

let stampCount = spots.filter(s => s.stamped).length;
let mapInitialized = false;

// --- 初期表示時の処理 ---
// 画面を開いた直後に、スポット一覧やスタンプカードのマスを描画します。
window.addEventListener('DOMContentLoaded', () => {
  renderSpots('spotList');
  renderSpots('spotListMap');
  updateUI();
});

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
let currentRouteTag = null; // null means show all spots

function selectRoute(element, tag) {
  document.querySelectorAll('.route-card').forEach(el => el.classList.remove('selected'));
  if(element) element.classList.add('selected');
  currentRouteTag = tag;
  renderSpots('spotList');
  
  // 映えさんぽモードの時だけSNSシェアボタンを表示
  const snsContainer = document.getElementById('sns-share-container');
  if(snsContainer) {
    snsContainer.style.display = (tag === '映え') ? 'block' : 'none';
  }
}

function renderSpots(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  spots.forEach(spot => {
    // フィルター判定(ホーム画面のスポット一覧のみ適用)
    if (containerId === 'spotList' && currentRouteTag && !spot.tags.includes(currentRouteTag)) {
      return; 
    }

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
    // AIの写真判定のみでスタンプを獲得させるため、リストタップでの直接スタンプ付与を無効化
    // div.onclick = () => getStamp(spot, div);
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
    
    // 写真URLがあればその写真を表示し、なければアイコンを表示する
    const mediaHtml = spot.imageUrl 
  ? `<div style="width: 100%; flex: 1; border-radius: 8px; overflow: hidden; margin: 4px 0; min-height: 0;">
      <img src="${spot.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
    </div>`
  : `<div class="stamp-emoji">${spot.stamped ? spot.icon : '❓'}</div>`;

    cell.innerHTML = `
      <div class="stamp-number">${i + 1}</div>
      ${mediaHtml}
      <div class="stamp-name">${spot.stamped ? spot.name : '未取得'}</div>
      <div class="stamp-desc">${spot.stamped ? spot.desc : 'このスポットのスタンプをゲットしよう！'}</div>
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
  
  // クーポンも再描画
  renderCoupons();
}

// 9. 写真アップロード (Cloudinary) & AI解析
let currentUploadHash = null;

// 画像のハッシュ化（完全同一ファイルの検知用）
async function calculateHash(file) {
  if (window.crypto && window.crypto.subtle) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
      console.warn('Crypto API error, falling back to basic hash.');
    }
  }
  // ローカル開発(file://)など暗号化APIが使えない環境では、ファイル情報を疑似ハッシュとして使う
  return `${file.name}_${file.size}_${file.lastModified}`;
}

async function uploadToCloudinary() {
  const fileInput = document.getElementById('photo-input');
  const file = fileInput.files[0]; // 修正: 最初のファイルオブジェクトを取得する
  const statusMsg = document.getElementById('upload-status');
  const previewImg = document.getElementById('photo-preview');

  if (!file) {
    alert("写真を選択してください");
    return;
  }

  // 使い回し画像のチェック
  statusMsg.textContent = "写真の重複をチェック中...";
  try {
    currentUploadHash = await calculateHash(file);
    const usedHashes = JSON.parse(localStorage.getItem('used_hashes') || '[]');
    if (usedHashes.includes(currentUploadHash)) {
      statusMsg.textContent = "";
      alert("❌ この写真はすでに過去のスタンプラリーで使われ、クーポンと引き換え済みです！新しい写真を撮影してください。");
      fileInput.value = '';
      return;
    }
  } catch (e) {
    console.error("ハッシュ計算エラー:", e);
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

// 10. AI解析処理（修正版：ランドマーク検出とスタンプ自動付与を追加）
async function analyzeWithAI(imageUrl) {
  const statusMsg = document.getElementById('upload-status');
  const visionURL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;

  // 修正ポイント①：LABELだけでなくLANDMARK_DETECTIONを追加
  const requestData = {
    requests: [{
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 30 }, // より多くの単語を検出させるため大きく増やす
        { type: 'LANDMARK_DETECTION', maxResults: 5 }
      ]
    }]
  };

  try {
    const response = await fetch(visionURL, {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    const data = await response.json();

    if (!response.ok || data.error) {
      statusMsg.textContent = "AI解析に失敗しました。";
      return;
    }


    const res = data.responses[0]; // 修正: responsesは配列なので最初の要素を取り出す
    const labels = res.labelAnnotations || [];
    const landmarks = res.landmarkAnnotations || [];

    let aiMessage = "素敵な写真ですね！古町さんぽを楽しんでください。";
    let targetSpotId = null;

    // 1. まずは「ランドマーク」で判定
    if (landmarks.length > 0) {
      const name = landmarks[0].description.toLowerCase(); // 修正: landmarksも配列なので最初の要素の名前を見る
      console.log("AIが見つけた場所:", name); // 開発者ツールで何て出てるか確認できます

      if (name.includes("furumachi") || name.includes("mall") || name.includes("arcade") || name.includes("street")) {
        aiMessage = "🏮 古町通りですね！アーケードが続くメインストリートです。";
        targetSpotId = 3;
      } else if (name.includes("next") || name.includes("next21")) {
        aiMessage = "🏙️ NEXT21ですね！古町のランドマークとしてスタンプを押します！";
        targetSpotId = 6;
      } else if (name.includes("hakusan") || name.includes("shrine")) {
        aiMessage = "⛩️ 白山神社ですね！歴史ある風景です。";
        targetSpotId = 2;
      } else if (name.includes("sakyukan")) {
        aiMessage = "🏛️ 砂丘館ですね！モダンな洋館が素敵です。";
        targetSpotId = 4;
      } else if (name.includes("memorial") || name.includes("prefectural")) {
        aiMessage = "🏛️ 新潟県政記念館ですね！明治の息吹を感じます。";
        targetSpotId = 5;
      } else if (name.includes("saito") || name.includes("saitou")) {
        aiMessage = "🏡 旧齋藤家別邸ですね！美しいお庭ですね。";
        targetSpotId = 7;
      } else if (name.includes("minatopia") || name.includes("museum")) {
        aiMessage = "🏛️ みなとぴあですね！レトロな雰囲気が魅力的です。";
        targetSpotId = 8;
      } else if (name.includes("bandai") || name.includes("bridge")) {
        aiMessage = "🌉 萬代橋ですね！新潟を代表する美しい橋です。";
        targetSpotId = 9;
      }
    }

    // 2. もし場所が特定できなくても「ラベル」で汎用的に判定（デモで確実に成功させる工夫！）
    if (!targetSpotId) {
      const descriptions = labels.map(l => l.description.toLowerCase());
      console.log("写っているものリスト:", descriptions);

      // 各スポットの関連キーワード（甘めの判定ですが、他と被りやすい汎用単語は避ける）
      const keywordsShrine = ["shrine", "temple", "place of worship", "shinto", "shinto shrine", "torii", "religion"]; // 2: 白山神社
      const keywordsMarket = ["market", "marketplace", "food", "grocery", "bazaar", "supermarket", "stall", "fish", "vegetable", "produce"]; // 1: 本町市場
      const keywordsStreet = ["street", "alley", "road", "pedestrian", "town", "neighborhood", "arcade", "shopping mall", "retail", "shopping", "promenade", "corridor", "city", "building", "architecture", "structure", "plaza"]; // 3: 古町通り
      const keywordsSakyukan = ["art gallery", "mansion", "modern", "western", "design", "museum", "bank", "cottage", "interior", "house", "residence", "home"]; // 4: 砂丘館
      const keywordsPrefectural = ["government", "assembly", "parliament", "western architecture", "classic architecture", "courthouse", "palace"]; // 5: 新潟県政記念館
      const keywordsNext21 = ["skyscraper", "condominium", "tower block", "high-rise", "tower", "observatory", "tall building"]; // 6: NEXT21
      const keywordsSaito = ["plant", "tree", "wood", "nature", "garden", "japanese garden", "courtyard", "tea house", "botanical", "villa", "japanese architecture", "historic site", "tatami", "shoji", "roof", "estate", "property", "bamboo", "house", "residence"]; // 7: 旧齋藤家別邸
      const keywordsMinatopia = ["museum", "brick", "exhibition", "history", "customs"]; // 8: みなとぴあ
      const keywordsBridge = ["bridge", "arch bridge", "river", "water", "infrastructure", "skyline"]; // 9: 萬代橋

      // 特定の建物や特徴的な場所を先に判定し、汎用的なもの（通りや空など）を後にする
      if (descriptions.some(d => keywordsShrine.includes(d))) {
        aiMessage = "⛩️ 白山神社ですね！歴史ある風景としてスタンプを押します！";
        targetSpotId = 2;
      } else if (descriptions.some(d => keywordsSaito.includes(d))) {
        aiMessage = "🏡 旧齋藤家別邸ですね！由緒ある素敵な景色です！";
        targetSpotId = 7;
      } else if (descriptions.some(d => keywordsSakyukan.includes(d))) {
        aiMessage = "🏛️ 砂丘館ですね！落ち着いたモダンな空間ですね！";
        targetSpotId = 4;
      } else if (descriptions.some(d => keywordsPrefectural.includes(d))) {
        aiMessage = "🏛️ 新潟県政記念館ですね！明治の息吹を感じます！";
        targetSpotId = 5;
      } else if (descriptions.some(d => keywordsMinatopia.includes(d))) {
        aiMessage = "🏛️ みなとぴあですね！歴史を感じさせる建物です！";
        targetSpotId = 8;
      } else if (descriptions.some(d => keywordsBridge.includes(d))) {
        aiMessage = "🌉 萬代橋ですね！美しいアーチ橋の姿が素敵です！";
        targetSpotId = 9;
      } else if (descriptions.some(d => keywordsStreet.includes(d))) {
        aiMessage = "🏮 古町通りですね！アーケードが続くメインストリートですね！";
        targetSpotId = 3;
      } else if (descriptions.some(d => keywordsMarket.includes(d))) {
        aiMessage = "🛒 本町市場ですね！活気があって素敵な一枚です！";
        targetSpotId = 1;
      } else if (descriptions.some(d => keywordsNext21.includes(d))) {
        aiMessage = "🏙️ NEXT21ですね！古町のランドマークとしてスタンプを押します！";
        targetSpotId = 6;
      }
    }

    // 3. スポットが特定できたらスタンプを自動で押す
    if (targetSpotId) {
      const spot = spots.find(s => s.id === targetSpotId);
      if (spot && !spot.stamped) {
        spot.stamped = true;
        spot.imageUrl = imageUrl; // アップロードされた写真URLも記録する
        spot.imageHash = currentUploadHash; // ハッシュ値も記録する
        
        // 保存用データを作成して保存（画像URLとハッシュ込み）
        const savedData = {};
        spots.forEach(s => { 
          if (s.stamped) {
            savedData[s.id] = { stamped: true, imageUrl: s.imageUrl, imageHash: s.imageHash };
          } 
        });
        localStorage.setItem('stamps', JSON.stringify(savedData));

        // UI（画面）を更新
        stampCount = spots.filter(s => s.stamped).length;
        renderSpots('spotList'); // リスト再描画
        updateUI(); // スタンプ帳更新
        
        aiMessage += " ✨スタンプを1個ゲットしました！";
      } else if (spot && spot.stamped) {
        aiMessage += " （このスポットのスタンプは既に取得済みです）";
      }
    }

    statusMsg.innerHTML = `<span style="color:var(--red); font-weight:bold;">AIガイド：</span> ${aiMessage}`;
  } catch (error) {
    console.error("AI解析エラー:", error);
    statusMsg.textContent = "解析中にエラーが発生しました。";
  }
}

// 11. クーポンの描画と使用
function renderCoupons() {
  const list = document.querySelector('.coupon-list');
  if (!list) return;
  list.innerHTML = '';
  
  coupons.forEach(coupon => {
    const isAvailable = stampCount >= coupon.reqStamps;
    const remaining = coupon.reqStamps - stampCount;
    const isUsed = savedCoupons[coupon.id];
    
    let statusHtml = '';
    let bgColor = '';
    let opacity = '1';
    
    if (isUsed) {
      statusHtml = '<span class="coupon-status" style="background:#e0e0e0; color:#888;">使用済み</span>';
      bgColor = 'background:var(--warm-gray)';
      opacity = '0.6';
    } else if (isAvailable) {
      statusHtml = `<span class="coupon-status available" onclick="useCoupon(${coupon.id})" style="cursor:pointer; transition:0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.1);">✓ 利用する (タップ)</span>`;
      bgColor = 'background:var(--red)';
    } else {
      statusHtml = `<span class="coupon-status locked">🔒 あと${remaining}スタンプ</span>`;
      bgColor = 'background:var(--warm-gray)';
    }

    const card = document.createElement('div');
    card.className = 'coupon-card';
    card.style.opacity = opacity;
    card.innerHTML = `
      <div class="coupon-left" style="${bgColor}">
        <div class="coupon-stamp-req">${coupon.reqStamps}</div>
        <div class="coupon-stamp-label">スタンプ</div>
      </div>
      <div class="coupon-right">
        <div class="coupon-shop">${coupon.shop}</div>
        <div class="coupon-title">${coupon.title}</div>
        ${statusHtml}
      </div>
    `;
    list.appendChild(card);
  });
}

function useCoupon(id) {
  if (confirm("このクーポンを使用しますか？\\n※使用すると現在のスタンプは「リセット」され、今回使った写真は次回以降使えなくなります！\\n\\n※お店のスタッフに見せながら「OK」を押してください。")) {
    
    // クーポン使用済みにする
    savedCoupons[id] = true;
    localStorage.setItem('used_coupons', JSON.stringify(savedCoupons));

    // 現在のスタンプの写真を「使用済み」として記録する
    const usedHashes = JSON.parse(localStorage.getItem('used_hashes') || '[]');
    spots.forEach(s => {
      if (s.stamped && s.imageHash && !usedHashes.includes(s.imageHash)) {
        usedHashes.push(s.imageHash);
      }
    });
    localStorage.setItem('used_hashes', JSON.stringify(usedHashes));

    // スタンプを完全リセットする
    spots.forEach(s => {
      s.stamped = false;
      s.imageUrl = null;
      s.imageHash = null;
    });
    localStorage.removeItem('stamps');
    stampCount = 0;

    // 全てのクーポンが使用済みかチェック
    const allCouponsUsed = coupons.every(c => savedCoupons[c.id]);
    if (allCouponsUsed) {
      // クーポン使用履歴をリセット
      for (let key in savedCoupons) {
        delete savedCoupons[key];
      }
      localStorage.removeItem('used_coupons');
      alert("クーポンを使用しました！\\nなんと、全てのクーポンをコンプリートしました！\\nクーポンの取得状況がリセットされ、再び最初から全て取得できるようになりました🎉");
    } else {
      alert("クーポンを使用しました！スタンプカードが新しくなりました。\\nまた新しい写真を撮ってスタンプを集められます！");
    }

    // 画面を更新する
    renderSpots('spotList');
    renderSpots('spotListMap');
    updateUI();
  }
}