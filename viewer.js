
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

function formatDateToYMD(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "invalid-date";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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
  const safeDate = formatDateToYMD(dateStr);
  const imagePath = `sample/images/${safeDate}.png`;
  return `<img src="${imagePath}" alt="絵日記イメージ" onerror="this.style.display='none';" />`;
}


function renderPrompt(art) {
  if (!art || !art.フォーマット) return "";
  const nyamlText = jsyaml.dump({ おえかき: art }, { allowUnicode: true, sortKeys: false });

  return `
    <details>
      <summary>📝 NYAML形式でおえかきプロンプト表示</summary>
      <pre>${nyamlText}</pre>
    </details>
  `;
}

