
document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const yamlText = event.target.result;
    try {
      const data = jsyaml.load(yamlText);
      renderDiary(data);
    } catch (error) {
      alert("読み込みに失敗しました: " + error);
    }
  };
  reader.readAsText(file);
});

function renderDiary(data) {
  const container = document.getElementById("viewer");
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";

  const date = typeof data.にっきび === "string"
    ? data.にっきび
    : data?.おえかき?.にっきび || "（日付なし）";
  const mood = data.きょうのきぶん || "？";
  const name = data.にゃまえ || "ななし猫";

  card.innerHTML = `
    <h2>${date} の ${name} 🐱</h2>
    <p><strong>きょうのきぶん:</strong> ${mood}</p>
    <p><strong>やったこと:</strong></p>
    <ul>
      ${renderActivities(data.やったこと)}
    </ul>
    ${renderImage(date)}
    ${renderPrompt(data.おえかき)}
  `;

  container.appendChild(card);
}

function renderActivities(obj) {
  if (!obj) return "<li>（なし）</li>";
  const items = [];
  if (Array.isArray(obj)) {
    obj.forEach(i => items.push(`<li>${JSON.stringify(i)}</li>`));
  } else {
    for (const key in obj) {
      const v = obj[key];
      if (Array.isArray(v)) {
        v.forEach(entry => {
          items.push(`<li>${key}: ${entry.じかん} / ${entry.りょう || ''}</li>`);
        });
      } else if (typeof v === "object") {
        items.push(`<li>${key}: ${JSON.stringify(v)}</li>`);
      } else {
        items.push(`<li>${key}: ${v}</li>`);
      }
    }
  }
  return items.join("\n");
}

function renderImage(dateStr) {
  const safeDate = dateStr.replace(/[^0-9a-zA-Z_-]/g, "-"); // スラッシュやスペース対策
  const imagePath = `sample/images/${safeDate}.png`;
  return `<img src="${imagePath}" alt="絵日記イメージ" onerror="this.style.display='none';" />`;
}

function renderPrompt(art) {
  if (!art || !art.フォーマット) return "";
  const fmt = art.フォーマット;

  const lines = [
    "A cute illustration of a black cat",
    fmt.デフォルメ === "あり" ? "fully stylized in chibi style" :
    fmt.デフォルメ === "ちょっとだけ" ? "slightly deformed, semi-realistic style" :
    "drawn realistically",
    `with ${fmt.色設定?.毛色 || "black"} fur and ${fmt.色設定?.めの色 || "yellow"} eyes.`,
    `The cat has a ${fmt.形設定?.尻尾 || "normal"} tail and a ${fmt.形設定?.体型 || "standard"} body.`,
    `It is ${fmt.ポーズ設定?.姿勢 || "sitting"}, looking ${fmt.ポーズ設定?.向き || "forward"},`,
    `with an expression of ${fmt.ポーズ設定?.表情 || "neutral"}.`,
    `The background is ${fmt.背景設定?.場所 || "a room"} during ${fmt.背景設定?.時間帯 || "daytime"}.`
  ];

  return `<details><summary>🎨 絵の生成プロンプトを表示</summary><pre>${lines.join(" ")}</pre></details>`;
}
