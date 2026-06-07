
// --- NAVIGATION ---
function go(page, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('pg-' + page).classList.add('active');
  document.querySelectorAll('.nav-i').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');
  if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('open');
  window.scrollTo(0, 0);
}
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

// --- TOAST ---
function toast(msg, err) {
  const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast' + (err ? ' err' : '') + ' show';
  setTimeout(() => t.classList.remove('show'), 2600);
}

// --- MODAL ---
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// --- PROGRESS ---
let completed = new Set(JSON.parse(localStorage.getItem('javaU1_done') || '[]'));
let quizScore = parseInt(localStorage.getItem('javaU1_qs') || '0');
function saveProgress() {
  localStorage.setItem('javaU1_done', JSON.stringify([...completed]));
  localStorage.setItem('javaU1_qs', quizScore);
  const pct = Math.round(completed.size / TOPICS.length * 100);
  document.getElementById('prog-pct').textContent = pct + '%';
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('s-done').textContent = completed.size;
  document.getElementById('s-quiz').textContent = quizScore;
  document.getElementById('u1p').textContent = pct + '%';
}

// ------------------------------
//  LESSON PLAN DATA
// ------------------------------
const TOPICS = [
  { hr: 1, topic: "Overview of OOP & Paradigms", concepts: "Procedural vs OO approach, OOP principles", activity: "Lecture + Discussion" },
  { hr: 2, topic: "Features of OOP & Java Buzzwords", concepts: "Encapsulation, Inheritance, Polymorphism, Abstraction; Simple, Secure, Portable, Robust", activity: "Lecture + Quiz" },
  { hr: 3, topic: "JVM, JDK & Programming Structures", concepts: "JVM architecture, JDK vs JRE, Compilation & Execution, class/main", activity: "Lecture + Demo" },
  { hr: 4, topic: "Classes, Data Types, Variables, Operators, Keywords, Control Statements", concepts: "Class definition, 8 primitives, 3 variable types, operators, if/switch/loops", activity: "Lecture + Lab" },
  { hr: 5, topic: "Wrapper Classes, Constructors, Methods, Access Specifiers, Arrays", concepts: "Autoboxing, constructor types, overloading, 4 access levels, 1D/2D arrays, java.util.Arrays", activity: "Lecture + Lab" },
  { hr: 6, topic: "JavaDoc Comments & I/O Classes", concepts: "Javadoc tags, Scanner, BufferedReader, PrintWriter, System.in/out/err", activity: "Lecture + Mini Project" }
];
function renderLP() {
  const tb = document.getElementById('lp-body');
  const topicIds = ['oop-paradigms', 'jvm-jdk', 'classes-types', 'control-statements', 'wrapper-constructors', 'arrays-io'];
  tb.innerHTML = TOPICS.map((t, i) => `<tr>
    <td><input type="checkbox" class="chk" ${completed.has(i) ? 'checked' : ''} onchange="toggleDone(${i},this)"></td>
    <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--accent);">${t.hr}</td>
    <td style="font-weight:600;color:#fff;">${t.topic}</td>
    <td style="font-size:12px;color:var(--text2);">${t.concepts}</td>
    <td><span class="badge badge-p">${t.activity}</span></td>
    <td><button class="btn btn-s btn-sm" onclick="openTopic('${topicIds[i] || ''}')">&#128214; View Topic</button></td>
  </tr>`).join('');
}
function toggleDone(i, el) {
  if (el.checked) completed.add(i); else completed.delete(i);
  saveProgress();
}

// ------------------------------
//  NOTES
// ------------------------------
let notes = JSON.parse(localStorage.getItem('javaU1_notes') || '[]');
function renderNotes() {
  const q = document.getElementById('note-search').value.toLowerCase();
  const grid = document.getElementById('note-grid');
  const empty = document.getElementById('note-empty');
  const filtered = notes.filter(n => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  if (!filtered.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = filtered.map((n, i) => `<div class="note-card">
    <button class="n-del" onclick="delNote(${i})">&#10005;</button>
    <div class="n-title">${esc(n.title)}</div>
    <div class="n-unit">${esc(n.topic)}</div>
    <div class="n-body">${esc(n.content)}</div>
  </div>`).join('');
}
function saveNote() {
  const t = document.getElementById('n-title').value.trim();
  const c = document.getElementById('n-content').value.trim();
  const tp = document.getElementById('n-topic').value;
  if (!t || !c) { toast('Title and content required', 1); return; }
  notes.unshift({ title: t, content: c, topic: tp, date: new Date().toISOString() });
  localStorage.setItem('javaU1_notes', JSON.stringify(notes));
  document.getElementById('n-title').value = ''; document.getElementById('n-content').value = '';
  closeModal('note-modal'); renderNotes(); toast('Note saved!');
}
function delNote(i) { notes.splice(i, 1); localStorage.setItem('javaU1_notes', JSON.stringify(notes)); renderNotes(); }
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'); }

// ------------------------------
//  MIND MAP (SVG)
// ------------------------------
function renderMindMap() {
  const viewport = document.getElementById('mm-viewport');
  const cx = 550, cy = 350, r1 = 200, r2 = 150;
  const branches = [
    { label: "OOP Concepts", color: "#34d399", subs: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"], page: "visualize" },
    { label: "Java Basics", color: "#fbbf24", subs: ["JVM/JDK/JRE", "Buzzwords", "Program Structure"], page: "visualize" },
    { label: "Data & Types", color: "#60a5fa", subs: ["8 Primitives", "Variables", "Operators", "Keywords"], page: "visualize" },
    { label: "Classes", color: "#f472b6", subs: ["Types of Classes", "Constructors", "Methods", "Access Specifiers"], page: "classdiagram" },
    { label: "Control Flow", color: "#a78bfa", subs: ["if/else", "switch", "for/while", "break/continue"], page: "flowchart" },
    { label: "Arrays & I/O", color: "#fb923c", subs: ["1D/2D Arrays", "java.util.Arrays", "Scanner", "BufferedReader"], page: "programs" }
  ];
  let html = '';
  // Glow filter
  html += `<defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;

  // Connection lines from center to L1 (drawn first so behind nodes)
  branches.forEach((b, i) => {
    const a = (i / branches.length) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(a) * 60; const y1 = cy + Math.sin(a) * 60;
    const x2 = cx + Math.cos(a) * r1; const y2 = cy + Math.sin(a) * r1;
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${b.color}" stroke-width="2" opacity="0.35"/>`;
  });

  // L1 nodes and L2 branches
  branches.forEach((b, i) => {
    const a = (i / branches.length) * Math.PI * 2 - Math.PI / 2;
    const x2 = cx + Math.cos(a) * r1; const y2 = cy + Math.sin(a) * r1;

    // L2 connection lines (drawn before L2 nodes)
    b.subs.forEach((s, j) => {
      const sa = a + (j - (b.subs.length - 1) / 2) * 0.32;
      const x3 = cx + Math.cos(sa) * (r1 + r2); const y3 = cy + Math.sin(sa) * (r1 + r2);
      html += `<line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}" stroke="${b.color}" stroke-width="1.5" opacity="0.25"/>`;
    });

    // L1 node group (clickable)
    html += `<g class="mm-node" onclick="go('${b.page}',null)" onmouseenter="mmShowTip(event,'${b.label}  Click to explore')" onmouseleave="mmHideTip()">`;
    html += `<rect x="${x2 - 60}" y="${y2 - 16}" width="120" height="32" rx="10" fill="${b.color}18" stroke="${b.color}" stroke-width="1.5"/>`;
    html += `<text x="${x2}" y="${y2 + 5}" text-anchor="middle" fill="${b.color}" font-size="12" font-family="Space Grotesk,sans-serif" font-weight="700">${b.label}</text>`;
    html += `</g>`;

    // L2 sub-nodes
    b.subs.forEach((s, j) => {
      const sa = a + (j - (b.subs.length - 1) / 2) * 0.32;
      const x3 = cx + Math.cos(sa) * (r1 + r2); const y3 = cy + Math.sin(sa) * (r1 + r2);
      html += `<g class="mm-node" onmouseenter="mmShowTip(event,'${s}')" onmouseleave="mmHideTip()">`;
      html += `<rect x="${x3 - 52}" y="${y3 - 12}" width="104" height="24" rx="6" fill="${b.color}10" stroke="${b.color}" stroke-width="0.8"/>`;
      html += `<text x="${x3}" y="${y3 + 4}" text-anchor="middle" fill="#e2e8f0" font-size="10" font-family="Inter,sans-serif">${s}</text>`;
      html += `</g>`;
    });
  });

  // Center node (drawn last to be on top)
  html += `<g class="mm-node" onmouseenter="mmShowTip(event,'Unit I: Foundations of Java')" onmouseleave="mmHideTip()">`;
  html += `<circle cx="${cx}" cy="${cy}" r="60" fill="#34d39915" stroke="#34d399" stroke-width="2.5" filter="url(#glow)"/>`;
  html += `<circle cx="${cx}" cy="${cy}" r="55" fill="#0b0f19" stroke="none"/>`;
  html += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#34d399" font-size="14" font-family="Space Grotesk,sans-serif" font-weight="800">Foundations</text>`;
  html += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#fff" font-size="12" font-family="Space Grotesk,sans-serif" font-weight="700">of Java</text>`;
  html += `</g>`;

  viewport.innerHTML = html;
}

// --- MIND MAP INTERACTIVITY ---
let mmScale = 1, mmPanX = 0, mmPanY = 0;
let mmDragging = false, mmLastX = 0, mmLastY = 0;

function mmUpdateTransform() {
  const vp = document.getElementById('mm-viewport');
  if (vp) vp.setAttribute('transform', `translate(${mmPanX},${mmPanY}) scale(${mmScale})`);
}
function mmZoomIn() { mmScale = Math.min(mmScale * 1.25, 4); mmUpdateTransform(); }
function mmZoomOut() { mmScale = Math.max(mmScale / 1.25, 0.3); mmUpdateTransform(); }
function mmReset() { mmScale = 1; mmPanX = 0; mmPanY = 0; mmUpdateTransform(); }

function mmShowTip(e, text) {
  const tip = document.getElementById('mm-tooltip');
  const container = document.getElementById('mm-container');
  const rect = container.getBoundingClientRect();
  tip.textContent = text;
  tip.style.left = (e.clientX - rect.left + 12) + 'px';
  tip.style.top = (e.clientY - rect.top - 12) + 'px';
  tip.classList.add('show');
}
function mmHideTip() { document.getElementById('mm-tooltip').classList.remove('show'); }

function initMindMapInteractions() {
  const container = document.getElementById('mm-container');
  if (!container) return;

  // Mouse wheel zoom
  container.addEventListener('wheel', function (e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(4, mmScale * delta));
    if (newScale !== mmScale) {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      // Zoom towards mouse pointer
      mmPanX = mx - (mx - mmPanX) * (newScale / mmScale);
      mmPanY = my - (my - mmPanY) * (newScale / mmScale);
      mmScale = newScale;
      mmUpdateTransform();
    }
  }, { passive: false });

  // Mouse drag pan
  container.addEventListener('mousedown', function (e) {
    if (e.target.closest('.mm-controls')) return;
    mmDragging = true; mmLastX = e.clientX; mmLastY = e.clientY;
    container.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function (e) {
    if (!mmDragging) return;
    mmPanX += e.clientX - mmLastX; mmPanY += e.clientY - mmLastY;
    mmLastX = e.clientX; mmLastY = e.clientY; mmUpdateTransform();
  });
  window.addEventListener('mouseup', function () {
    mmDragging = false; container.style.cursor = 'grab';
  });

  // Touch support
  let touchDist = 0, touchMidX = 0, touchMidY = 0;
  container.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      mmDragging = true; mmLastX = e.touches[0].clientX; mmLastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      mmDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist = Math.sqrt(dx * dx + dy * dy);
      touchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      touchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }, { passive: false });
  container.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length === 1 && mmDragging) {
      mmPanX += e.touches[0].clientX - mmLastX; mmPanY += e.touches[0].clientY - mmLastY;
      mmLastX = e.touches[0].clientX; mmLastY = e.touches[0].clientY; mmUpdateTransform();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = dist / touchDist;
      const newScale = Math.max(0.3, Math.min(4, mmScale * delta));
      if (newScale !== mmScale) {
        const rect = container.getBoundingClientRect();
        const mx = touchMidX - rect.left;
        const my = touchMidY - rect.top;
        mmPanX = mx - (mx - mmPanX) * (newScale / mmScale);
        mmPanY = my - (my - mmPanY) * (newScale / mmScale);
        mmScale = newScale; mmUpdateTransform();
      }
      touchDist = dist;
    }
  }, { passive: false });
  container.addEventListener('touchend', function () { mmDragging = false; });
}

// ------------------------------
//  VISUALIZATIONS
// ------------------------------
const VIZ_DATA = [
  {
    title: "OOP Pillars  Real World Analogy", body: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;">
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent);"></div>
      <div style="font-size:32px;margin-bottom:10px;">&#128274;</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--accent);font-size:15px;margin-bottom:8px;">Encapsulation</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5;">Like a <strong style="color:var(--text);">medicine capsule</strong>  the drug is hidden inside, you only see the shell. Data is hidden, accessed through controlled methods.</div>
      <div style="background:var(--bg3);border-radius:8px;padding:10px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text2);">
        <span style="color:var(--accent4);">private</span> balance;<br>
        <span style="color:var(--accent);">public</span> getBalance()<br>
        <span style="color:var(--accent);">public</span> deposit()
      </div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent2);"></div>
      <div style="font-size:32px;margin-bottom:10px;">&#127793;</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--accent2);font-size:15px;margin-bottom:8px;">Inheritance</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5;">Like a <strong style="color:var(--text);">child inheriting traits</strong> from parents. A Car class passes properties to SportsCar and SUVCar.</div>
      <div style="background:var(--bg3);border-radius:8px;padding:10px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text2);">
        <span style="color:var(--accent2);">class</span> SportsCar <span style="color:var(--accent2);">extends</span> Car<br>
        { <span style="color:var(--accent3);">// gets all Car features</span> }
      </div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent3);"></div>
      <div style="font-size:32px;margin-bottom:10px;">&#128256;</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--accent3);font-size:15px;margin-bottom:8px;">Polymorphism</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5;">Like a <strong style="color:var(--text);">person playing many roles</strong>  same person, different behavior. One method name, many forms.</div>
      <div style="background:var(--bg3);border-radius:8px;padding:10px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text2);">
        area(<span style="color:var(--accent4);">int</span> r) <span style="color:var(--muted);">// circle</span><br>
        area(<span style="color:var(--accent4);">int</span> l, <span style="color:var(--accent4);">int</span> w) <span style="color:var(--muted);">// rectangle</span>
      </div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:var(--accent4);"></div>
      <div style="font-size:32px;margin-bottom:10px;">&#127912;</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--accent4);font-size:15px;margin-bottom:8px;">Abstraction</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5;">Like a <strong style="color:var(--text);">TV remote</strong>  you press buttons, but don't need to know the internal circuits. Hide complexity, show only what's needed.</div>
      <div style="background:var(--bg3);border-radius:8px;padding:10px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text2);">
        <span style="color:var(--accent4);">abstract</span> <span style="color:var(--accent2);">class</span> Shape {<br>
        &nbsp;&nbsp;<span style="color:var(--accent4);">abstract</span> area();<br>
        }
      </div>
    </div>
  </div>
  <div style="margin-top:16px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
    <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:#fff;font-size:14px;margin-bottom:10px;">&#128161; Quick Memory Trick</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;font-size:12px;color:var(--text2);">
      <div><span style="color:var(--accent);font-weight:700;">E</span>ncapsulation = <span style="color:var(--accent);">E</span>nvelope (wrap & hide)</div>
      <div><span style="color:var(--accent2);font-weight:700;">I</span>nheritance = <span style="color:var(--accent2);">I</span>nherit (pass down traits)</div>
      <div><span style="color:var(--accent3);font-weight:700;">P</span>olymorphism = <span style="color:var(--accent3);">P</span>erson (many roles)</div>
      <div><span style="color:var(--accent4);font-weight:700;">A</span>bstraction = <span style="color:var(--accent4);">A</span>ppliance (use, don't know internals)</div>
    </div>
  </div>`},
  {
  title:"JVM Architecture",
  body:`
  <div style="display:flex;justify-content:center;">
    <div style="max-width:320px;width:100%;text-align:center;">

      <div style="border:2px solid var(--accent3);border-radius:8px;padding:8px;">
        <b>.java</b>
      </div>

      <div style="margin:4px 0;color:var(--accent);">↓</div>

      <div style="border:2px solid var(--accent2);border-radius:8px;padding:8px;">
        <b>javac</b>
      </div>

      <div style="margin:4px 0;color:var(--accent);">↓</div>

      <div style="border:2px solid #f59e0b;border-radius:8px;padding:8px;">
        <b>.class</b>
      </div>

      <div style="margin:4px 0;color:var(--accent);">↓</div>

      <div style="border:2px solid var(--accent);border-radius:12px;padding:12px;">

        <div style="font-weight:700;color:var(--accent);margin-bottom:8px;">
          JVM
        </div>

        <div style="border:1px solid var(--accent2);border-radius:6px;padding:6px;margin-bottom:6px;">
          Class Loader
        </div>

        <div style="border:1px solid #10b981;border-radius:6px;padding:8px;margin-bottom:6px;">
          Method Area • Heap • JVM Stack<br>
          PC Register • Native Stack
        </div>

        <div style="border:1px solid #f59e0b;border-radius:6px;padding:6px;">
          Execution Engine<br>
          <span style="font-size:11px;color:var(--muted);">
            JIT • Interpreter • GC
          </span>
        </div>

      </div>

    </div>
  </div>
  `
},
  {
    title: "JDK &#8834; JRE &#8834; JVM", body: `<div style="display:flex;justify-content:center;"><div style="border:2px solid var(--accent);border-radius:16px;padding:20px;text-align:center;max-width:440px;width:100%;">
    <div style="font-weight:700;color:var(--accent);margin-bottom:10px;font-family:'Space Grotesk',sans-serif;">JDK (Development Tools + JRE)</div>
    <div style="border:2px solid var(--accent2);border-radius:12px;padding:16px;margin:0 auto;max-width:360px;">
      <div style="font-weight:700;color:var(--accent2);margin-bottom:8px;">JRE (Libraries + JVM)</div>
      <div style="border:2px solid var(--accent3);border-radius:8px;padding:14px;max-width:260px;margin:0 auto;">
        <div style="font-weight:700;color:var(--accent3);">JVM</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">Class Loader &bull; Verifier &bull; JIT &bull; GC</div>
      </div>
    </div>
  </div></div>`},
  {
    title: "Primitive Data Types", body: `<table class="tbl"><thead><tr><th>Type</th><th>Size</th><th>Default</th><th>Range</th></tr></thead><tbody>
    <tr><td style="color:var(--accent);">byte</td><td>1 byte</td><td>0</td><td>-128 to 127</td></tr>
    <tr><td style="color:var(--accent);">short</td><td>2 bytes</td><td>0</td><td>-32,768 to 32,767</td></tr>
    <tr><td style="color:var(--accent);">int</td><td>4 bytes</td><td>0</td><td>-2<sup>31</sup> to 2<sup>31</sup>-1</td></tr>
    <tr><td style="color:var(--accent);">long</td><td>8 bytes</td><td>0L</td><td>-2<sup>63</sup> to 2<sup>63</sup>-1</td></tr>
    <tr><td style="color:var(--accent2);">float</td><td>4 bytes</td><td>0.0f</td><td>6-7 decimal digits</td></tr>
    <tr><td style="color:var(--accent2);">double</td><td>8 bytes</td><td>0.0d</td><td>15 decimal digits</td></tr>
    <tr><td style="color:var(--accent3);">char</td><td>2 bytes</td><td>'\\u0000'</td><td>0 to 65,535</td></tr>
    <tr><td style="color:var(--accent4);">boolean</td><td>1 bit</td><td>false</td><td>true / false</td></tr>
  </tbody></table>`},
  {
    title: "Access Specifiers", body: `<table class="tbl"><thead><tr><th>Modifier</th><th>Same Class</th><th>Same Package</th><th>Subclass</th><th>World</th></tr></thead><tbody>
    <tr><td style="color:var(--accent4);">private</td><td style="color:#22c55e;">Yes</td><td style="color:#ef4444;">No</td><td style="color:#ef4444;">No</td><td style="color:#ef4444;">No</td></tr>
    <tr><td style="color:var(--accent2);">default</td><td style="color:#22c55e;">Yes</td><td style="color:#22c55e;">Yes</td><td style="color:#ef4444;">No</td><td style="color:#ef4444;">No</td></tr>
    <tr><td style="color:var(--accent3);">protected</td><td style="color:#22c55e;">Yes</td><td style="color:#22c55e;">Yes</td><td style="color:#22c55e;">Yes</td><td style="color:#ef4444;">No</td></tr>
    <tr><td style="color:var(--accent);">public</td><td style="color:#22c55e;">Yes</td><td style="color:#22c55e;">Yes</td><td style="color:#22c55e;">Yes</td><td style="color:#22c55e;">Yes</td></tr>
  </tbody></table>`},
  {
    title: "Variable Types", body: `<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:160px;text-align:center;">
      <div style="font-weight:700;color:var(--accent);margin-bottom:6px;">Local</div><div style="font-size:11px;color:var(--muted);">Inside method<br>No default value<br>Must init before use</div></div>
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:160px;text-align:center;">
      <div style="font-weight:700;color:var(--accent2);margin-bottom:6px;">Instance</div><div style="font-size:11px;color:var(--muted);">Inside class, outside method<br>Per-object copy<br>Gets default values</div></div>
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:160px;text-align:center;">
      <div style="font-weight:700;color:var(--accent3);margin-bottom:6px;">Static</div><div style="font-size:11px;color:var(--muted);">With static keyword<br>Shared across all objects<br>One copy in memory</div></div>
  </div>`},
  {
    title: "Constructor Types", body: `<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:160px;text-align:center;">
      <div style="font-weight:700;color:var(--accent);margin-bottom:6px;">Default</div><div style="font-size:11px;color:var(--muted);">No arguments<br>Sets default values<br>Auto-provided if none written</div></div>
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:160px;text-align:center;">
      <div style="font-weight:700;color:var(--accent2);margin-bottom:6px;">Parameterized</div><div style="font-size:11px;color:var(--muted);">Takes arguments<br>Sets custom values<br>Most commonly used</div></div>
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:160px;text-align:center;">
      <div style="font-weight:700;color:var(--accent3);margin-bottom:6px;">Copy</div><div style="font-size:11px;color:var(--muted);">Takes object as arg<br>Clones the object<br>Creates duplicate</div></div>
  </div>`},
  {
    title: "Wrapper Classes", body: `<table class="tbl"><thead><tr><th>Primitive</th><th>Wrapper</th><th>Example</th></tr></thead><tbody>
    <tr><td>int</td><td style="color:var(--accent);">Integer</td><td>Integer x = 100;</td></tr>
    <tr><td>double</td><td style="color:var(--accent);">Double</td><td>Double d = 3.14;</td></tr>
    <tr><td>char</td><td style="color:var(--accent);">Character</td><td>Character c = 'A';</td></tr>
    <tr><td>boolean</td><td style="color:var(--accent);">Boolean</td><td>Boolean b = true;</td></tr>
  </tbody></table><div style="margin-top:10px;font-size:12px;color:var(--text2);"><strong style="color:var(--accent);">Autoboxing:</strong> primitive &rarr; wrapper automatically &nbsp;|&nbsp; <strong style="color:var(--accent2);">Unboxing:</strong> wrapper &rarr; primitive automatically</div>`},
  {
    title: "Array Types", body: `<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:150px;text-align:center;">
      <div style="font-weight:700;color:var(--accent);margin-bottom:6px;">1D Array</div><div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);">[10, 20, 30, 40]</div></div>
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:150px;text-align:center;">
      <div style="font-weight:700;color:var(--accent2);margin-bottom:6px;">2D Array</div><div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);">[[1,2],[3,4]]</div></div>
    <div style="padding:16px;background:var(--bg3);border-radius:10px;border:1px solid var(--border);min-width:150px;text-align:center;">
      <div style="font-weight:700;color:var(--accent3);margin-bottom:6px;">Jagged</div><div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);">Rows of diff length</div></div>
  </div>`}
];
function renderViz() {
  document.getElementById('viz-list').innerHTML = VIZ_DATA.map((v, i) => `<div class="vis-box">
    <div class="vis-head" onclick="this.nextElementSibling.classList.toggle('open')">
      <div style="font-weight:600;color:#fff;font-size:13px;">${v.title}</div>
      <div style="color:var(--muted);font-size:11px;">&#9660;</div>
    </div>
    <div class="vis-body">${v.body}</div>
  </div>`).join('');
  // open first by default
  document.querySelector('.vis-body')?.classList.add('open');
}

// ------------------------------
//  FLOWCHARTS (SVG)
// ------------------------------
const FLOWS = {
  exec: `<svg viewBox="0 0 420 600" style="width:100%;max-width:420px;" preserveAspectRatio="xMidYMid meet">
  <defs><marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#64748b"/></marker></defs>
  <rect x="110" y="15" width="200" height="40" rx="20" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="210" y="40" text-anchor="middle" fill="#34d399" font-size="12" font-family="JetBrains Mono,monospace">Write .java file</text>
  <line x1="210" y1="55" x2="210" y2="85" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="110" y="85" width="200" height="40" rx="8" fill="#fbbf2422" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="210" y="110" text-anchor="middle" fill="#fbbf24" font-size="12" font-family="JetBrains Mono,monospace">javac compile</text>
  <line x1="210" y1="125" x2="210" y2="155" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <polygon points="210,155 290,185 210,215 130,185" fill="#60a5fa22" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="210" y="189" text-anchor="middle" fill="#60a5fa" font-size="11" font-family="JetBrains Mono,monospace">Success?</text>
  <line x1="210" y1="215" x2="210" y2="245" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="225" y="233" fill="#22c55e" font-size="10" font-family="JetBrains Mono,monospace">Yes</text>
  <rect x="110" y="245" width="200" height="40" rx="8" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="210" y="270" text-anchor="middle" fill="#34d399" font-size="12" font-family="JetBrains Mono,monospace">.class bytecode</text>
  <line x1="210" y1="285" x2="210" y2="315" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="110" y="315" width="200" height="40" rx="8" fill="#a78bfa22" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="210" y="340" text-anchor="middle" fill="#a78bfa" font-size="12" font-family="JetBrains Mono,monospace">JVM Class Loader</text>
  <line x1="210" y1="355" x2="210" y2="385" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="110" y="385" width="200" height="40" rx="8" fill="#60a5fa22" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="210" y="410" text-anchor="middle" fill="#60a5fa" font-size="12" font-family="JetBrains Mono,monospace">Bytecode Verify</text>
  <line x1="210" y1="425" x2="210" y2="455" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="110" y="455" width="200" height="40" rx="8" fill="#f472b622" stroke="#f472b6" stroke-width="1.5"/>
  <text x="210" y="480" text-anchor="middle" fill="#f472b6" font-size="12" font-family="JetBrains Mono,monospace">Execute (JIT+Int)</text>
  <line x1="210" y1="495" x2="210" y2="525" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <rect x="110" y="525" width="200" height="40" rx="20" fill="#22c55e22" stroke="#22c55e" stroke-width="1.5"/>
  <text x="210" y="550" text-anchor="middle" fill="#22c55e" font-size="12" font-family="JetBrains Mono,monospace">Output</text>
  <line x1="290" y1="185" x2="370" y2="185" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="320" y="180" fill="#ef4444" font-size="10" font-family="JetBrains Mono,monospace">No</text>
  <rect x="350" y="165" width="60" height="40" rx="8" fill="#ef444422" stroke="#ef4444" stroke-width="1.5"/>
  <text x="380" y="189" text-anchor="middle" fill="#ef4444" font-size="10" font-family="JetBrains Mono,monospace">Error</text>
</svg>`,
  ifelse: `<svg viewBox="0 0 460 420" style="width:100%;max-width:460px;" preserveAspectRatio="xMidYMid meet">
  <defs><marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#64748b"/></marker></defs>
  <rect x="170" y="15" width="120" height="36" rx="18" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="230" y="38" text-anchor="middle" fill="#34d399" font-size="11" font-family="JetBrains Mono,monospace">Start</text>
  <line x1="230" y1="51" x2="230" y2="77" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr2)"/>
  <polygon points="230,77 320,110 230,143 140,110" fill="#fbbf2422" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="230" y="114" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="JetBrains Mono,monospace">condition?</text>
  <line x1="140" y1="110" x2="70" y2="110" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="95" y="103" fill="#22c55e" font-size="10">True</text>
  <rect x="20" y="90" width="55" height="40" rx="6" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="47" y="114" text-anchor="middle" fill="#34d399" font-size="10" font-family="JetBrains Mono,monospace">if block</text>
  <line x1="320" y1="110" x2="390" y2="110" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="350" y="103" fill="#ef4444" font-size="10">False</text>
  <rect x="385" y="90" width="55" height="40" rx="6" fill="#ef444422" stroke="#ef4444" stroke-width="1.5"/>
  <text x="412" y="114" text-anchor="middle" fill="#ef4444" font-size="10" font-family="JetBrains Mono,monospace">else block</text>
  <line x1="47" y1="130" x2="47" y2="185" stroke="#64748b" stroke-width="1.5"/><line x1="47" y1="185" x2="230" y2="185" stroke="#64748b" stroke-width="1.5"/>
  <line x1="412" y1="130" x2="412" y2="185" stroke="#64748b" stroke-width="1.5"/><line x1="412" y1="185" x2="230" y2="185" stroke="#64748b" stroke-width="1.5"/>
  <line x1="230" y1="185" x2="230" y2="215" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr2)"/>
  <rect x="170" y="215" width="120" height="36" rx="18" fill="#60a5fa22" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="230" y="238" text-anchor="middle" fill="#60a5fa" font-size="11" font-family="JetBrains Mono,monospace">Continue</text>
</svg>`,
  forloop: `<svg viewBox="0 0 420 520" style="width:100%;max-width:420px;" preserveAspectRatio="xMidYMid meet">
  <defs><marker id="arr3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#64748b"/></marker></defs>
  <rect x="140" y="15" width="140" height="36" rx="18" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="210" y="38" text-anchor="middle" fill="#34d399" font-size="11" font-family="JetBrains Mono,monospace">init (int i=0)</text>
  <line x1="210" y1="51" x2="210" y2="81" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr3)"/>
  <polygon points="210,81 300,115 210,148 120,115" fill="#fbbf2422" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="210" y="119" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="JetBrains Mono,monospace">i &lt; n?</text>
  <line x1="210" y1="148" x2="210" y2="178" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr3)"/>
  <text x="225" y="164" fill="#22c55e" font-size="10">True</text>
  <rect x="140" y="178" width="140" height="36" rx="6" fill="#60a5fa22" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="210" y="201" text-anchor="middle" fill="#60a5fa" font-size="11" font-family="JetBrains Mono,monospace">loop body</text>
  <line x1="210" y1="214" x2="210" y2="244" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr3)"/>
  <rect x="140" y="244" width="140" height="36" rx="6" fill="#a78bfa22" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="210" y="267" text-anchor="middle" fill="#a78bfa" font-size="11" font-family="JetBrains Mono,monospace">i++ (update)</text>
  <line x1="140" y1="262" x2="70" y2="262" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="262" x2="70" y2="115" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="115" x2="120" y2="115" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr3)"/>
  <line x1="300" y1="115" x2="370" y2="115" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr3)"/>
  <text x="330" y="109" fill="#ef4444" font-size="10">False</text>
  <rect x="350" y="97" width="55" height="36" rx="18" fill="#ef444422" stroke="#ef4444" stroke-width="1.5"/>
  <text x="377" y="119" text-anchor="middle" fill="#ef4444" font-size="10" font-family="JetBrains Mono,monospace">Exit</text>
</svg>`,
  switch: `<svg viewBox="0 0 520 370" style="width:100%;max-width:520px;" preserveAspectRatio="xMidYMid meet">
  <defs><marker id="arr4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#64748b"/></marker></defs>
  <rect x="200" y="15" width="120" height="36" rx="18" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="260" y="38" text-anchor="middle" fill="#34d399" font-size="11" font-family="JetBrains Mono,monospace">switch(expr)</text>
  <line x1="260" y1="51" x2="260" y2="81" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr4)"/>
  <polygon points="260,81 350,115 260,148 170,115" fill="#fbbf2422" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="260" y="119" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="JetBrains Mono,monospace">match case?</text>
  <line x1="170" y1="115" x2="80" y2="175" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr4)"/>
  <text x="110" y="140" fill="#60a5fa" font-size="10">case 1</text>
  <rect x="30" y="175" width="90" height="30" rx="6" fill="#60a5fa22" stroke="#60a5fa" stroke-width="1.2"/>
  <text x="75" y="195" text-anchor="middle" fill="#60a5fa" font-size="10" font-family="JetBrains Mono,monospace">block 1; break</text>
  <line x1="210" y1="115" x2="210" y2="175" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr4)"/>
  <text x="220" y="150" fill="#a78bfa" font-size="10">case 2</text>
  <rect x="165" y="175" width="90" height="30" rx="6" fill="#a78bfa22" stroke="#a78bfa" stroke-width="1.2"/>
  <text x="210" y="195" text-anchor="middle" fill="#a78bfa" font-size="10" font-family="JetBrains Mono,monospace">block 2; break</text>
  <line x1="310" y1="115" x2="340" y2="175" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr4)"/>
  <text x="340" y="140" fill="#f472b6" font-size="10">case N</text>
  <rect x="295" y="175" width="90" height="30" rx="6" fill="#f472b622" stroke="#f472b6" stroke-width="1.2"/>
  <text x="340" y="195" text-anchor="middle" fill="#f472b6" font-size="10" font-family="JetBrains Mono,monospace">block N; break</text>
  <line x1="350" y1="115" x2="440" y2="175" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr4)"/>
  <text x="410" y="140" fill="#ef4444" font-size="10">default</text>
  <rect x="420" y="175" width="75" height="30" rx="6" fill="#ef444422" stroke="#ef4444" stroke-width="1.2"/>
  <text x="457" y="195" text-anchor="middle" fill="#ef4444" font-size="10" font-family="JetBrains Mono,monospace">default block</text>
  <line x1="75" y1="205" x2="75" y2="265" stroke="#64748b" stroke-width="1"/><line x1="75" y1="265" x2="260" y2="265" stroke="#64748b" stroke-width="1"/>
  <line x1="210" y1="205" x2="210" y2="265" stroke="#64748b" stroke-width="1"/>
  <line x1="340" y1="205" x2="340" y2="265" stroke="#64748b" stroke-width="1"/><line x1="340" y1="265" x2="260" y2="265" stroke="#64748b" stroke-width="1"/>
  <line x1="457" y1="205" x2="457" y2="265" stroke="#64748b" stroke-width="1"/><line x1="457" y1="265" x2="260" y2="265" stroke="#64748b" stroke-width="1"/>
  <line x1="260" y1="265" x2="260" y2="295" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr4)"/>
  <rect x="200" y="295" width="120" height="36" rx="18" fill="#22c55e22" stroke="#22c55e" stroke-width="1.5"/>
  <text x="260" y="318" text-anchor="middle" fill="#22c55e" font-size="11" font-family="JetBrains Mono,monospace">Continue</text>
</svg>`,
  oop: `<svg viewBox="0 0 720 420" style="width:100%;max-width:720px;" preserveAspectRatio="xMidYMid meet">
  <rect x="290" y="15" width="140" height="40" rx="20" fill="#34d39922" stroke="#34d399" stroke-width="2"/>
  <text x="360" y="40" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700" font-family="Space Grotesk,sans-serif">OOP Principles</text>
  <line x1="290" y1="55" x2="110" y2="115" stroke="#34d399" stroke-width="1.5" opacity="0.5"/>
  <line x1="330" y1="55" x2="270" y2="115" stroke="#fbbf24" stroke-width="1.5" opacity="0.5"/>
  <line x1="390" y1="55" x2="450" y2="115" stroke="#60a5fa" stroke-width="1.5" opacity="0.5"/>
  <line x1="430" y1="55" x2="610" y2="115" stroke="#f472b6" stroke-width="1.5" opacity="0.5"/>
  <rect x="40" y="115" width="140" height="36" rx="8" fill="#34d39922" stroke="#34d399" stroke-width="1.5"/>
  <text x="110" y="138" text-anchor="middle" fill="#34d399" font-size="12" font-weight="600">Encapsulation</text>
  <rect x="200" y="115" width="140" height="36" rx="8" fill="#fbbf2422" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="270" y="138" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="600">Inheritance</text>
  <rect x="380" y="115" width="140" height="36" rx="8" fill="#60a5fa22" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="450" y="138" text-anchor="middle" fill="#60a5fa" font-size="12" font-weight="600">Polymorphism</text>
  <rect x="540" y="115" width="140" height="36" rx="8" fill="#f472b622" stroke="#f472b6" stroke-width="1.5"/>
  <text x="610" y="138" text-anchor="middle" fill="#f472b6" font-size="12" font-weight="600">Abstraction</text>
  <line x1="110" y1="151" x2="110" y2="185" stroke="#34d399" stroke-width="1" opacity="0.4"/>
  <line x1="270" y1="151" x2="270" y2="185" stroke="#fbbf24" stroke-width="1" opacity="0.4"/>
  <line x1="450" y1="151" x2="450" y2="185" stroke="#60a5fa" stroke-width="1" opacity="0.4"/>
  <line x1="610" y1="151" x2="610" y2="185" stroke="#f472b6" stroke-width="1" opacity="0.4"/>
  <rect x="30" y="185" width="160" height="80" rx="8" fill="#34d39911" stroke="#34d39944" stroke-width="1"/>
  <text x="110" y="205" text-anchor="middle" fill="#cbd5e1" font-size="10">Private fields</text>
  <text x="110" y="221" text-anchor="middle" fill="#cbd5e1" font-size="10">Public getters/setters</text>
  <text x="110" y="237" text-anchor="middle" fill="#cbd5e1" font-size="10">Data hiding + binding</text>
  <rect x="190" y="185" width="160" height="80" rx="8" fill="#fbbf2411" stroke="#fbbf2444" stroke-width="1"/>
  <text x="270" y="205" text-anchor="middle" fill="#cbd5e1" font-size="10">extends keyword</text>
  <text x="270" y="221" text-anchor="middle" fill="#cbd5e1" font-size="10">Code reusability</text>
  <text x="270" y="237" text-anchor="middle" fill="#cbd5e1" font-size="10">Parent-Child hierarchy</text>
  <rect x="370" y="185" width="160" height="80" rx="8" fill="#60a5fa11" stroke="#60a5fa44" stroke-width="1"/>
  <text x="450" y="205" text-anchor="middle" fill="#cbd5e1" font-size="10">Overloading (compile)</text>
  <text x="450" y="221" text-anchor="middle" fill="#cbd5e1" font-size="10">Overriding (runtime)</text>
  <text x="450" y="237" text-anchor="middle" fill="#cbd5e1" font-size="10">Same name, many forms</text>
  <rect x="530" y="185" width="160" height="80" rx="8" fill="#f472b611" stroke="#f472b644" stroke-width="1"/>
  <text x="610" y="205" text-anchor="middle" fill="#cbd5e1" font-size="10">Abstract classes</text>
  <text x="610" y="221" text-anchor="middle" fill="#cbd5e1" font-size="10">Interfaces</text>
  <text x="610" y="237" text-anchor="middle" fill="#cbd5e1" font-size="10">Hide implementation</text>
</svg>`
};
function flowTab(k, el) {
  document.querySelectorAll('#pg-flowchart .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('flow-display').innerHTML = `<div class="flow-wrap">${FLOWS[k]}</div>`;
}

// ------------------------------
//  UML CLASS DIAGRAMS
// ------------------------------
const UMLS = {
  encap: `<div style="display:flex;gap:30px;flex-wrap:wrap;justify-content:center;align-items:flex-start;">
  <div class="uml-box"><div class="uml-name">Student</div><div class="uml-attrs">- name: String<br>- rollNo: int<br>- marks: double</div><div class="uml-methods">+ getName(): String<br>+ setName(name: String): void<br>+ getRollNo(): int<br>+ setRollNo(r: int): void<br>+ calculateGrade(): String</div></div>
  <div style="display:flex;flex-direction:column;justify-content:center;gap:8px;padding:20px;font-size:12px;color:var(--muted);max-width:250px;">
    <div style="color:var(--accent);font-weight:700;">Encapsulation Example</div>
    <div>&#8226; Fields are <strong style="color:var(--accent4);">private</strong> (hidden)</div>
    <div>&#8226; Access via <strong style="color:var(--accent);">public</strong> getters/setters</div>
    <div>&#8226; Data cannot be modified directly</div>
    <div>&#8226; Validation logic inside setters</div>
    <div style="margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--accent);">- private &rarr; hidden<br>+ public &rarr; accessible</div>
  </div>
</div>`,
  inherit: `<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;align-items:flex-start;">
  <div class="uml-box"><div class="uml-name">Animal</div><div class="uml-attrs"># name: String<br># age: int</div><div class="uml-methods">+ eat(): void<br>+ sound(): void<br>+ getName(): String</div></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px;">
    <div style="font-size:22px;color:var(--accent2);">&#9650;</div>
    <div style="font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;">extends</div>
  </div>
  <div style="display:flex;gap:20px;flex-wrap:wrap;">
    <div class="uml-box"><div class="uml-name">Dog</div><div class="uml-attrs">- breed: String</div><div class="uml-methods">+ sound(): void<br>+ fetch(): void</div></div>
    <div class="uml-box"><div class="uml-name">Cat</div><div class="uml-attrs">- indoor: boolean</div><div class="uml-methods">+ sound(): void<br>+ purr(): void</div></div>
  </div>
</div>`,
  poly: `<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;align-items:flex-start;">
  <div class="uml-box"><div class="uml-name">Calculator</div><div class="uml-attrs"></div><div class="uml-methods">+ add(a: int, b: int): int<br>+ add(a: double, b: double): double<br>+ add(a: int, b: int, c: int): int</div></div>
  <div style="display:flex;flex-direction:column;justify-content:center;gap:8px;padding:20px;font-size:12px;color:var(--muted);max-width:260px;">
    <div style="color:var(--accent3);font-weight:700;">Polymorphism</div>
    <div><strong style="color:var(--accent3);">Compile-time:</strong> Method overloading &mdash; same name, different parameters</div>
    <div><strong style="color:var(--accent2);">Runtime:</strong> Method overriding &mdash; subclass redefines parent method</div>
    <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--accent);">Animal a = new Dog();<br>a.sound(); // "Bark!"</div>
  </div>
</div>`,
  abstract: `<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;align-items:flex-start;">
  <div class="uml-box"><div class="uml-name"><span class="uml-stereo">&laquo;abstract&raquo;</span>Shape</div><div class="uml-attrs"># name: String</div><div class="uml-methods">+ area(): double <em style="color:var(--accent4);">{abstract}</em><br>+ draw(): void</div></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px;">
    <div style="font-size:22px;color:var(--accent5);">&#9650;</div>
    <div style="font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;">extends</div>
  </div>
  <div style="display:flex;gap:20px;flex-wrap:wrap;">
    <div class="uml-box"><div class="uml-name">Circle</div><div class="uml-attrs">- radius: double</div><div class="uml-methods">+ area(): double<br>+ draw(): void</div></div>
    <div class="uml-box"><div class="uml-name">Rectangle</div><div class="uml-attrs">- width: double<br>- height: double</div><div class="uml-methods">+ area(): double<br>+ draw(): void</div></div>
  </div>
</div>`
};
function umlTab(k, el) {
  document.querySelectorAll('#pg-classdiagram .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('uml-display').innerHTML = `<div class="glass" style="padding:24px;overflow-x:auto;">${UMLS[k]}</div>`;
}

// ------------------------------
//  PROGRAMS
// ------------------------------
const PROGS = [
  {
    label: "1. Student Grade Calculator", code: `import java.util.Scanner;

class Student {
  String name;
  int roll;
  double marks;
  
  Student(String n, int r, double m) {
    name = n;
    roll = r;
    marks = m;
  }
  
  String getGrade() {
    if (marks >= 90) return "A+";
    else if (marks >= 80) return "A";
    else if (marks >= 70) return "B";
    else if (marks >= 60) return "C";
    else return "F";
  }
  
  void display() {
    System.out.println("Name: " + name);
    System.out.println("Roll No: " + roll);
    System.out.println("Marks: " + marks);
    System.out.println("Grade: " + getGrade());
  }
  
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.print("Enter student name: ");
    String name = sc.nextLine();
    System.out.print("Enter roll number: ");
    int roll = sc.nextInt();
    System.out.print("Enter marks: ");
    double marks = sc.nextDouble();
    Student s = new Student(name, roll, marks);
    s.display();
  }
}`, inputs: [{ label: "Student Name", type: "text", id: "st_name", default: "Alice" },
    { label: "Roll Number", type: "number", id: "st_roll", default: "101" },
    { label: "Marks (0-100)", type: "number", id: "st_marks", default: "92.5" }],
    run: function (vals) {
      {
        const name = vals.st_name || "Alice";
        const roll = parseInt(vals.st_roll) || 101;
        const marks = parseFloat(vals.st_marks) || 92.5;
        let grade;
        if (marks >= 90) grade = "A+";
        else if (marks >= 80) grade = "A";
        else if (marks >= 70) grade = "B";
        else if (marks >= 60) grade = "C";
        else grade = "F";
        return `Name: ${name}
Roll No: ${roll}
Marks: ${marks}
Grade: ${grade}`;
      }
    }
  }
  ,
  {
    label: "2. Calculator - Method Overloading", code: `import java.util.Scanner;

class Calculator {
  int add(int a, int b) {
    return a + b;
  }
  
  double add(double a, double b) {
    return a + b;
  }
  
  int add(int a, int b, int c) {
    return a + b + c;
  }
  
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    Calculator calc = new Calculator();
    
    System.out.print("Enter first int: ");
    int a = sc.nextInt();
    System.out.print("Enter second int: ");
    int b = sc.nextInt();
    System.out.println("Sum of 2 ints: " + calc.add(a, b));
    
    System.out.print("Enter first double: ");
    double x = sc.nextDouble();
    System.out.print("Enter second double: ");
    double y = sc.nextDouble();
    System.out.println("Sum of 2 doubles: " + calc.add(x, y));
    
    System.out.print("Enter three ints: ");
    int p = sc.nextInt();
    int q = sc.nextInt();
    int r = sc.nextInt();
    System.out.println("Sum of 3 ints: " + calc.add(p, q, r));
  }
}`, inputs: [{ label: "First int (a)", type: "number", id: "c_a", default: "5" },
    { label: "Second int (b)", type: "number", id: "c_b", default: "10" },
    { label: "First double (x)", type: "number", id: "c_x", default: "3.5" },
    { label: "Second double (y)", type: "number", id: "c_y", default: "2.7" },
    { label: "Third int (p)", type: "number", id: "c_p", default: "1" },
    { label: "Fourth int (q)", type: "number", id: "c_q", default: "2" },
    { label: "Fifth int (r)", type: "number", id: "c_r", default: "3" }],
    run: function (vals) {
      {
        const a = parseInt(vals.c_a) || 5, b = parseInt(vals.c_b) || 10;
        const x = parseFloat(vals.c_x) || 3.5, y = parseFloat(vals.c_y) || 2.7;
        const p = parseInt(vals.c_p) || 1, q = parseInt(vals.c_q) || 2, r = parseInt(vals.c_r) || 3;
        return `Sum of 2 ints: ${a + b}
Sum of 2 doubles: ${(x + y).toFixed(1)}
Sum of 3 ints: ${p + q + r}`;
      }
    }
  }
  ,
  {
    label: "3. Circle & Rectangle - Inheritance", code: `import java.util.Scanner;

abstract class Shape {
  abstract double area();
  void draw() { System.out.println("Drawing..."); }
}

class Circle extends Shape {
  double radius;
  Circle(double r) { radius = r; }
  double area() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
  double length, width;
  Rectangle(double l, double w) { length = l; width = w; }
  double area() { return length * width; }
}

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    
    System.out.print("Enter circle radius: ");
    double r = sc.nextDouble();
    Circle c = new Circle(r);
    System.out.println("Drawing a circle");
    System.out.println("Circle Area: " + String.format("%.2f", c.area()));
    
    System.out.print("Enter rectangle length: ");
    double l = sc.nextDouble();
    System.out.print("Enter rectangle width: ");
    double w = sc.nextDouble();
    Rectangle rect = new Rectangle(l, w);
    System.out.println("Drawing a rectangle");
    System.out.println("Rectangle Area: " + String.format("%.2f", rect.area()));
  }
}`, inputs: [{ label: "Circle Radius", type: "number", id: "sh_r", default: "5.0" },
    { label: "Rectangle Length", type: "number", id: "sh_l", default: "4.0" },
    { label: "Rectangle Width", type: "number", id: "sh_w", default: "6.0" }],
    run: function (vals) {
      {
        const r = parseFloat(vals.sh_r) || 5.0;
        const l = parseFloat(vals.sh_l) || 4.0;
        const w = parseFloat(vals.sh_w) || 6.0;
        const circleArea = (Math.PI * r * r).toFixed(2);
        const rectArea = (l * w).toFixed(2);
        return `Drawing a circle
Circle Area: ${circleArea}
Drawing a rectangle
Rectangle Area: ${rectArea}`;
      }
    }
  }
  ,
  {
    label: "4. Wrapper Classes & Autoboxing", code: `import java.util.Scanner;

public class WrapperDemo {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    
    System.out.print("Enter an integer: ");
    Integer num1 = sc.nextInt();  // Autoboxing
    int num2 = num1;     // Unboxing
    
    System.out.print("Enter a double: ");
    Double dbl = sc.nextDouble();   // Autoboxing
    double dbl2 = dbl;   // Unboxing
    
    System.out.print("Enter a character: ");
    Character ch = sc.next().charAt(0);
    
    System.out.print("Enter a string to parse: ");
    String str = sc.next();
    int parsed = Integer.parseInt(str);
    
    System.out.println("Integer object: " + num1);
    System.out.println("Unboxed int: " + num2);
    System.out.println("Double object: " + dbl);
    System.out.println("Unboxed double: " + dbl2);
    System.out.println("Character object: " + ch);
    System.out.println("Unboxed char: " + ch);
    System.out.println("Max int value: " + Integer.MAX_VALUE);
    System.out.println("Parsed from string: " + parsed);
  }
}`, inputs: [{ label: "Integer value", type: "number", id: "w_int", default: "100" },
    { label: "Double value", type: "number", id: "w_dbl", default: "3.14" },
    { label: "Character", type: "text", id: "w_char", default: "A" },
    { label: "String to parse", type: "text", id: "w_str", default: "42" }],
    run: function (vals) {
      {
        const num = parseInt(vals.w_int) || 100;
        const dnum = parseFloat(vals.w_dbl) || 3.14;
        const ch = (vals.w_char || "A").charAt(0);
        const strNum = vals.w_str || "42";
        const parsed = parseInt(strNum) || 42;
        return `Integer object: ${num}
Unboxed int: ${num}
Double object: ${dnum}
Unboxed double: ${dnum}
Character object: ${ch}
Unboxed char: ${ch}
Max int value: 2147483647
Parsed from string: ${parsed}`;
      }
    }
  }
  ,
  {
    label: "5. Array Operations", code: `import java.util.Arrays;
import java.util.Scanner;

public class ArrayOps {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    
    System.out.println("Enter 5 numbers: ");
    int[] arr = new int[5];
    for (int i = 0; i < 5; i++) {
      System.out.print("Number " + (i + 1) + ": ");
      arr[i] = sc.nextInt();
    }
    
    // Print original array
    System.out.println("Original: " + Arrays.toString(arr));
    
    // Sort array
    int[] sorted = arr.clone();
    Arrays.sort(sorted);
    System.out.println("Sorted: " + Arrays.toString(sorted));
    
    // Search
    System.out.print("Enter number to search: ");
    int key = sc.nextInt();
    int index = Arrays.binarySearch(sorted, key);
    if (index >= 0) {
      System.out.println("Index of " + key + ": " + index);
    } else {
      System.out.println(key + " not found");
    }
  }
}`, inputs: [{ label: "Number 1", type: "number", id: "a_n1", default: "45" },
    { label: "Number 2", type: "number", id: "a_n2", default: "12" },
    { label: "Number 3", type: "number", id: "a_n3", default: "89" },
    { label: "Number 4", type: "number", id: "a_n4", default: "33" },
    { label: "Number 5", type: "number", id: "a_n5", default: "7" },
    { label: "Search for", type: "number", id: "a_key", default: "33" }],
    run: function (vals) {
      {
        const nums = [parseInt(vals.a_n1) || 45, parseInt(vals.a_n2) || 12, parseInt(vals.a_n3) || 89, parseInt(vals.a_n4) || 33, parseInt(vals.a_n5) || 7];
        const key = parseInt(vals.a_key) || 33;
        const original = [...nums];
        nums.sort(function (a, b) { return a - b; });
        const idx = nums.indexOf(key);
        return `Original: [${original.join(", ")}]
Sorted: [${nums.join(", ")}]
Index of ${key}: ${idx}`;
      }
    }
  }
  ,
  {
    label: "6. Number Guessing Game", code: `import java.util.Scanner;

public class GuessingGame {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    
    System.out.print("Enter target number: ");
    int target = sc.nextInt();
    
    System.out.println("Enter 3 guesses: ");
    for (int i = 0; i < 3; i++) {
      System.out.print("Guess " + (i + 1) + ": ");
      int guess = sc.nextInt();
      
      if (guess > target) {
        System.out.println(guess + " is Too High!");
      } else if (guess < target) {
        System.out.println(guess + " is Too Low!");
      } else {
        System.out.println(guess + " is Correct!");
      }
    }
  }
}`, inputs: [{ label: "Target Number", type: "number", id: "ng_target", default: "62" },
    { label: "Guess 1", type: "number", id: "ng_g1", default: "50" },
    { label: "Guess 2", type: "number", id: "ng_g2", default: "75" },
    { label: "Guess 3", type: "number", id: "ng_g3", default: "62" }],
    run: function (vals) {
      {
        const target = parseInt(vals.ng_target) || 62;
        const g1 = parseInt(vals.ng_g1) || 50;
        const g2 = parseInt(vals.ng_g2) || 75;
        const g3 = parseInt(vals.ng_g3) || 62;
        function check(g, t) {
          if (g > t) return g + " -> Too high!";
          if (g < t) return g + " -> Too low!";
          return g + " -> Correct!";
        }
        return `Target: ${target}
${check(g1, target)}
${check(g2, target)}
${check(g3, target)}`;
      }
    }
  }
  ,
  {
    label: "7. Simple Interest Calculator", code: `import java.util.Scanner;

public class SimpleInterest {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    
    // Simple Interest Formula
    System.out.print("Enter principal amount: ");
    double principal = sc.nextDouble();
    
    System.out.print("Enter rate of interest (%): ");
    double rate = sc.nextDouble();
    
    System.out.print("Enter time (years): ");
    double time = sc.nextDouble();
    
    // SI = (P * R * T) / 100
    double interest = (principal * rate * time) / 100;
    double amount = principal + interest;
    
    System.out.println("Principal: " + principal);
    System.out.println("Rate: " + rate + "%");
    System.out.println("Time: " + time + " years");
    System.out.println("Interest: " + String.format("%.2f", interest));
    System.out.println("Total Amount: " + String.format("%.2f", amount));
  }
}`, inputs: [{ label: "Principal Amount", type: "number", id: "si_p", default: "10000" },
    { label: "Rate of Interest (%)", type: "number", id: "si_r", default: "5" },
    { label: "Time (years)", type: "number", id: "si_t", default: "3" }],
    run: function (vals) {
      {
        const p = parseFloat(vals.si_p) || 10000;
        const r = parseFloat(vals.si_r) || 5;
        const t = parseFloat(vals.si_t) || 3;
        const interest = (p * r * t) / 100;
        const total = p + interest;
        return `Principal: ${p}
Rate: ${r}%
Time: ${t} years
Interest: ${interest.toFixed(2)}
Total Amount: ${total.toFixed(2)}`;
      }
    }
  }
  ,
  {
    label: "8. Even or Odd Checker", code: `import java.util.Scanner;

public class EvenOddChecker {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    
    System.out.print("Enter a number: ");
    int num = sc.nextInt();
    
    if (num % 2 == 0) {
      System.out.println(num + " is EVEN");
    } else {
      System.out.println(num + " is ODD");
    }
    
    // Bonus: Square and Cube
    System.out.println("Square: " + (num * num));
    System.out.println("Cube: " + (num * num * num));
  }
}`, inputs: [{ label: "Enter a number", type: "number", id: "eo_num", default: "7" }],
    run: function (vals) {
      {
        const num = parseInt(vals.eo_num) || 7;
        const isEven = num % 2 === 0;
        return `${num} is ${isEven ? "EVEN" : "ODD"}
Square: ${num * num}
Cube: ${num * num * num}`;
      }
    }
  }
];

function initProgs() {
  const sel = document.getElementById('prog-picker');
  sel.innerHTML = PROGS.map((p, i) => `<option value="${i}">${p.label}</option>`).join('');
  loadProg(0);
}

function loadProg(i) {
  i = parseInt(i);
  document.getElementById('code-area').value = PROGS[i].code;
  document.getElementById('output-box').textContent = '// Click ? Run Code to execute';
  document.getElementById('output-box').className = 'output-box wait';
  renderInputs(i);
}

function renderInputs(i) {
  const container = document.getElementById('input-area');
  const prog = PROGS[i];
  if (!prog.inputs || prog.inputs.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  container.style.display = 'block';
  let html = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">&#128221; Program Inputs</div>';
  html += prog.inputs.map(inp => `
    <div class="form-g" style="margin-bottom:10px;">
      <label class="form-l" style="font-size:11px;color:var(--muted);margin-bottom:4px;display:block;">${inp.label}</label>
      <input class="form-i" type="${inp.type}" id="${inp.id}" value="${inp.default}" style="width:100%;">
    </div>
  `).join('');
  container.innerHTML = html;
}

function runCode() {
  var sel = document.getElementById('prog-picker');
  var i = parseInt(sel.value);
  var prog = PROGS[i];
  var out = document.getElementById('output-box');
  var status = document.getElementById('prog-status');

  out.textContent = 'Compiling & Running...';
  out.className = 'prog-output wait';
  status.textContent = 'Running...';
  status.className = 'prog-status running';

  setTimeout(function () {
    var vals = {};
    if (prog.inputs) {
      for (var k = 0; k < prog.inputs.length; k++) {
        var inp = prog.inputs[k];
        var el = document.getElementById(inp.id);
        vals[inp.id] = el ? el.value : inp.default;
      }
    }
    var result = prog.run(vals);
    out.textContent = result;
    out.className = 'prog-output';
    status.textContent = 'Done';
    status.className = 'prog-status success';
    toast('Executed successfully!');
  }, 600);
}

function resetProg() {
  var out = document.getElementById('output-box');
  var status = document.getElementById('prog-status');
  out.textContent = '// Click "Run Code" to execute the program';
  out.className = 'prog-output wait';
  status.textContent = 'Ready';
  status.className = 'prog-status';
}

function copyCode() {
  const code = document.getElementById('code-area');
  code.select();
  code.setSelectionRange(0, 99999);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code.value).then(function() {
      toast('Code copied to clipboard!');
    }, function() {
      toast('Copy failed', 1);
    });
  } else {
    document.execCommand('copy');
    toast('Code copied to clipboard!');
  }
}

// ------------------------------
//  GUESS OUTPUT (MCQs)
// ------------------------------
const GQS = [
  { code: `int x = 10;\nint y = x++;\nSystem.out.println(x + " " + y);`, opts: ["10 10", "11 10", "10 11", "11 11"], ans: 1, expl: "x++ is post-increment: y gets 10 (old value), then x becomes 11. Output: '11 10'." },
  { code: `String s1 = "Java";\nString s2 = "Java";\nString s3 = new String("Java");\nSystem.out.println(s1 == s2);\nSystem.out.println(s1 == s3);`, opts: ["true true", "false false", "true false", "false true"], ans: 2, expl: "s1 and s2 point to the same String pool literal. s3 creates a new object on heap. So: true, false." },
  { code: `int i = 0;\nwhile (i < 3) {\n    i++;\n    if (i == 2) continue;\n    System.out.print(i + " ");\n}`, opts: ["0 1 2 3", "1 3", "1 2 3", "1 3 "], ans: 3, expl: "i=1: print 1. i=2: continue (skip). i=3: print 3. Output: '1 3 ' with trailing space." },
  { code: `System.out.println(10 / 3);\nSystem.out.println(10.0 / 3);\nSystem.out.println(10 % 3);`, opts: ["3\n3.333\n1", "3\n3.3333333333333335\n1", "3.0\n3.33\n1.0", "3\n3.33\n1"], ans: 1, expl: "int/int = int(3). double/int = 3.333...35. % is modulus: 10%3=1." },
  { code: `class A {\n    A() { System.out.print("A "); }\n}\nclass B extends A {\n    B() { System.out.print("B "); }\n}\nnew B();`, opts: ["A B", "B A", "B", "A"], ans: 0, expl: "Parent constructor runs first. So A's constructor prints 'A ', then B's prints 'B '. Output: 'A B'." },
  { code: `Integer a = 127;\nInteger b = 127;\nInteger c = 128;\nInteger d = 128;\nSystem.out.println(a == b);\nSystem.out.println(c == d);`, opts: ["true true", "false false", "true false", "false true"], ans: 2, expl: "Integer caches -128 to 127. a and b are same cached object (true). 128 is outside cache, c and d are different objects (false)." },
  { code: `int[] arr = {1, 2, 3};\nfor (int x : arr) {\n    x = x * 2;\n}\nSystem.out.println(arr[0]);`, opts: ["2", "1", "0", "Error"], ans: 1, expl: "Enhanced for loop variable is a copy. Modifying x doesn't change the array. arr[0] remains 1." },
  { code: `String s = "Hello";\ns.concat(" World");\nSystem.out.println(s);`, opts: ["Hello World", "Hello", "World", "Error"], ans: 1, expl: "Strings are immutable. concat() returns a NEW string but s still points to 'Hello'. Need: s = s.concat(\" World\");" },
  { code: `System.out.println(Math.round(2.5));\nSystem.out.println(Math.round(-2.5));`, opts: ["3 -2", "2 -3", "3 -3", "2 -2"], ans: 0, expl: "Math.round() adds 0.5 and floors. 2.5+0.5=3.0, floor=3. -2.5+0.5=-2.0, floor=-2." },
  { code: `try {\n    int x = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.print("A");\n} finally {\n    System.out.print("B");\n}`, opts: ["A", "B", "AB", "Error"], ans: 2, expl: "10/0 throws ArithmeticException, caught by catch (prints A). Finally always runs (prints B). Output: AB." }
];
let gqIdx = 0, gqScore = 0;
let gqAnswers = {}; // Track answered questions: {qIdx: {selected: ansIdx, correct: bool}}
function renderGQ() {
  const q = GQS[gqIdx]; if (!q) return;
  document.getElementById('gq-num').textContent = `Q ${gqIdx + 1} / ${GQS.length}`;
  document.getElementById('gq-score').textContent = `Score: ${gqScore}`;
  
  const answered = gqAnswers[gqIdx];
  const optionsHTML = q.opts.map((o, i) => {
    let classes = 'q-opt';
    if (answered) {
      classes += ' disabled';
      if (i === answered.selected) classes += answered.correct ? ' correct' : ' wrong';
      else if (i === q.ans) classes += ' correct';
    }
    return `<div class="${classes}" onclick="answerGQ(${i},this)"><span class="q-letter">${String.fromCharCode(65 + i)}</span><span>${esc(o.replace(/\n/g, ' \u21B5 '))}</span></div>`;
  }).join('');
  
  document.getElementById('gq-card').innerHTML = `
    <div class="predict-code">${esc(q.code)}</div>
    <div style="font-weight:600;color:#fff;margin-bottom:10px;">What is the output?</div>
    ${optionsHTML}
    <div class="q-expl" id="gq-expl" style="${answered ? 'display:block;' : 'display:none;'}">${q.expl}</div>
    <div class="gq-nav" id="gq-nav" style="display:flex; margin-top:16px;gap:10px;">
      <button class="btn btn-s" onclick="prevQuestion()" ${gqIdx === 0 ? 'disabled' : ''}>← Previous</button>
      <button class="btn btn-s" onclick="nextQuestion()" ${!answered ? 'disabled' : (gqIdx === GQS.length - 1 ? 'disabled' : '')}>Next →</button>
    </div>`;
}
function answerGQ(i, el) {
  const q = GQS[gqIdx]; if (!q) return;
  if (gqAnswers[gqIdx]) return; // Already answered
  
  const opts = document.querySelectorAll('#gq-card .q-opt');
  opts.forEach(o => o.classList.add('disabled'));
  
  const isCorrect = i === q.ans;
  gqAnswers[gqIdx] = { selected: i, correct: isCorrect };
  
  if (isCorrect) { el.classList.add('correct'); gqScore++; quizScore += 10; }
  else { el.classList.add('wrong'); opts[q.ans].classList.add('correct'); }
  
  const expl = document.getElementById('gq-expl');
  expl.style.display = 'block';
  expl.classList.add('show');
  
  // Enable Next button after answering
  const nextBtn = document.querySelector('#gq-nav .btn:nth-child(2)');
  if (nextBtn) nextBtn.disabled = gqIdx === GQS.length - 1;
  
  saveProgress();
}
function prevQuestion() {
  if (gqIdx > 0) { gqIdx--; renderGQ(); }
}
function nextQuestion() {
  if (gqIdx < GQS.length - 1) { gqIdx++; renderGQ(); } 
  else { toast('Quiz complete! Score: ' + gqScore + '/' + GQS.length); }
}
function resetGuess() { gqIdx = 0; gqScore = 0; gqAnswers = {}; renderGQ(); }

// ------------------------------
//  CODING PRACTICE
// ------------------------------
const CODING = [
  { title: "BankAccount Class", desc: "Create a BankAccount class with private fields: accountHolder (String), balance (double). Add a parameterized constructor, deposit(double), withdraw(double) with balance check, and display(). Create two objects and test.", difficulty: "Easy", concept: "Encapsulation" },
  { title: "Area Calculator Overloading", desc: "Create an AreaCalculator class with overloaded methods: area(int side) for square, area(int l, int w) for rectangle, area(double radius) for circle. Call all from main().", difficulty: "Easy", concept: "Method Overloading" },
  { title: "Employee Hierarchy", desc: "Create a base class Employee (name, salary). Create Manager (bonus field) and Developer (programmingLanguage field) subclasses. Override displayDetails() in each. Test in main().", difficulty: "Medium", concept: "Inheritance" },
  { title: "String to Integer Converter", desc: "Write a program that takes a String input, converts it to Integer using Integer.parseInt(), performs arithmetic operations, and prints results. Handle NumberFormatException with try-catch.", difficulty: "Easy", concept: "Wrapper Classes" },
  { title: "Array Statistics", desc: "Create an int array of size 10. Accept values from user using Scanner. Find max, min, and sort using Arrays.sort(). Print the results.", difficulty: "Medium", concept: "Arrays" },
  { title: "2D Matrix Operations", desc: "Create a 3x3 integer matrix. Calculate: (a) Sum of all elements, (b) Sum of diagonal elements, (c) Transpose of the matrix. Display all results.", difficulty: "Medium", concept: "2D Arrays" },
  { title: "Prime Number Finder", desc: "Print all prime numbers between 1 and 100 using nested for loops and the break statement. Also implement using a while loop.", difficulty: "Medium", concept: "Control Statements" },
  { title: "Student Report Card", desc: "Using BufferedReader, read a student's name, roll number, and marks in 5 subjects. Calculate average and grade. Add Javadoc comments to every method.", difficulty: "Hard", concept: "I/O & JavaDoc" }
];
function renderCoding() {
  document.getElementById('coding-list').innerHTML = CODING.map((c, i) => `<div class="glass" style="margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
      <div><div class="card-t">${i + 1}. ${c.title}</div><div class="card-m" style="margin-top:6px;">${c.desc}</div></div>
      <div style="display:flex;gap:6px;flex-shrink:0;"><span class="badge badge-${c.difficulty === 'Easy' ? 'g' : c.difficulty === 'Medium' ? 'y' : 'r'}">${c.difficulty}</span><span class="badge badge-p">${c.concept}</span></div>
    </div>
  </div>`).join('');
}

// ------------------------------
//  DEBUG CODE
// ------------------------------
const BUGS = [
  { title: "Constructor Name Mismatch", desc: "This class has a constructor that doesn't match its class name and missing 'this' keyword.", buggy: `public class Car {\n    private String model;\n    private int year;\n\n    public car(String model, int year) {\n        model = model;\n        year = year;\n    }\n\n    public void display() {\n        System.out.println(model + " " + year);\n    }\n}`, hint: "Constructor name must match class name (Car, not car). Use 'this' keyword to distinguish fields from parameters.", fixed: `public class Car {\n    private String model;\n    private int year;\n\n    public Car(String model, int year) {\n        this.model = model;\n        this.year = year;\n    }\n\n    public void display() {\n        System.out.println(model + " " + year);\n    }\n}` },
  { title: "Array Index Out of Bounds", desc: "This loop tries to access an element that doesn't exist.", buggy: `public class ArrayBug {\n    public static void main(String[] args) {\n        int[] arr = {10, 20, 30, 40, 50};\n        for (int i = 0; i <= arr.length; i++) {\n            System.out.println(arr[i]);\n        }\n    }\n}`, hint: "Array indices go from 0 to length-1. Using <= length causes ArrayIndexOutOfBoundsException.", fixed: `public class ArrayBug {\n    public static void main(String[] args) {\n        int[] arr = {10, 20, 30, 40, 50};\n        for (int i = 0; i < arr.length; i++) {\n            System.out.println(arr[i]);\n        }\n    }\n}` },
  { title: "Private Method Not Overridden", desc: "This code expects polymorphic behavior but doesn't get it.", buggy: `class Parent {\n    private void show() {\n        System.out.println("Parent");\n    }\n}\nclass Child extends Parent {\n    public void show() {\n        System.out.println("Child");\n    }\n}\n// Parent obj = new Child(); obj.show();\n// Prints "Parent" - not polymorphic!`, hint: "Private methods are not visible to subclasses and cannot be overridden. Change to public or protected.", fixed: `class Parent {\n    public void show() {\n        System.out.println("Parent");\n    }\n}\nclass Child extends Parent {\n    @Override\n    public void show() {\n        System.out.println("Child");\n    }\n}\n// Parent obj = new Child(); obj.show();\n// Now correctly prints "Child"` },
  { title: "NullPointerException on Unboxing", desc: "This code crashes at runtime with a NullPointerException.", buggy: `public class WrapperBug {\n    public static void main(String[] args) {\n        Integer a = null;\n        int b = a;  // NullPointerException!\n        System.out.println(b);\n    }\n}`, hint: "Unboxing a null wrapper object throws NullPointerException. Check for null before unboxing.", fixed: `public class WrapperBug {\n    public static void main(String[] args) {\n        Integer a = null;\n        int b = (a != null) ? a : 0;\n        System.out.println(b);  // Prints 0\n    }\n}` },
  { title: "Switch Fall-Through", desc: "This switch statement prints more than expected.", buggy: `int day = 3;\nswitch (day) {\n    case 1: System.out.println("Monday");\n    case 2: System.out.println("Tuesday");\n    case 3: System.out.println("Wednesday");\n    case 4: System.out.println("Thursday");\n    default: System.out.println("Other");\n}`, hint: "Missing break statements cause fall-through. Execution continues through all subsequent cases.", fixed: `int day = 3;\nswitch (day) {\n    case 1: System.out.println("Monday"); break;\n    case 2: System.out.println("Tuesday"); break;\n    case 3: System.out.println("Wednesday"); break;\n    case 4: System.out.println("Thursday"); break;\n    default: System.out.println("Other");\n}` },
  { title: "Static Method Accessing Instance Variable", desc: "This code won't compile. Can you spot why?", buggy: `public class Counter {\n    int count = 0;\n\n    public static void increment() {\n        count++;  // Compile error!\n    }\n\n    public static void main(String[] args) {\n        increment();\n    }\n}`, hint: "Static methods cannot access instance variables directly. Either make 'count' static or make 'increment' non-static.", fixed: `public class Counter {\n    static int count = 0;  // Now static\n\n    public static void increment() {\n        count++;  // Works now\n    }\n\n    public static void main(String[] args) {\n        increment();\n        System.out.println(count);  // 1\n    }\n}` }
];
let bugIdx = 0;
function initDebug() {
  document.getElementById('debug-tabs').innerHTML = BUGS.map((b, i) => `<div class="tab ${i === 0 ? 'active' : ''}" onclick="loadBug(${i},this)">Bug ${i + 1}</div>`).join('');
  loadBug(0, document.querySelector('#debug-tabs .tab'));
}
function loadBug(i, el) {
  bugIdx = i;
  document.querySelectorAll('#debug-tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const b = BUGS[i];
  document.getElementById('debug-display').innerHTML = `
    <div class="glass" style="margin-bottom:14px;"><div class="card-t">${b.title}</div><div class="card-m" style="margin-top:6px;">${b.desc}</div></div>
    <div class="code-editor"><div class="editor-bar"><div class="editor-dots"><span></span><span></span><span></span></div><div class="editor-lang" style="color:#ef4444;">Buggy Code</div></div>
    <pre style="padding:16px;font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#e2e8f0;line-height:1.7;margin:0;white-space:pre-wrap;">${esc(b.buggy)}</pre></div>
    <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
      <button class="btn btn-d btn-sm" onclick="document.getElementById('bug-h').style.display='block'">&#128027; Show Hint</button>
      <button class="btn btn-g btn-sm" onclick="document.getElementById('bug-f').style.display='block'">&#10003; Show Fix</button>
    </div>
    <div id="bug-h" style="display:none;margin-top:12px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.25);border-radius:var(--radius-sm);padding:12px;font-size:13px;color:var(--accent2);">${esc(b.hint)}</div>
    <div id="bug-f" style="display:none;margin-top:10px;" class="code-editor"><div class="editor-bar"><div class="editor-dots"><span></span><span></span><span></span></div><div class="editor-lang" style="color:#22c55e;">Fixed Code</div></div>
    <pre style="padding:16px;font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#22c55e;line-height:1.7;margin:0;white-space:pre-wrap;">${esc(b.fixed)}</pre></div>`;
}

// ------------------------------
//  FLASH CARDS
// ------------------------------
const FCS = [
  { q: "What is Encapsulation?", a: "Bundling data and methods into a single unit (class) and restricting direct access using private fields with public getters/setters." },
  { q: "Difference between JDK, JRE, JVM?", a: "JVM executes bytecode. JRE = JVM + libraries. JDK = JRE + dev tools (javac, javadoc). JDK ? JRE ? JVM." },
  { q: "How many primitive data types?", a: "8: byte, short, int, long, float, double, char, boolean." },
  { q: "Method Overloading vs Overriding?", a: "Overloading: same name, different params, same class (compile-time). Overriding: same signature, subclass redefines parent method (runtime)." },
  { q: "What is Autoboxing?", a: "Automatic conversion from primitive to wrapper (int ? Integer). Unboxing is the reverse (Integer ? int)." },
  { q: "Four access specifiers?", a: "private (class only), default (package), protected (package + subclasses), public (everywhere)." },
  { q: "Purpose of 'static' keyword?", a: "Indicates a member belongs to the class itself, not instances. Static variables are shared. Static methods can be called without an object." },
  { q: "Constructor vs Method?", a: "Constructor: same name as class, no return type, called automatically on object creation. Method: own name, has return type, called explicitly." },
  { q: "Why is Java platform-independent?", a: "Java compiles to bytecode (not machine code). The JVM on any platform can execute this bytecode: 'Write Once, Run Anywhere.'" },
  { q: "What does 'final' keyword do?", a: "final variable: constant (can't change). final method: can't be overridden. final class: can't be inherited." },
  { q: "break vs continue?", a: "break exits the entire loop/switch. continue skips the rest of the current iteration and moves to the next." },
  { q: "What is a Jagged Array?", a: "A 2D array where each row can have a different number of columns. E.g., int[][] j = new int[3][]; with varying row lengths." },
  { q: "What are Javadoc comments?", a: "Comments starting with /** and ending with */. Use @param, @return, @author tags. The javadoc tool generates HTML documentation from them." },
  { q: "What is ArrayIndexOutOfBoundsException?", a: "Thrown when accessing an array index outside valid range (0 to length-1). Common in loops using <= instead of <." },
  { q: "What is the 'this' keyword?", a: "Refers to the current object. Used to: distinguish fields from parameters, call another constructor this(), pass current object as argument." }
];
function renderFC() {
  document.getElementById('fc-grid').innerHTML = FCS.map((f, i) => `<div class="fc" onclick="this.classList.toggle('flipped')">
    <div class="fc-inner">
      <div class="fc-front"><div class="fc-q">${f.q}</div><div class="fc-hint">Click to flip</div></div>
      <div class="fc-back"><div class="fc-a">${f.a}</div></div>
    </div>
  </div>`).join('');
}

// ------------------------------
//  SCENARIO QUESTIONS
// ------------------------------
const SCENARIOS = [
  { label: "Scenario 1", q: "A banking application needs to protect customer balance from direct modification. Which OOP principle should be applied and how?", a: "Encapsulation. Make the balance field private and provide public methods like deposit() and withdraw() that include validation logic (e.g., check for negative amounts, sufficient balance for withdrawal). This prevents external code from setting invalid values directly." },
  { label: "Scenario 2", q: "A university system has Person, Student, and Professor classes. Student and Professor share common attributes like name and age. How should this be designed?", a: "Use Inheritance. Create a base class Person with common fields (name, age) and methods. Student and Professor extend Person, adding their own specific fields (studentId, GPA for Student; department, salary for Professor). This avoids code duplication." },
  { label: "Scenario 3", q: "A drawing application needs to call area() on different shapes (Circle, Rectangle, Triangle) without knowing the specific type at compile time. How?", a: "Polymorphism. Create an abstract class Shape with abstract method area(). Each subclass overrides area() with its formula. Store all shapes in a Shape[] array. Calling area() on each element invokes the correct version at runtime through dynamic dispatch." },
  { label: "Scenario 4", q: "A library management system needs to store 1000 book titles and search efficiently. Which data structure and search approach should be used?", a: "Use an array of Strings (or ArrayList). Sort the array using Arrays.sort(), then use Arrays.binarySearch() for O(log n) lookup. For dynamic additions, consider ArrayList with Collections.sort(). For very large data, HashMap provides O(1) lookup by title." },
  { label: "Scenario 5", q: "A student marks processing system needs to read 5 subject marks, calculate average, and assign grade. The program crashes if user enters text instead of numbers. How to fix?", a: "Use try-catch with NumberFormatException around Integer.parseInt() or Scanner.nextInt(). Wrap input reading in a loop that keeps prompting until valid input is received. Also use hasNextInt() with Scanner to check before reading." },
  { label: "Scenario 6", q: "You are building a quiz app where questions can have different types: MCQ, True/False, and Fill-in-the-blank. Each type displays differently but all are 'questions'. Which OOP concept applies?", a: "Abstraction + Polymorphism. Define an abstract class Question with abstract method display(). Subclasses MCQQuestion, TrueFalseQuestion, and FillBlankQuestion each implement display() differently. The app treats all questions uniformly through the Question reference type." }
];
function renderScenarios() {
  document.getElementById('scenario-list').innerHTML = SCENARIOS.map((s, i) => `<div class="scenario-card">
    <div class="sc-label">${s.label}</div>
    <div class="sc-q">${s.q}</div>
    <button class="btn btn-y btn-sm" onclick="this.nextElementSibling.classList.toggle('show')">Show Answer</button>
    <div class="sc-ans">${s.a}</div>
  </div>`).join('');
}

// ------------------------------
//  INTERVIEW TOPICS
// ------------------------------
const INTERVIEWS = [
  { q: "What is the difference between == and .equals() in Java?", diff: "Medium", color: "var(--accent2)", a: "== compares reference (memory address) for objects. .equals() compares content/values. For String, always use .equals(). Example: new String('hi') == new String('hi') is false, but .equals() returns true." },
  { q: "Why is String immutable in Java?", diff: "Hard", color: "var(--accent4)", a: "String is immutable for: 1) String pool efficiency (same literal shared), 2) Thread safety (no synchronization needed), 3) Security (e.g., database URLs can't be changed), 4) HashCode caching (improves HashMap performance)." },
  { q: "What is the difference between method overloading and overriding?", diff: "Easy", color: "var(--accent)", a: "Overloading: same method name, different parameters in the same class (compile-time). Overriding: subclass redefines parent method with same signature (runtime). @Override annotation ensures correct overriding." },
  { q: "Explain the Java memory model  Stack vs Heap.", diff: "Hard", color: "var(--accent4)", a: "Stack: stores method frames, local variables, and references. Each thread has its own stack. Heap: stores all objects and instance variables. Shared across threads. GC reclaims unreachable heap objects." },
  { q: "What is the difference between abstract class and interface?", diff: "Medium", color: "var(--accent2)", a: "Abstract class: can have constructors, instance variables, concrete + abstract methods, any visibility. Interface: only constants, abstract/default/static methods, implicitly public. A class extends one abstract class but can implement multiple interfaces." },
  { q: "What is autoboxing and unboxing? Give examples.", diff: "Easy", color: "var(--accent)", a: "Autoboxing: primitive to wrapper automatically (int ? Integer). Unboxing: wrapper to primitive (Integer ? int). Example: Integer x = 5; (autoboxing), int y = x; (unboxing). NullPointerException if unboxing null!" },
  { q: "What are the 8 primitive data types in Java?", diff: "Easy", color: "var(--accent)", a: "byte(1), short(2), int(4), long(8), float(4), double(8), char(2), boolean(1bit). Sizes are fixed across platforms  this makes Java architecture-neutral." },

  { q: "Explain the JVM architecture.", diff: "Hard", color: "var(--accent4)", a: "JVM has: 1) Class Loader (loads .class files), 2) Bytecode Verifier (checks validity), 3) Execution Engine (JIT + Interpreter), 4) Runtime Data Areas (Heap, Stack, PC Register, Native Method Stack, Method Area)." },
  { q: "What is the difference between Stack and Heap memory?", diff: "Medium", color: "var(--accent2)", a: "Stack: stores local variables, method frames, references. Fast, auto-managed (LIFO). Heap: stores objects and instance variables. Shared across threads. Managed by Garbage Collector." },
  { q: "Why is Java called platform-independent?", diff: "Easy", color: "var(--accent)", a: "Java compiles to bytecode (not native machine code). The JVM interprets/executes this bytecode on any platform. 'Write Once, Run Anywhere' (WORA)." },
  { q: "What is the difference between final, finally, and finalize?", diff: "Medium", color: "var(--accent2)", a: "final: keyword for variables (constant), methods (can't override), classes (can't inherit). finally: block that always executes after try-catch. finalize(): method called by GC before destroying an object." },
  { q: "What is the difference between ArrayList and array?", diff: "Easy", color: "var(--accent)", a: "Array: fixed size, stores primitives and objects, faster. ArrayList: dynamic size, stores only objects (autoboxing for primitives), part of Collections framework, more flexible." },
  { q: "What is the purpose of the 'super' keyword?", diff: "Medium", color: "var(--accent2)", a: "super refers to the parent class. Uses: 1) Call parent constructor super(), 2) Access parent methods super.method(), 3) Access parent fields super.field. Must be first statement in constructor." },
  { q: "What is a constructor and what are its rules?", diff: "Easy", color: "var(--accent)", a: "Constructor initializes objects. Rules: same name as class, no return type (not even void), automatically called on new, can be overloaded, if none written compiler provides default." },
  { q: "What is the difference between 'break' and 'return'?", diff: "Easy", color: "var(--accent)", a: "break: exits the nearest loop or switch. return: exits the current method and optionally returns a value to the caller." },
  { q: "What is the difference between 'throw' and 'throws'?", diff: "Medium", color: "var(--accent2)", a: "throw: used inside a method to actually raise an exception object. throws: declared in method signature to indicate the method might throw checked exceptions that must be handled by the caller." },
  { q: "What is a static block and when does it execute?", diff: "Hard", color: "var(--accent4)", a: "static { ... } executes once when the class is loaded into memory, before any objects are created and before main(). Used for initializing static variables or loading native libraries." },
  { q: "What are the types of loops in Java?", diff: "Easy", color: "var(--accent)", a: "1) for (initialization; condition; update), 2) while (condition), 3) do-while (condition)  executes at least once, 4) Enhanced for-each loop for collections/arrays." },
  { q: "What is the difference between '==' and .equals() for String?", diff: "Medium", color: "var(--accent2)", a: "== checks reference equality (same memory address). .equals() checks content equality. For String comparison, always use .equals() or .equalsIgnoreCase()." },
  { q: "What is a wrapper class and why do we need it?", diff: "Easy", color: "var(--accent)", a: "Wrapper classes (Integer, Double, etc.) wrap primitives into objects. Needed for: Collections (ArrayList<int> is invalid), null representation, utility methods (parseInt, toString), and generics." },
  { q: "What is the difference between abstract class and interface?", diff: "Hard", color: "var(--accent4)", a: "Abstract class: can have constructors, instance variables, concrete and abstract methods, any access modifier. Interface: only constants, abstract/default/static methods, implicitly public. Class extends one abstract class but can implement multiple interfaces." }
];
function renderInterviews() {
  document.getElementById('int-list').innerHTML = INTERVIEWS.map((item, i) => `<div class="int-card" id="int-${i}">
    <div class="int-head" onclick="document.getElementById('int-${i}').classList.toggle('open')">
      <div class="iq">${esc(item.q)}</div>
      <span class="idiff" style="background:${item.color}22;color:${item.color};border:1px solid ${item.color}44;">${item.diff}</span>
      <span class="int-arrow">&#9660;</span>
    </div>
    <div class="int-body">${esc(item.a)}</div>
  </div>`).join('');
}

// ------------------------------
//  PROJECTS
// ------------------------------
let projects = JSON.parse(localStorage.getItem('javaU1_proj') || '[]');
const DEFAULT_PROJS = [
  { title: "Student Grade Calculator", desc: "Create a Student class with name, rollNo, and marks in 5 subjects. Calculate total, average, and grade using encapsulation.", concept: "Classes & Objects", status: "todo" },
  { title: "Bank Account Manager", desc: "Implement BankAccount with deposit, withdraw, and balance check. Use method overloading for different transaction types.", concept: "Encapsulation", status: "todo" },
  { title: "Shape Area Calculator", desc: "Build a hierarchy of shapes (Circle, Rectangle, Triangle) inheriting from abstract Shape. Demonstrate polymorphism by calculating areas.", concept: "Inheritance", status: "todo" },
  { title: "Library Management System", desc: "Create Book and Member classes. Use arrays to store books. Implement search, issue, and return functionality with proper I/O.", concept: "Arrays & I/O", status: "todo" },
  { title: "Employee Payroll System", desc: "Design Employee, Manager, Developer classes. Calculate salaries with bonuses. Use constructors and method overriding.", concept: "Inheritance", status: "todo" },
  { title: "Number Guessing Game", desc: "Generate random numbers. Use control statements (if-else, loops) and Scanner for user input. Track attempts.", concept: "Control Statements", status: "todo" }
];
function initProjects() {
  if (!projects.length) { projects = [...DEFAULT_PROJS]; localStorage.setItem('javaU1_proj', JSON.stringify(projects)); }
}
function renderProj(filter) {
  initProjects();
  const list = document.getElementById('proj-list');
  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);
  if (!filtered.length) { list.innerHTML = '<div class="note-empty">No projects found.</div>'; return; }
  list.innerHTML = filtered.map((p, i) => `<div class="glass" style="margin-bottom:14px;">
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px;">
      <div style="flex:1;min-width:200px;">
        <div class="card-t">${esc(p.title)}</div>
        <div class="card-m" style="margin-top:6px;">${esc(p.desc)}</div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
          <span class="badge badge-p">${esc(p.concept)}</span>
          <span class="badge badge-${p.status === 'todo' ? 'r' : p.status === 'progress' ? 'y' : 'g'}">${p.status === 'todo' ? 'To-Do' : p.status === 'progress' ? 'In Progress' : 'Done'}</span>
        </div>
      </div>
      <select class="form-s" style="min-width:120px;font-size:12px;" onchange="updateProjStatus(${i},this.value)">
        <option value="todo" ${p.status === 'todo' ? 'selected' : ''}>To-Do</option>
        <option value="progress" ${p.status === 'progress' ? 'selected' : ''}>In Progress</option>
        <option value="done" ${p.status === 'done' ? 'selected' : ''}>Done</option>
      </select>
    </div>
  </div>`).join('');
}
function updateProjStatus(i, status) {
  projects[i].status = status;
  localStorage.setItem('javaU1_proj', JSON.stringify(projects));
  renderProj(document.querySelector('#pg-projects select').value);
  toast('Project status updated!');
}
function saveProj() {
  const t = document.getElementById('p-title').value.trim();
  const d = document.getElementById('p-desc').value.trim();
  const c = document.getElementById('p-co').value;
  const s = document.getElementById('p-status').value;
  if (!t) { toast('Project title required', 1); return; }
  projects.unshift({ title: t, desc: d, concept: c, status: s });
  localStorage.setItem('javaU1_proj', JSON.stringify(projects));
  document.getElementById('p-title').value = ''; document.getElementById('p-desc').value = '';
  closeModal('proj-modal'); renderProj('all'); toast('Project added!');
}
function filterProj(v) { renderProj(v); }

// ------------------------------
//  SEARCH & INIT
// ------------------------------
function initSearch() {
  // Search is now in the navbar, no need to add to sidebar
}
function performSearch(q) {
  q = q.toLowerCase().trim();
  const navItems = document.querySelectorAll('.nav-i');
  navItems.forEach(item => {
    if (!q) { item.style.display = 'flex'; return; }
    const txt = item.textContent.toLowerCase();
    item.style.display = txt.includes(q) ? 'flex' : 'none';
  });
}


// ------------------------------
//  TOPICS
// ------------------------------
const TOPICS_DATA = [
  {
    id: "oop-paradigms",
    title: "1. Overview of OOP & Paradigms",
    icon: "&#127793;",
    color: "var(--accent)",
    duration: "2 hrs",
    concepts: ["Procedural vs OO", "OOP Principles", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
    content: `<div class="card-t" style="color:var(--accent);margin-bottom:12px;">&#127793; Object-Oriented Programming Paradigms</div>
    <div class="card-m" style="margin-bottom:16px;"><strong>Object-Oriented Programming (OOP)</strong> is a programming paradigm based on the concept of "objects" that contain data (attributes) and code (methods).</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
      <div class="glass" style="padding:14px;"><div style="font-weight:700;color:var(--accent);margin-bottom:6px;">Procedural Programming</div><div style="font-size:12px;color:var(--muted);">Focuses on functions/procedures. Code is organized as a sequence of steps. Example: C, Pascal.</div></div>
      <div class="glass" style="padding:14px;"><div style="font-weight:700;color:var(--accent2);margin-bottom:6px;">Object-Oriented Programming</div><div style="font-size:12px;color:var(--muted);">Focuses on objects that encapsulate data and behavior. Example: Java, C++, Python.</div></div>
    </div>
    <div class="card-m" style="margin-bottom:12px;"><strong>Key OOP Principles:</strong></div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;">
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent);font-size:13px;">&#128274; Encapsulation</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">Binding data and methods together; hiding internal details using access modifiers.</div></div>
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent2);font-size:13px;">&#127793; Inheritance</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">Creating new classes from existing ones to promote code reuse (extends keyword).</div></div>
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent3);font-size:13px;">&#128256; Polymorphism</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">One interface, multiple implementations. Method overloading and overriding.</div></div>
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent4);font-size:13px;">&#127912; Abstraction</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">Hiding complex implementation details; showing only essential features.</div></div>
    </div>
    <div class="card-m"><strong>Java Buzzwords:</strong> Simple, Object-Oriented, Portable, Platform-Independent, Secured, Robust, Architecture-Neutral, Interpreted, High Performance, Multithreaded, Distributed, Dynamic.</div>`
  },
  {
    id: "jvm-jdk",
    title: "2. JVM, JDK & Programming Structures",
    icon: "&#9881;",
    color: "var(--accent2)",
    duration: "2 hrs",
    concepts: ["JVM Architecture", "JDK vs JRE", "Compilation", "Program Structure", "main() method"],
    content: `<div class="card-t" style="color:var(--accent2);margin-bottom:12px;">&#9881; JVM, JDK & JRE</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:16px;">
      <div class="glass" style="padding:16px;text-align:center;min-width:140px;"><div style="font-weight:700;color:var(--accent);font-size:14px;">JDK</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">Development Kit<br>javac + JRE + Tools</div></div>
      <div style="display:flex;align-items:center;color:var(--muted);">&#10142;</div>
      <div class="glass" style="padding:16px;text-align:center;min-width:140px;"><div style="font-weight:700;color:var(--accent2);font-size:14px;">JRE</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">Runtime Env<br>JVM + Libraries</div></div>
      <div style="display:flex;align-items:center;color:var(--muted);">&#10142;</div>
      <div class="glass" style="padding:16px;text-align:center;min-width:140px;"><div style="font-weight:700;color:var(--accent3);font-size:14px;">JVM</div><div style="font-size:11px;color:var(--muted);margin-top:4px;">Virtual Machine<br>Executes Bytecode</div></div>
    </div>
    <div class="card-m" style="margin-bottom:12px;"><strong>JVM Architecture:</strong></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:600;color:var(--accent);font-size:12px;">Class Loader</div><div style="font-size:10px;color:var(--muted);">Loading, Linking, Initialization</div></div>
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:600;color:var(--accent2);font-size:12px;">Runtime Data</div><div style="font-size:10px;color:var(--muted);">Heap, Stack, Method Area</div></div>
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:600;color:var(--accent3);font-size:12px;">Execution Engine</div><div style="font-size:10px;color:var(--muted);">Interpreter + JIT Compiler</div></div>
    </div>
    <div class="card-m"><strong>Program Structure:</strong> Documentation ? Package ? Imports ? Class Definition ? main() method. Filename must match public class name.</div>`
  },
  {
    id: "classes-types",
    title: "3. Classes, Data Types, Variables, Operators",
    icon: "&#128220;",
    color: "var(--accent3)",
    duration: "3 hrs",
    concepts: ["Class Types", "8 Primitives", "3 Variable Types", "Operators", "Keywords"],
    content: `<div class="card-t" style="color:var(--accent3);margin-bottom:12px;">&#128220; Classes & Data Types</div>
    <div class="card-m" style="margin-bottom:12px;"><strong>Class Types:</strong> Concrete (instantiable), Abstract (cannot instantiate, may have abstract methods), Final (cannot extend), Static Nested / Inner Class.</div>
    <div class="card-m" style="margin-bottom:12px;"><strong>8 Primitive Data Types:</strong></div>
    <table class="tbl" style="margin-bottom:16px;"><thead><tr><th>Type</th><th>Size</th><th>Default</th><th>Range</th></tr></thead><tbody>
      <tr><td style="color:var(--accent);">byte</td><td>1 byte</td><td>0</td><td>-128 to 127</td></tr>
      <tr><td style="color:var(--accent);">short</td><td>2 bytes</td><td>0</td><td>-32,768 to 32,767</td></tr>
      <tr><td style="color:var(--accent);">int</td><td>4 bytes</td><td>0</td><td>-2 to 2-1</td></tr>
      <tr><td style="color:var(--accent);">long</td><td>8 bytes</td><td>0L</td><td>-26 to 26-1</td></tr>
      <tr><td style="color:var(--accent2);">float</td><td>4 bytes</td><td>0.0f</td><td>6-7 decimal digits</td></tr>
      <tr><td style="color:var(--accent2);">double</td><td>8 bytes</td><td>0.0d</td><td>15 decimal digits</td></tr>
      <tr><td style="color:var(--accent3);">char</td><td>2 bytes</td><td>'\u0000'</td><td>0 to 65,535</td></tr>
      <tr><td style="color:var(--accent4);">boolean</td><td>1 bit</td><td>false</td><td>true / false</td></tr>
    </tbody></table>
    <div class="card-m" style="margin-bottom:12px;"><strong>Variable Types:</strong> Local (inside method, no default), Instance (per-object, gets defaults), Static (shared, class-level).</div>
    <div class="card-m"><strong>Operators:</strong> Arithmetic (+,-,*,/,%), Relational (==,!=,>,<), Logical (&&,||,!), Bitwise (&,|,^,~,<<,>>), Assignment (=,+=,-=), Unary (++,--), Ternary (?:).</div>`
  },
  {
    id: "control-statements",
    title: "4. Control Statements",
    icon: "&#128257;",
    color: "var(--accent4)",
    duration: "2 hrs",
    concepts: ["if/else", "switch", "for", "while", "do-while", "break/continue"],
    content: `<div class="card-t" style="color:var(--accent4);margin-bottom:12px;">&#128257; Control Statements</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
      <div class="glass" style="padding:14px;"><div style="font-weight:700;color:var(--accent);margin-bottom:8px;">Decision Making</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">
          <code>if</code>  single condition<br>
          <code>if-else</code>  two-way branch<br>
          <code>if-else-if</code>  multi-way ladder<br>
          <code>switch</code>  multiple fixed values<br>
          <code>nested if</code>  condition inside condition
        </div>
      </div>
      <div class="glass" style="padding:14px;"><div style="font-weight:700;color:var(--accent2);margin-bottom:8px;">Looping</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">
          <code>for</code>  known iterations<br>
          <code>while</code>  condition-based<br>
          <code>do-while</code>  executes at least once<br>
          <code>for-each</code>  iterate collections<br>
          <code>break</code>  exit loop/switch<br>
          <code>continue</code>  skip iteration
        </div>
      </div>
    </div>
    <div class="card-m"><strong>Switch Fall-Through:</strong> Without break, execution continues through subsequent cases. Always use break to prevent unintended behavior.</div>`
  },
  {
    id: "wrapper-constructors",
    title: "5. Wrapper Classes, Constructors, Methods, Access Specifiers",
    icon: "&#128295;",
    color: "var(--accent5)",
    duration: "3 hrs",
    concepts: ["Autoboxing", "Constructor Types", "Method Overloading", "Access Levels"],
    content: `<div class="card-t" style="color:var(--accent5);margin-bottom:12px;">&#128295; Wrapper Classes & Constructors</div>
    <div class="card-m" style="margin-bottom:12px;"><strong>Wrapper Classes:</strong> Convert primitives to objects. Integer, Double, Character, Boolean, etc. Enable null representation and collections storage.</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:700;color:var(--accent);font-size:12px;">int &#8594; Integer</div><div style="font-size:10px;color:var(--muted);">Autoboxing</div></div>
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:700;color:var(--accent);font-size:12px;">Integer &#8594; int</div><div style="font-size:10px;color:var(--muted);">Unboxing</div></div>
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:700;color:var(--accent2);font-size:12px;">parseInt()</div><div style="font-size:10px;color:var(--muted);">String to int</div></div>
      <div class="glass" style="padding:10px;text-align:center;"><div style="font-weight:700;color:var(--accent2);font-size:12px;">toString()</div><div style="font-size:10px;color:var(--muted);">int to String</div></div>
    </div>
    <div class="card-m" style="margin-bottom:12px;"><strong>Constructor Types:</strong></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent);font-size:12px;">Default</div><div style="font-size:11px;color:var(--muted);">No args. Sets defaults. Auto-provided if none written.</div></div>
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent2);font-size:12px;">Parameterized</div><div style="font-size:11px;color:var(--muted);">Takes arguments. Sets custom values. Most common.</div></div>
      <div class="glass" style="padding:12px;"><div style="font-weight:700;color:var(--accent3);font-size:12px;">Copy</div><div style="font-size:11px;color:var(--muted);">Takes object as arg. Clones the object.</div></div>
    </div>
    <div class="card-m"><strong>Access Specifiers:</strong> private (class only), default (package), protected (package + subclasses), public (everywhere).</div>`
  },
  {
    id: "arrays-io",
    title: "6. Arrays, JavaDoc & I/O Classes",
    icon: "&#128451;",
    color: "var(--accent6)",
    duration: "2 hrs",
    concepts: ["1D/2D Arrays", "java.util.Arrays", "JavaDoc Tags", "Scanner", "BufferedReader"],
    content: `<div class="card-t" style="color:var(--accent6);margin-bottom:12px;">&#128451; Arrays & I/O</div>
    <div class="card-m" style="margin-bottom:12px;"><strong>Array Types:</strong> 1D (single row), 2D (matrix), Jagged (rows of different lengths).</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
      <div class="glass" style="padding:12px;text-align:center;"><div style="font-weight:700;color:var(--accent);font-size:12px;">1D Array</div><div style="font-family:monospace;font-size:11px;color:var(--muted);">int[] a = {1,2,3};</div></div>
      <div class="glass" style="padding:12px;text-align:center;"><div style="font-weight:700;color:var(--accent2);font-size:12px;">2D Array</div><div style="font-family:monospace;font-size:11px;color:var(--muted);">int[][] a = new int[3][3];</div></div>
      <div class="glass" style="padding:12px;text-align:center;"><div style="font-weight:700;color:var(--accent3);font-size:12px;">Jagged</div><div style="font-family:monospace;font-size:11px;color:var(--muted);">int[][] a = new int[3][];</div></div>
    </div>
    <div class="card-m" style="margin-bottom:12px;"><strong>java.util.Arrays methods:</strong> sort(), binarySearch(), fill(), toString(), copyOf(), equals().</div>
    <div class="card-m" style="margin-bottom:12px;"><strong>JavaDoc Tags:</strong> @author, @version, @param, @return, @throws, @see, @since. Generate HTML docs with: <code>javadoc Hello.java</code></div>
    <div class="card-m"><strong>I/O Classes:</strong> Scanner (console input), BufferedReader (efficient text reading), FileReader/FileWriter (file operations), System.in/out/err (standard streams).</div>`
  }
];

function renderTopics() {
  const list = document.getElementById('topics-list');
  if (!list) return;
  list.innerHTML = TOPICS_DATA.map((t, i) => `
    <div class="glass" style="margin-bottom:14px;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:14px;padding:16px 18px;cursor:pointer;" onclick="toggleTopic('${t.id}')">
        <div style="font-size:28px;flex-shrink:0;">${t.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;color:#fff;font-size:15px;">${t.title}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px;">${t.concepts.join(' &#8226; ')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <span class="badge badge-b" style="font-size:10px;">${t.duration}</span>
          <span style="color:var(--muted);font-size:18px;transition:transform .3s;" id="arrow-${t.id}">&#9660;</span>
        </div>
      </div>
      <div id="topic-${t.id}" style="display:none;border-top:1px solid var(--border);padding:18px;">
        ${t.content}
      </div>
    </div>
  `).join('');
}

function toggleTopic(id) {
  const el = document.getElementById('topic-' + id);
  const arrow = document.getElementById('arrow-' + id);
  if (!el) return;
  if (el.style.display === 'none' || !el.style.display) {
    el.style.display = 'block';
    el.style.animation = 'pageIn .3s ease';
    arrow.style.transform = 'rotate(180deg)';
  } else {
    el.style.display = 'none';
    arrow.style.transform = 'rotate(0deg)';
  }
}

function openTopic(id) {
  go('topics', document.querySelectorAll('.nav-i')[2]);
  setTimeout(() => {
    const el = document.getElementById('topic-' + id);
    const arrow = document.getElementById('arrow-' + id);
    if (el && el.style.display === 'none') {
      el.style.display = 'block';
      el.style.animation = 'pageIn .3s ease';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 350);
}

function initAll() {
  renderLP();
  renderNotes();
  renderMindMap();
  initMindMapInteractions();
  renderViz();
  flowTab('exec', document.querySelector('#pg-flowchart .tab'));
  umlTab('encap', document.querySelector('#pg-classdiagram .tab'));
  initProgs();
  renderGQ();
  renderCoding();
  initDebug();
  renderFC();
  renderScenarios();
  renderInterviews();
  initProjects();
  renderProj('all');
  renderTopics();
  saveProgress();
  initSearch();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initAll);



