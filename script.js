
// ── GAME STATE ────────────────────────────────────────────────
const S = {
  char:     'girl',
  hunger:   60,
  happy:    80,
  patCount: 0,
  equipped: { tops: 0, hair: 0 },
};

// ── SPEECH BUBBLE ─────────────────────────────────────────────
let speechTimer = null;
let bubbleVisible = false;

function say(text, duration = 2200) {
  const b = document.getElementById('bubble');
  b.textContent = text;
  b.classList.add('show');
  bubbleVisible = true;
  if (speechTimer) clearTimeout(speechTimer);
  speechTimer = setTimeout(() => {
    b.classList.remove('show');
    bubbleVisible = false;
  }, duration);
}

// ── PARTICLE HEARTS ───────────────────────────────────────────
function heart(emoji = '♡') {
  const area = document.getElementById('hearts');
  const el   = document.createElement('span');
  el.className  = 'hp';
  el.textContent = emoji;
  el.style.left  = (Math.random() * 50 - 25) + 'px';
  el.style.animationDelay = (Math.random() * 0.25) + 's';
  area.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ── PAT (click scene) ─────────────────────────────────────────
function handlePat(e) {
  // Only trigger if clicking on scene or character, not on food tray, etc.
  if (!e.target.closest('#cw') && e.target.id !== 'scene') return;

  S.patCount++;
  S.happy = Math.min(100, S.happy + 8);

  const wrap = document.getElementById('cw');
  wrap.classList.remove('pat-a');
  void wrap.offsetWidth; // force reflow to restart animation
  wrap.classList.add('pat-a');

  const lines = DLG[S.char].pat;
  say(lines[S.patCount % lines.length]);
  heart('♡');
  if (S.patCount % 3 === 0) heart('★');

  drawChar(true);
  setTimeout(() => drawChar(false), 300);
  updateStats();
}

// ── DRAG FOOD ─────────────────────────────────────────────────
let dragType  = '';
let dragEmoji = '';

function dragFood(e, type, emoji) {
  dragType  = type;
  dragEmoji = emoji;
  e.dataTransfer.setData('text', type);
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!dragType) return;

  const lines = DLG[S.char][dragType];
  say(lines[Math.floor(Math.random() * lines.length)]);

  const wrap = document.getElementById('cw');
  wrap.classList.remove('feed-a');
  void wrap.offsetWidth;
  wrap.classList.add('feed-a');

  // Stat changes per food type
  if (dragType === 'meal')  { S.hunger = Math.min(100, S.hunger + 40); S.happy = Math.min(100, S.happy + 10); heart('✦'); }
  if (dragType === 'snack') { S.hunger = Math.min(100, S.hunger + 20); S.happy = Math.min(100, S.happy + 15); heart('⊹'); }
  if (dragType === 'fruit') { S.hunger = Math.min(100, S.hunger + 15); S.happy = Math.min(100, S.happy + 20); heart('✿'); }
  if (dragType === 'love')  { S.happy  = Math.min(100, S.happy  + 30); heart('♡'); heart('♡'); }

  dragType = '';
  drawChar();
  updateStats();
}

// ── CLOSE BUTTON ──────────────────────────────────────────────
function doClose() {
  say(S.char === 'girl' ? "Wait, don't go!" : "Hey! Come back! :(");
}


// ── WARDROBE TABS ─────────────────────────────────────────────
let currentTab = 'tops';
const TAB_ORDER = ['tops', 'hair'];

function setTab(t) {
  currentTab = t;
  document.querySelectorAll('.wtab').forEach((el, i) => {
    el.classList.toggle('active', TAB_ORDER[i] === t);
  });
  renderWardrobe();
}

function renderWardrobe() {
  const grid  = document.getElementById('wardGrid');
  const items = WARDROBE[S.char][currentTab] || [];
  grid.innerHTML = '';

  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'ward-item' + (S.equipped[currentTab] === i ? ' equipped' : '');
    div.innerHTML = `<span style="font-size:18px">${item.emoji}</span>
                     <span class="wlabel">${item.label.toUpperCase()}</span>`;
    div.onclick = () => {
      S.equipped[currentTab] = i;
      renderWardrobe();
      drawChar();
      // Optional: character reacts to outfit change
      const reactions = {
        girl: ["How do I look?? ♡", "Awww! ♡", "Woaahh!!", "I love this!! Mwa!"],
      };
      const r = reactions[S.char];
      say(r[Math.floor(Math.random() * r.length)]);
    };
    grid.appendChild(div);
  });

  // Custom placeholder slot
  const add = document.createElement('div');
  add.className = 'ward-item none-item';
  add.title     = 'Add your custom item in data.js!';
  add.innerHTML = `<span style="font-size:16px">+</span><span class="wlabel">YOURS</span>`;
  grid.appendChild(add);
}

// ── STATS ─────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('hbar').style.width = S.hunger + '%';
  document.getElementById('pbar').style.width = S.happy  + '%';

  const moods = {
    girl: { hi: '( ˘ᵕ˘ )♡', mid: '( •ᵕ• )', lo: '(;・ェ・)', hn: '(˃﹏˂)' },
  };
  const m = moods[S.char];
  const chip = document.getElementById('mood');

  if      (S.hunger < 30) chip.textContent = m.hn;
  else if (S.happy  > 70) chip.textContent = m.hi;
  else if (S.happy  > 40) chip.textContent = m.mid;
  else                    chip.textContent = m.lo;
}

// ── IDLE LOOP ─────────────────────────────────────────────────
// Runs every 5 seconds: stats decay, random idle dialogue
setInterval(() => {
  if (bubbleVisible) return;
  S.hunger = Math.max(0, S.hunger - 2);
  S.happy  = Math.max(0, S.happy  - 1);

  if (Math.random() < 0.28) {
    const pool = S.hunger < 30 ? DLG[S.char].hungry : DLG[S.char].idle;
    say(pool[Math.floor(Math.random() * pool.length)], 1700);
  }

  drawChar();
  updateStats();
}, 5000);

// ── INIT ──────────────────────────────────────────────────────
switchChar('girl');
