let table;
let allQuestions = [];
let quiz = [];
let current = 0;
let userAnswers = [];
let mode = 'loading'; // 'loading', 'quiz', 'result'
let optionRects = [];
let resultScore = 0;
let confetti = [];
let nameInput, startButton, playerName = '';
let bgBlobs = [];

function preload() {
  // 載入題庫 CSV（與 index.html 同目錄）
  table = loadTable('questions.csv', 'csv', 'header', () => {}, (err) => {
    console.error('載入 CSV 失敗：', err);
  });
}

function setup() {
  resizeQuizCanvas();
  textFont('Arial');
  if (table && table.getRowCount() > 0) {
    for (let r of table.rows) {
      allQuestions.push({
        question: r.get('question'),
        A: r.get('A'),
        B: r.get('B'),
        C: r.get('C'),
        D: r.get('D'),
        answer: (r.get('answer') || '').trim().toUpperCase(),
        feedback: r.get('feedback') || ''
      });
    }
    // 先準備題庫，顯示開始畫面
    pickRandomQuestions();
    mode = 'start';
    // 建立開始畫面的輸入與按鈕
    createStartUI();
    // 初始化背景的漂浮色塊
    initBackgroundBlobs();
  } else {
    mode = 'error';
  }
}

function windowResized() {
  resizeQuizCanvas();
  positionStartUI();
}

function resizeQuizCanvas() {
  let w = Math.floor(windowWidth * 0.8);
  let h = Math.floor(windowHeight * 0.9);
  resizeCanvas(w, h);
  // 讓 canvas 置中
  let cnv = document.querySelector('canvas');
  if (cnv) {
    cnv.style.display = 'block';
    cnv.style.marginLeft = 'auto';
    cnv.style.marginRight = 'auto';
    cnv.style.position = 'absolute';
    cnv.style.left = '50%';
    cnv.style.top = '50%';
    cnv.style.transform = 'translate(-50%, -50%)';
  }
}

function pickRandomQuestions() {
  let idx = [];
  for (let i = 0; i < allQuestions.length; i++) idx.push(i);
  idx = shuffle(idx);
  quiz = idx.slice(0, min(4, idx.length)).map(i => allQuestions[i]);
  current = 0;
  userAnswers = [];
}

function draw() {
  // 背景動態：豐富的漸層 + 漂浮色塊 + 微粒
  drawRichBackground();

  if (mode === 'loading') {
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text('載入題庫中…', width / 2, height / 2);
  } else if (mode === 'error') {
    fill(255, 80, 80);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('無法載入題庫，請確認 questions.csv 存在於專案目錄。', width / 2, height / 2);
  } else if (mode === 'start') {
    drawStartScreen();
  } else if (mode === 'quiz') {
    drawQuiz();
  } else if (mode === 'result') {
    drawResult();
  }
}

function createStartUI(){
  // 移除舊的（若存在）
  removeStartUI();
  // 建立輸入與按鈕 (p5 DOM)
  nameInput = createInput('');
  nameInput.attribute('placeholder','輸入姓名（選填）');
  nameInput.style('padding','8px 10px');
  nameInput.style('font-size','16px');
  nameInput.style('border-radius','6px');
  nameInput.style('text-align','center');

  startButton = createButton('開始測驗');
  startButton.style('padding','10px 16px');
  startButton.style('font-size','16px');
  startButton.style('background-color','#3c8cff');
  startButton.style('color','#fff');
  startButton.style('border','none');
  startButton.style('border-radius','8px');
  startButton.style('text-align','center');

  startButton.mousePressed(() => {
    playerName = nameInput.value().trim() || '玩家';
    removeStartUI();
    pickRandomQuestions();
    mode = 'quiz';
  });

  positionStartUI();
}

function positionStartUI(){
  if (!nameInput || !startButton) return;
  // 與 drawStartScreen 使用相同的卡片尺寸與位置，確保欄位在卡片內
  let cardW = min(800, width * 0.85);
  let cardH = min(320, height * 0.45);
  let cx = width/2 - cardW/2;
  let cy = height/2 - cardH/2;
  // 微調輸入欄靠右一點，並縮小寬度避免超出白框
  let inputMarginL = Math.round(cardW * 0.22); // 右移
  let inputMarginR = Math.round(cardW * 0.08);
  // 引入縮放因子，讓按鈕大小與位置能隨視窗縮放
  let scale = min(width / 900, height / 700, 1.2);
  let inputH = 38 * scale;
  nameInput.position(cx + inputMarginL, cy + Math.round(cardH * 0.38));
  nameInput.size(cardW - inputMarginL - inputMarginR, inputH);
  nameInput.style('font-size', (16 * scale) + 'px');
  nameInput.style('padding', (8 * scale) + 'px ' + (10 * scale) + 'px');
  nameInput.style('border-radius', (6 * scale) + 'px');

  let btnW = 160 * scale;
  let btnH = 46 * scale;
  startButton.size(btnW, btnH);
  startButton.position(cx + (cardW - btnW) / 2, cy + cardH - btnH - (18 * scale));
  startButton.style('font-size', (16 * scale) + 'px');
}

function removeStartUI(){
  if (nameInput) { nameInput.remove(); nameInput = null; }
  if (startButton) { startButton.remove(); startButton = null; }
}

function drawStartScreen(){
  // 簡單的歡迎卡
  let cardW = min(800, width * 0.85);
  let cardH = min(320, height * 0.45);
  let cx = width / 2 - cardW / 2;
  let cy = height / 2 - cardH / 2;

  push();
  noStroke();
  fill(255, 245);
  rect(cx, cy, cardW, cardH, 16);
  pop();

  // 引入縮放因子
  let scale = min(width / 900, height / 700, 1.2);

  fill(30);
  textSize(Math.round(28 * scale));
  textAlign(CENTER, TOP);
  text('歡迎來到測驗', width/2, cy + Math.round(20 * scale));

  // 不顯示多餘說明文字（已移除）
  textSize(Math.round(16 * scale));
  textAlign(CENTER, TOP);

  // 若輸入框存在，確保位置（會對齊至卡片下方）
  positionStartUI();
}

function drawQuiz() {
  if (!quiz || quiz.length === 0) return;
  let q = quiz[current];

  // 畫布縮放因子
  let scale = min(width/900, height/700, 1.2);

  // 卡片
  let cardW = min(800, width * 0.85);
  let cardH = min(500, height * 0.75);
  let cx = width / 2 - cardW / 2;
  let cy = height / 2 - cardH / 2;

  // card background
  push();
  noStroke();
  fill(255, 250);
  rect(cx, cy, cardW, cardH, 16);
  pop();

  // 題目文字自適應
  let margin = Math.round(24 * scale);
  fill(30);
  textSize(Math.round(20 * scale));
  textAlign(LEFT, TOP);
  text('題目 ' + (current + 1) + ' / ' + quiz.length, cx + margin, cy + margin);
  textSize(Math.round(22 * scale));
  textStyle(BOLD);
  textLeading(Math.round(28 * scale));
  text(q.question, cx + margin, cy + Math.round(60 * scale), cardW - margin * 2);
  textStyle(NORMAL);

  // 選項自適應
  let opts = ['A', 'B', 'C', 'D'];
  optionRects = [];
  let optH = Math.round(56 * scale);
  let optGap = Math.round(16 * scale);
  for (let i = 0; i < opts.length; i++) {
    let ox = cx + margin;
    let oy = cy + Math.round(160 * scale) + i * (optH + optGap);
    let ow = cardW - margin * 2;

    // hover
    let hovered = (mouseX >= ox && mouseX <= ox + ow && mouseY >= oy && mouseY <= oy + optH);
    push();
    stroke(200);
    if (hovered) {
      fill(240, 250, 255);
      strokeWeight(1.5);
      stroke(80, 150, 255);
    } else {
      fill(245);
    }
    rect(ox, oy, ow, optH, 10 * scale);
    pop();

    fill(30);
    textSize(Math.round(18 * scale));
    textAlign(LEFT, CENTER);
    let label = opts[i] + '. ' + q[opts[i]];
    text(label, ox + Math.round(14 * scale), oy + optH / 2, ow - Math.round(28 * scale));

    optionRects.push({x: ox, y: oy, w: ow, h: optH, id: opts[i]});
  }

  // 底部進度 & 提示自適應
  fill(80);
  textSize(Math.round(14 * scale));
  textAlign(CENTER, BOTTOM);
  text('請點選一個選項以作答', cx + cardW/2, cy + cardH - margin);
}

function mousePressed() {
  if (mode === 'quiz') {
    for (let r of optionRects) {
      if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
        // 記錄答案
        userAnswers.push(r.id);
        // 簡單點擊回饋（閃光）
        burst(mouseX, mouseY);
        // 下一題或結算
        if (current < quiz.length - 1) {
          current++;
        } else {
          computeResult();
        }
        break;
      }
    }
  } else if (mode === 'result') {
    // 檢查是否按到重試按鈕（座標需與 drawResult 一致）
    let w = min(800, width * 0.8);
    let h = min(520, height * 0.7);
    let bw = 140;
    let bh = 46;
    let bx = (width + w) / 2 - bw - 24;
    let by = (height + h) / 2 - bh - 18;
    if (mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh) {
      // 回到初始登入畫面
      pickRandomQuestions();
      confetti = [];
      mode = 'start';
      createStartUI();
    }
  }
}

function computeResult() {
  resultScore = 0;
  for (let i = 0; i < quiz.length; i++) {
    let correct = (quiz[i].answer || '').toUpperCase();
    let given = (userAnswers[i] || '').toUpperCase();
    if (given === correct) resultScore++;
  }
  // 若表現不錯，產生慶祝的 confetti
  if (resultScore / quiz.length >= 0.75) {
    for (let i = 0; i < 120; i++) confetti.push(new Confetti(random(width), random(-200, -20)));
  }
  mode = 'result';
}

// 動態動畫狀態
let resultAnim = { t: 0, stars: [], balls: [], rings: [], drops: [] };

function drawResult() {
  push();
  fill(255, 245);
  noStroke();
  let w = min(800, width * 0.8);
  let h = min(520, height * 0.7);
  rect((width - w) / 2, (height - h) / 2, w, h, 18);
  pop();

  // 畫布縮放因子
  let scale = min(width/900, height/700, 1.2);
  // 整體上移量
  let yOffset = -60 * scale;

  let ratio = resultScore / quiz.length;
  let mainText = '';
  let feedback = '';
  if (ratio === 1) {
    mainText = '太棒了！';
    feedback = '完美！你把所有題目都答對了，太棒了！';
    drawStarAnim(width/2, height/2-60 * scale + yOffset);
    drawConfettiAnim();
  } else if (ratio >= 0.75) {
    mainText = '很棒，繼續努力！';
    feedback = '表現很好，繼續保持！';
    drawBouncyBallsAnim(width/2, height/2-60 * scale + yOffset);
  } else if (ratio >= 0.5) {
    mainText = '不錯，再加油！';
    feedback = '還不錯，多練習可以更好。';
    drawRingsAnim(width/2, height/2-60 * scale + yOffset);
  } else {
    mainText = '別氣餒，下次會更好！';
    feedback = '需要加強，建議再複習題目後重試。';
    drawRainAnim(width/2, height/2-60 * scale + yOffset);
  }

  // 標題與分數
  fill(30);
  textAlign(CENTER, TOP);
  textSize(Math.round(28 * scale));
  text('測驗結果', width / 2, height / 2 - 160 * scale + yOffset);
  textSize(Math.round(48 * scale));
  text(resultScore + ' / ' + quiz.length, width / 2, height / 2 - 100 * scale + yOffset);

  // 動態主標語
  textSize(Math.round(38 * scale));
  fill(40, 90, 255);
  text(mainText, width/2, height/2 - 40 * scale + yOffset);

  // 鼓勵話語
  textSize(Math.round(18 * scale));
  textAlign(LEFT, TOP);
  let feedbackLeft = (width - w) / 2 + 24 * scale;
  fill(30);
  text(feedback, feedbackLeft, height / 2 + 10 * scale + yOffset, w - 80 * scale);

  // 詳細回饋：每題靠左顯示，並限制每行寬度
  textAlign(LEFT, TOP);
  let left = (width - w) / 2 + 24 * scale;
  let top = height / 2 + 40 * scale + yOffset;
  textSize(Math.round(16 * scale));
  for (let i = 0; i < quiz.length; i++) {
    let y = top + i * 64 * scale + 40 * scale;
    let q = quiz[i];
    let given = userAnswers[i] || '-';
    let correct = q.answer || '-';
    let ok = (given.toUpperCase() === correct.toUpperCase());
    fill(ok ? color(30, 140, 40) : color(180, 40, 40));
    let line = (i + 1) + '. 你: ' + given + '  正確: ' + correct;
    text(line, left, y, w - 60 * scale);
    // 顯示回饋說明（灰色、小一點）
    fill(90);
    textSize(Math.round(14 * scale));
    text(q.feedback || '', left, y + 22 * scale, w - 80 * scale);
    textSize(Math.round(16 * scale));
  }

  // 重試按鈕移到卡片右下角
  let bw = 140 * scale;
  let bh = 46 * scale;
  let bx = (width + w) / 2 - bw - 24 * scale;
  let by = (height + h) / 2 - bh - 18 * scale;
  push();
  fill(60, 130, 255);
  rect(bx, by, bw, bh, 10 * scale);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(Math.round(18 * scale));
  text('再試一次', bx + bw / 2, by + bh / 2);
  pop();

  // 動畫狀態累加
  resultAnim.t++;
}

// --- 動畫特效區 ---
function drawStarAnim(cx, cy) {
  // 星星閃爍
  if (!resultAnim.stars || resultAnim.stars.length !== 12) {
    resultAnim.stars = [];
    for (let i = 0; i < 12; i++) {
      let a = i * TWO_PI/12;
      let r = 90 + random(-10,10);
      resultAnim.stars.push({a, r, tw: random(0.8,1.2)});
    }
  }
  push();
  for (let i = 0; i < resultAnim.stars.length; i++) {
    let s = resultAnim.stars[i];
    let x = cx + cos(s.a) * s.r;
    let y = cy + sin(s.a) * s.r;
    let sz = 22 + sin(frameCount*0.12 + i*1.3)*8*s.tw;
    fill(255, 240, 80, 200);
    noStroke();
    star(x, y, sz*0.3, sz*0.7, 5);
  }
  pop();
}

function drawConfettiAnim() {
  // 彩色 confetti
  for (let c of confetti) {
    c.update();
    c.draw();
  }
}

function drawBouncyBallsAnim(cx, cy) {
  // 彩色圓點跳動
  if (!resultAnim.balls || resultAnim.balls.length !== 10) {
    resultAnim.balls = [];
    for (let i = 0; i < 10; i++) {
      resultAnim.balls.push({a: i*PI/5, r: 90+random(-10,10), c: color(random(80,255),random(80,255),random(80,255)), off: random(100)});
    }
  }
  for (let i = 0; i < resultAnim.balls.length; i++) {
    let b = resultAnim.balls[i];
    let x = cx + cos(b.a) * b.r;
    let y = cy + sin(b.a) * b.r + sin(frameCount*0.18 + b.off)*18;
    fill(b.c);
    noStroke();
    ellipse(x, y, 32 + sin(frameCount*0.1 + i)*6);
  }
}

function drawRingsAnim(cx, cy) {
  // 柔和圓環動畫
  if (!resultAnim.rings || resultAnim.rings.length !== 6) {
    resultAnim.rings = [];
    for (let i = 0; i < 6; i++) {
      resultAnim.rings.push({a: i*TWO_PI/6, r: 80+random(-8,8), c: color(120,180,255,90+random(60)), off: random(100)});
    }
  }
  noFill();
  strokeWeight(6);
  for (let i = 0; i < resultAnim.rings.length; i++) {
    let b = resultAnim.rings[i];
    let x = cx + cos(b.a) * b.r;
    let y = cy + sin(b.a) * b.r;
    stroke(b.c);
    ellipse(x, y, 48 + sin(frameCount*0.13 + b.off)*18);
  }
  strokeWeight(1);
}

function drawRainAnim(cx, cy) {
  // 雨滴/泡泡動畫
  if (!resultAnim.drops || resultAnim.drops.length !== 18) {
    resultAnim.drops = [];
    for (let i = 0; i < 18; i++) {
      resultAnim.drops.push({x: cx-90+random(180), y: cy-60+random(120), vy: random(1,2.5), r: random(10,22)});
    }
  }
  for (let i = 0; i < resultAnim.drops.length; i++) {
    let d = resultAnim.drops[i];
    d.y += d.vy;
    if (d.y > cy+90) { d.y = cy-60; d.x = cx-90+random(180); }
    fill(120,180,255, 120);
    noStroke();
    ellipse(d.x, d.y, d.r, d.r*1.2);
  }
}

// 畫星星
function star(x, y, r1, r2, n) {
  let angle = TWO_PI / n;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * r2;
    let sy = y + sin(a) * r2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * r1;
    sy = y + sin(a + halfAngle) * r1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// -- 視覺與特效函式 --------------------------------
function setGradientBackground() {
  // 簡單垂直漸層
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(18, 26, 42), color(36, 60, 120), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

// 更豐富的背景：漂浮色塊 + 微粒 + 漸層
let particles = [];
function initBackgroundBlobs(){
  bgBlobs = [];
  for (let i = 0; i < 6; i++){
    bgBlobs.push({
      x: random(-width*0.2, width*1.2),
      y: random(-height*0.2, height*1.2),
      sx: random(0.1, 0.6),
      sy: random(0.05,0.3),
      size: random(min(width,height)*0.4, min(width,height)*0.9),
      col: color(random(30,220), random(60,200), random(120,255), 80)
    });
  }
}

function drawRichBackground(){
  // 底層：深色漸層
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 18, 40), color(36, 60, 120), inter);
    stroke(c);
    line(0, y, width, y);
  }

  // 漂浮色塊（柔和、疊加）
  push();
  blendMode(ADD);
  noStroke();
  for (let i = 0; i < bgBlobs.length; i++){
    let b = bgBlobs[i];
    // 緩慢移動
    b.x += sin(frameCount * 0.002 + i) * b.sx;
    b.y += cos(frameCount * 0.001 + i*1.3) * b.sy;
    fill(red(b.col), green(b.col), blue(b.col), alpha(b.col));
    // 使用 ellipse 做出柔和的大色塊
    ellipse(b.x, b.y, b.size, b.size*0.6);
  }
  pop();

  // 微光粒子（前景）
  if (particles.length < 60) particles.push({x: random(width), y: random(height), r: random(0.6, 3.5), s: random(0.05, 0.6), a: random(10,40)});
  for (let p of particles) {
    p.y -= p.s;
    p.x += sin((frameCount + p.x) * 0.008) * 0.4;
    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
    noStroke();
    fill(255, p.a);
    circle(p.x, p.y, p.r);
  }
}

function burst(x, y) {
  for (let i = 0; i < 18; i++) {
    particles.push({x: x + random(-30,30), y: y + random(-10,10), r: random(1,3), s: random(1,4), a: random(40,200)});
  }
}

// Confetti 類別
class Confetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1.5, 1.5);
    this.vy = random(1, 4);
    this.size = random(6, 12);
    this.col = color(random(80,255), random(80,255), random(80,255));
    this.rot = random(TWO_PI);
    this.rotSpeed = random(-0.1,0.1);
    this.life = 300 + random(0,200);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.rot += this.rotSpeed;
    this.life -= 1;
  }
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rot);
    noStroke();
    fill(this.col);
    rectMode(CENTER);
    rect(0,0,this.size,this.size*0.6, 2);
    pop();
  }
}

// 小助手
function min(a,b){ return a<b?a:b; }
