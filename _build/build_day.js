// Build tool (not part of the deliverable): assembles dayN.html from the validated
// day1.html scaffold by swapping the header text, footer nav, storage key, and the
// day-specific "middle" JS block (step generators + TOPICS array).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(ROOT, 'day1.html'), 'utf8');

const START_MARK = '/* ---------- 步骤数据生成 ---------- */';
const END_MARK = '/* ---------- 播放器 ---------- */';

const startIdx = template.indexOf(START_MARK);
const endIdx = template.indexOf(END_MARK);
if (startIdx === -1 || endIdx === -1) throw new Error('markers not found in day1.html');

const before = template.slice(0, startIdx);
const after = template.slice(endIdx);

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

for (const day of manifest) {
  const middlePath = path.join(__dirname, `day${day.n}.middle.js`);
  const middle = fs.readFileSync(middlePath, 'utf8');

  let html = before + middle + '\n\n' + after;

  html = html.replace(
    /<title>Day 1 · 基础算法（上）— 牛客刷题训练营<\/title>/,
    `<title>Day ${day.n} · ${day.category} — 牛客刷题训练营</title>`
  );
  html = html.replace(
    /<h1>Day 1 · 基础算法（上）<\/h1>/,
    `<h1>Day ${day.n} · ${day.category}</h1>`
  );
  html = html.replace(
    /<p>对应牛客题库「基础算法」分类前半部分（BISHI1–21，共 21 题）<\/p>/,
    `<p>${day.subtitle}</p>`
  );
  html = html.replace(
    /<h1 class="page-title">基础算法（上）：5 个核心套路<\/h1>/,
    `<h1 class="page-title">${day.pageTitle}</h1>`
  );
  html = html.replace(
    /<span class="progress-text" id="progressText">0 \/ 5 类已完成<\/span>/,
    `<span class="progress-text" id="progressText">0 / ${day.topicCount} 类已完成</span>`
  );
  html = html.replace(
    /<footer class="pagefoot">\s*<span><\/span>\s*<a href="day2\.html">Day 2：基础算法（下）→<\/a>\s*<\/footer>/,
    day.footer
  );
  html = html.replace(
    /const STORAGE_KEY = 'nc-cram-day1';/,
    `const STORAGE_KEY = 'nc-cram-day${day.n}';`
  );

  fs.writeFileSync(path.join(ROOT, `day${day.n}.html`), html, 'utf8');
  console.log(`wrote day${day.n}.html (${html.length} bytes)`);
}
