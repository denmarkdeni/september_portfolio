/* =========================================================
   Deniston | Python Full-Stack Developer
   ---------------------------------------------------------
   1.  Config & helpers
   2.  Theme
   3.  Navbar, scroll progress, active link
   4.  Reveal on scroll + stat counters
   5.  Card tilt + pointer glow
   6.  Hero terminal (typing effect)
   7.  Interactive terminal (CLI playground)
   8.  Contact form
   9.  Resume download (generated PDF)
  10.  Fireball cursor
   ========================================================= */
(() => {
  'use strict';

  /* ---------- 1. Config & helpers ---------- */

  // Edit these values once; links and the terminal pick them up automatically.
  const CONFIG = {
    name: 'Deniston',
    role: 'Python Full-Stack Developer',
    education: "Bachelor's Degree",
    email: 'deniston@example.com',            // TODO: your real email
    github: 'https://github.com/',            // TODO: e.g. https://github.com/your-username
    linkedin: 'https://www.linkedin.com/',    // TODO: e.g. https://www.linkedin.com/in/your-name
    // Optional: URL that accepts a JSON POST { name, email, message }
    // (a Django REST endpoint, Formspree, Getform...). When empty, the form
    // opens the visitor's email app with the message pre-filled instead.
    formEndpoint: ''
  };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Push config values into the page
  $$('[data-cfg-href]').forEach((a) => {
    const key = a.dataset.cfgHref;
    a.href = key === 'email' ? 'mailto:' + CONFIG.email : CONFIG[key];
  });
  $$('[data-cfg-text]').forEach((el) => { el.textContent = CONFIG[el.dataset.cfgText]; });

  // Placeholder demo links should not jump the page to the top
  $$('[data-project-link]').forEach((a) => {
    a.addEventListener('click', (e) => { if (a.getAttribute('href') === '#') e.preventDefault(); });
  });

  /* ---------- 2. Theme ---------- */

  const themeBtn = $('#themeToggle');
  const themeMeta = $('meta[name="theme-color"]');

  function applyTheme(theme, save = true) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#09090b' : '#f5f6fb');
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (save) { try { localStorage.setItem('dn-theme', theme); } catch (e) { /* storage unavailable */ } }
  }
  applyTheme(root.getAttribute('data-theme') || 'dark', false);
  themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  /* ---------- 3. Navbar, progress, active link ---------- */

  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  const progress = $('#progress');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
      nav.classList.toggle('scrolled', window.scrollY > 10);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$('#navLinks > a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ---------- 4. Reveal on scroll + counters ---------- */

  function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  if ('IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        $$('.num[data-count]', entry.target).forEach(animateCount);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => revealIO.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
    $$('.num[data-count]').forEach(animateCount);
  }

  /* ---------- 5. Card tilt + pointer glow ---------- */

  const MAX_TILT = 5;
  $$('[data-tilt]').forEach((card) => {
    let frame = 0;
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (!reduceMotion) {
          card.style.setProperty('--rx', ((0.5 - y) * MAX_TILT * 2).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - 0.5) * MAX_TILT * 2).toFixed(2) + 'deg');
        }
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- 6. Hero terminal (typing effect) ---------- */

  const PY_KW = ['class', 'def', 'return', 'import', 'from', 'if', 'else', 'self', 'None', 'True', 'False', 'for', 'in', 'with', 'as'];
  const JS_KW = ['const', 'let', 'var', 'function', 'return', 'export', 'default', 'import', 'from', 'if', 'else', 'new', 'await', 'async'];

  // Tiny regex highlighter: comment | string | keyword | number | ClassName | function(
  function highlight(text, lang) {
    const kw = lang === 'py' ? PY_KW : JS_KW;
    const re = new RegExp([
      '(#.*|\\/\\/.*)',
      '("(?:\\\\.|[^"\\\\])*"?|\'(?:\\\\.|[^\'\\\\])*\'?)',
      '\\b(' + kw.join('|') + ')\\b',
      '\\b(\\d+(?:\\.\\d+)?)\\b',
      '\\b([A-Z][A-Za-z0-9_]*)\\b',
      '\\b([a-z_][A-Za-z0-9_]*)(?=\\()'
    ].join('|'), 'g');
    let html = '';
    let last = 0;
    text.replace(re, (m, c, s, k, n, cl, fn, offset) => {
      html += esc(text.slice(last, offset));
      const cls = c ? 't-c' : s ? 't-s' : k ? 't-k' : n ? 't-n' : cl ? 't-cl' : 't-f';
      html += '<span class="' + cls + '">' + esc(m) + '</span>';
      last = offset + m.length;
      return m;
    });
    return html + esc(text.slice(last));
  }

  const ok = (label, a, b) => '<span class="t-ok">\u2714</span> ' + label.padEnd(9) + '<span class="t-dim">' + a.padEnd(14) + '</span>' + b;

  const SCENES = [
    {
      title: 'bash: ~/api',
      steps: [
        { k: 'cmd', t: 'python manage.py runserver' },
        { k: 'out', h: '<span class="t-dim">Watching for file changes with StatReloader</span>' },
        { k: 'out', h: 'System check identified no issues (0 silenced).' },
        { k: 'out', h: 'Starting development server at <span class="t-cl">http://127.0.0.1:8000/</span>' },
        { k: 'blank' },
        { k: 'cmd', t: 'curl -s localhost:8000/api/health' },
        { k: 'out', h: '{<span class="t-s">"status"</span>: <span class="t-s">"ok"</span>, <span class="t-s">"db"</span>: <span class="t-s">"postgresql"</span>, <span class="t-s">"latency_ms"</span>: <span class="t-n">42</span>}' }
      ]
    },
    {
      title: 'api/views.py',
      steps: [
        { k: 'code', lang: 'py', t: 'from rest_framework.viewsets import ModelViewSet' },
        { k: 'blank' },
        { k: 'code', lang: 'py', t: 'class ProjectViewSet(ModelViewSet):' },
        { k: 'code', lang: 'py', t: '    queryset = Project.objects.select_related("owner")' },
        { k: 'code', lang: 'py', t: '    serializer_class = ProjectSerializer' },
        { k: 'code', lang: 'py', t: '    permission_classes = [IsAuthenticated]' },
        { k: 'blank' },
        { k: 'code', lang: 'py', t: '    def perform_create(self, serializer):' },
        { k: 'code', lang: 'py', t: '        serializer.save(owner=self.request.user)' }
      ]
    },
    {
      title: 'src/Projects.jsx',
      steps: [
        { k: 'code', lang: 'js', t: 'import { useEffect, useState } from "react";' },
        { k: 'blank' },
        { k: 'code', lang: 'js', t: 'export default function Projects() {' },
        { k: 'code', lang: 'js', t: '  const [items, setItems] = useState([]);' },
        { k: 'blank' },
        { k: 'code', lang: 'js', t: '  useEffect(() => {' },
        { k: 'code', lang: 'js', t: '    api.get("/projects/").then(setItems);' },
        { k: 'code', lang: 'js', t: '  }, []);' },
        { k: 'blank' },
        { k: 'code', lang: 'js', t: '  return <ProjectGrid items={items} />;' },
        { k: 'code', lang: 'js', t: '}' }
      ]
    },
    {
      title: 'bash: ~/deniston',
      steps: [
        { k: 'cmd', t: 'deniston --status' },
        { k: 'out', h: ok('api', '200 OK', '42ms') },
        { k: 'out', h: ok('postgres', 'connected', 'pool 10/20') },
        { k: 'out', h: ok('mongodb', 'connected', 'replica set') },
        { k: 'out', h: ok('docker', '3 containers', 'healthy') },
        { k: 'out', h: ok('tests', '128 passed', '0 failed') },
        { k: 'blank' },
        { k: 'out', h: '<span class="t-b">All systems go.</span>' }
      ]
    }
  ];

  (function heroTerminal() {
    const body = $('#heroTermBody');
    const title = $('#heroTermTitle');
    if (!body) return;

    const lineHtml = (s, text) => {
      if (s.k === 'cmd') return '<span class="t-p">$</span> ' + esc(text);
      return highlight(text, s.lang);
    };
    const paint = (lines, current) => {
      let html = lines.join('\n');
      if (current != null) html += (lines.length ? '\n' : '') + current;
      body.innerHTML = html + '<span class="caret"></span>';
      body.scrollTop = body.scrollHeight;
    };
    const completed = (scene) => scene.steps.map((s) =>
      s.k === 'blank' ? '' : s.k === 'out' ? s.h : lineHtml(s, s.t));

    // Reduced motion: show one finished scene, no typing
    if (reduceMotion) {
      title.textContent = SCENES[0].title;
      paint(completed(SCENES[0]));
      return;
    }

    // Only animate while the terminal is on screen
    let onScreen = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(body);
    }
    const gate = async () => { while (!onScreen || document.hidden) await sleep(300); };

    (async function loop() {
      let i = 0;
      await sleep(700);
      for (;;) {
        const scene = SCENES[i % SCENES.length];
        title.textContent = scene.title;
        const done = [];
        for (const s of scene.steps) {
          await gate();
          if (s.k === 'blank') { done.push(''); paint(done); await sleep(120); continue; }
          if (s.k === 'out') { done.push(s.h); paint(done); await sleep(170); continue; }
          const lead = (s.t.match(/^ */) || [''])[0].length;
          const speed = s.k === 'cmd' ? [40, 85] : [14, 34];
          for (let n = lead + 1; n <= s.t.length; n++) {
            paint(done, lineHtml(s, s.t.slice(0, n)));
            await sleep(rand(speed[0], speed[1]));
          }
          done.push(lineHtml(s, s.t));
          paint(done);
          await sleep(s.k === 'cmd' ? 380 : 120);
        }
        await sleep(2600);
        i++;
      }
    })();
  })();

  /* ---------- 7. Interactive terminal (CLI playground) ---------- */

  (function playground() {
    const out = $('#pgOut');
    const form = $('#pgForm');
    const input = $('#pgInput');
    if (!out || !form || !input) return;

    const history = [];
    let hIndex = 0;

    const line = (html, cls) => {
      const d = document.createElement('div');
      d.className = 'ln' + (cls ? ' ' + cls : '');
      d.innerHTML = html;
      out.appendChild(d);
    };
    const gap = () => line('', 'gap');
    const scrollDown = () => { out.scrollTop = out.scrollHeight; };
    const cmd = (name, desc) => '  <span class="t-cl">' + name.padEnd(11) + '</span>' + desc;
    const row = (label, value) => '  <span class="t-dim">' + label.padEnd(11) + '</span>' + value;

    const go = (id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };

    const COMMANDS = {
      help() {
        line('Available commands:');
        line(cmd('whoami', 'A short intro'));
        line(cmd('skills', 'Tech stack by category'));
        line(cmd('projects', 'Featured projects'));
        line(cmd('education', 'Academic background'));
        line(cmd('contact', 'Ways to reach me'));
        line(cmd('neofetch', 'System summary'));
        line(cmd('ls', 'List page sections'));
        line(cmd('cd', 'Jump to a section, e.g. cd projects'));
        line(cmd('theme', 'theme dark | light | toggle'));
        line(cmd('clear', 'Clear the screen'));
      },
      whoami() {
        line('<span class="t-b">' + esc(CONFIG.name) + '</span> <span class="t-dim">-</span> ' + esc(CONFIG.role));
        line('Holds a Bachelor\'s degree. Builds Django REST APIs, models data in');
        line('PostgreSQL and MongoDB, and ships React interfaces.');
      },
      skills() {
        line(row('Backend', 'Python, Django, RESTful APIs, PostgreSQL, MongoDB'));
        line(row('Frontend', 'React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS'));
        line(row('Tooling', 'Git, GitHub, Docker, Postman, Linux, CI/CD basics'));
      },
      projects() {
        line(row('TaskFlow', 'Django REST + React kanban with JWT auth and roles'));
        line(row('Storefront', 'Catalog, cart, and orders on Django with a React shop'));
        line(row('Pulse', 'MongoDB event aggregation with a React error-rate dashboard'));
        gap();
        line('<span class="t-dim">Run</span> <span class="t-cl">cd projects</span> <span class="t-dim">to see them on the page.</span>');
      },
      education() {
        line(row('Degree', esc(CONFIG.education)));
        line(row('Focus', 'Problem solving and software fundamentals'));
      },
      contact() {
        line(row('Email', '<a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + '</a>'));
        line(row('GitHub', '<a href="' + esc(CONFIG.github) + '" target="_blank" rel="noopener">' + esc(CONFIG.github.replace(/^https?:\/\//, '')) + '</a>'));
        line(row('LinkedIn', '<a href="' + esc(CONFIG.linkedin) + '" target="_blank" rel="noopener">' + esc(CONFIG.linkedin.replace(/^https?:\/\//, '')) + '</a>'));
      },
      neofetch() {
        line('  <span class="t-p">' + esc(CONFIG.name.toLowerCase()) + '@portfolio</span>');
        line('  <span class="t-dim">------------------</span>');
        line(row('Role', esc(CONFIG.role)));
        line(row('Education', esc(CONFIG.education)));
        line(row('Backend', 'Python, Django, PostgreSQL, MongoDB'));
        line(row('Frontend', 'React, JavaScript, HTML5, CSS3, Tailwind'));
        line(row('Tools', 'Git, GitHub, Docker, Postman'));
        line(row('Status', '<span class="t-ok">open to new projects</span>'));
      },
      ls() {
        line('<span class="t-cl">about/  skills/  projects/  experience/  terminal/  contact/</span>');
      },
      cd(args) {
        const target = (args[0] || '').replace(/\/$/, '').toLowerCase();
        const map = { about: 'about', skills: 'skills', projects: 'projects', experience: 'experience', terminal: 'playground', contact: 'contact', '~': 'top', '..': 'top' };
        if (!map[target]) return line('cd: no such section: ' + esc(target || '(none)') + '. Try <span class="t-cl">ls</span>.', 't-err');
        line('<span class="t-dim">Jumping to ' + esc(target) + '...</span>');
        go(map[target]);
      },
      theme(args) {
        const arg = (args[0] || 'toggle').toLowerCase();
        const current = root.getAttribute('data-theme');
        const next = arg === 'toggle' ? (current === 'dark' ? 'light' : 'dark') : arg;
        if (next !== 'dark' && next !== 'light') return line('usage: theme dark | light | toggle', 't-err');
        applyTheme(next);
        line('Theme set to <span class="t-cl">' + next + '</span>.');
      },
      date() { line(esc(new Date().toString())); },
      echo(args) { line(esc(args.join(' '))); },
      clear() { out.innerHTML = ''; },
      sudo(args) {
        if (args.join(' ').toLowerCase().replace(/\s+/g, ' ') === 'hire deniston') {
          line('<span class="t-ok">Permission granted.</span> Opening the contact form...');
          setTimeout(() => { go('contact'); }, 700);
        } else {
          line(esc(CONFIG.name.toLowerCase()) + ' is not in the sudoers file. This incident will be reported.', 't-warn');
        }
      }
    };
    COMMANDS.about = COMMANDS.whoami;
    COMMANDS.stack = COMMANDS.skills;

    function run(raw, { echo = true } = {}) {
      const text = raw.trim();
      if (echo) {
        const d = document.createElement('div');
        d.className = 'ln';
        d.innerHTML = '<span class="t-p">deniston@portfolio</span><span class="t-dim">:</span><span class="t-cl">~</span><span class="t-dim">$</span> ';
        d.appendChild(document.createTextNode(text));
        out.appendChild(d);
      }
      if (!text) return scrollDown();
      history.push(text);
      hIndex = history.length;
      const [name, ...args] = text.split(/\s+/);
      const fn = COMMANDS[name.toLowerCase()];
      if (fn) fn(args);
      else line('command not found: ' + esc(name) + '. Type <span class="t-cl">help</span> to see what is available.', 't-err');
      if (name.toLowerCase() !== 'clear') gap();
      scrollDown();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value;
      input.value = '';
      run(v);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIndex > 0) input.value = history[--hIndex];
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        hIndex = Math.min(hIndex + 1, history.length);
        input.value = history[hIndex] || '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const v = input.value.trim().toLowerCase();
        if (!v) return;
        const match = Object.keys(COMMANDS).filter((c) => c.startsWith(v));
        if (match.length === 1) input.value = match[0];
        else if (match.length > 1) line(match.map((m) => '<span class="t-cl">' + m + '</span>').join('  '));
        scrollDown();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        COMMANDS.clear();
      }
    });

    // Click anywhere in the terminal to focus the prompt (without scrolling the page)
    $('#pg').addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (window.getSelection && String(window.getSelection())) return;
      input.focus({ preventScroll: true });
    });

    // Quick-command chips (handy on phones)
    $$('[data-cmd]').forEach((btn) => btn.addEventListener('click', () => run(btn.dataset.cmd)));

    line('Welcome to <span class="t-b">' + esc(CONFIG.name) + '</span>\'s portfolio shell.');
    line('Type <span class="t-cl">help</span> to list commands, or tap a shortcut below.');
    gap();
  })();

  /* ---------- 8. Contact form ---------- */

  (function contactForm() {
    const form = $('#contactForm');
    if (!form) return;
    const btn = $('#sendBtn');
    const label = $('.lbl', btn);
    const status = $('#formStatus');
    const fields = {
      name:    { el: $('#cName'),  err: $('#cNameErr'),  check: (v) => v.trim().length >= 2, msg: 'Enter your name.' },
      email:   { el: $('#cEmail'), err: $('#cEmailErr'), check: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Enter a valid email, like you@company.com.' },
      message: { el: $('#cMsg'),   err: $('#cMsgErr'),   check: (v) => v.trim().length >= 10, msg: 'Write at least 10 characters so I know how to help.' }
    };

    function setState(state, text) {
      btn.classList.toggle('is-loading', state === 'loading');
      btn.classList.toggle('is-success', state === 'success');
      label.textContent = text;
    }

    Object.values(fields).forEach((f) => {
      f.el.addEventListener('input', () => { f.el.removeAttribute('aria-invalid'); f.err.textContent = ''; });
    });

    function validate() {
      let firstBad = null;
      Object.values(fields).forEach((f) => {
        const good = f.check(f.el.value);
        f.el.setAttribute('aria-invalid', good ? 'false' : 'true');
        f.err.textContent = good ? '' : f.msg;
        if (!good && !firstBad) firstBad = f.el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      if (!validate()) return;

      const payload = { name: fields.name.el.value.trim(), email: fields.email.el.value.trim(), message: fields.message.el.value.trim() };
      setState('loading', 'Sending...');

      try {
        if (CONFIG.formEndpoint) {
          const res = await fetch(CONFIG.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Request failed with status ' + res.status);
          setState('success', 'Message Sent');
          status.textContent = 'Thanks, your message is in. I will reply by email.';
        } else {
          await sleep(900);
          const subject = encodeURIComponent('Portfolio message from ' + payload.name);
          const body = encodeURIComponent(payload.message + '\n\n' + payload.name + '\n' + payload.email);
          window.location.href = 'mailto:' + CONFIG.email + '?subject=' + subject + '&body=' + body;
          setState('success', 'Opening Email App');
          status.textContent = 'Your email app should open with the message ready to send.';
        }
        form.reset();
        setTimeout(() => setState('idle', 'Send Message'), 4500);
      } catch (err) {
        setState('idle', 'Send Message');
        status.textContent = 'The message did not send. Try again, or email me directly at ' + CONFIG.email + '.';
      }
    });
  })();

  /* ---------- 9. Resume download (generated PDF) ---------- */

  // Builds a simple one-page PDF in the browser so the button works out of the box.
  // To ship your own designed resume instead, replace this with a link to a PDF file.
  (function resume() {
    const wrap = (text, n = 88) => {
      const lines = [];
      let cur = '';
      text.split(' ').forEach((w) => {
        if ((cur + ' ' + w).trim().length > n) { lines.push(cur); cur = w; }
        else cur = (cur + ' ' + w).trim();
      });
      if (cur) lines.push(cur);
      return lines;
    };
    const pdfEsc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

    function buildPdf() {
      const H = [0.03, 0.57, 0.70];  // heading color
      const T = [0.10, 0.10, 0.12];  // text color
      const L = [];
      const add = (t, size, gap, bold = false, color = T) => L.push({ t, size, gap, bold, color });
      const heading = (t) => add(t.toUpperCase(), 11, 32, true, H);

      add(CONFIG.name, 26, 22, true);
      add(CONFIG.role, 13, 24, false, H);
      add([CONFIG.email, CONFIG.github.replace(/^https?:\/\//, ''), CONFIG.linkedin.replace(/^https?:\/\//, '')].join('   |   '), 9.5, 18);

      heading('Summary');
      wrap('Python full-stack developer with a Bachelor\'s degree. I design Django REST APIs, model data in PostgreSQL and MongoDB, and build React interfaces that stay fast as they grow.')
        .forEach((t, i) => add(t, 10.5, i ? 15 : 18));

      heading('Skills');
      add('Backend: Python, Django, RESTful APIs, PostgreSQL, MongoDB, Database design', 10.5, 18);
      add('Frontend: React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Responsive UI design', 10.5, 15);
      add('Tooling: Git, GitHub, Docker, Postman, Linux, CI/CD basics', 10.5, 15);

      heading('Selected Projects');
      [
        ['TaskFlow', 'Django REST API with JWT auth and role-based permissions, feeding a React kanban board.'],
        ['Storefront', 'Product catalog, cart, and order flow on Django with a Tailwind-styled React storefront.'],
        ['Pulse', 'Service events aggregated in MongoDB and charted in a React error-rate dashboard.']
      ].forEach(([name, desc]) => {
        add(name, 10.5, 20, true);
        wrap(desc).forEach((t) => add(t, 10.5, 14.5));
      });

      heading('Education');
      add(CONFIG.education, 10.5, 18, true);

      let y = 770;
      let stream = '';
      L.forEach((l) => {
        y -= l.gap;
        stream += l.color.join(' ') + ' rg\nBT /' + (l.bold ? 'F2' : 'F1') + ' ' + l.size + ' Tf 56 ' + y.toFixed(1) + ' Td (' + pdfEsc(l.t) + ') Tj ET\n';
      });

      const objs = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream'
      ];
      let pdf = '%PDF-1.4\n';
      const offsets = [];
      objs.forEach((o, i) => { offsets.push(pdf.length); pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
      const xref = pdf.length;
      pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' +
        offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
        'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
      return new Blob([pdf], { type: 'application/pdf' });
    }

    $$('[data-resume]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = URL.createObjectURL(buildPdf());
        const a = document.createElement('a');
        a.href = url;
        a.download = CONFIG.name + '-Resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMenu(false);
      });
    });
  })();

  /* ---------- 10. Fireball cursor ---------- */

  (function fireball() {
    // Mouse/trackpad only; touch devices keep their normal behavior.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-cursor';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    let W = 0, H = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0, y: 0 };
    const head = { x: 0, y: 0, vx: 0, vy: 0 };
    let visible = false;
    let size = 1, sizeTarget = 1;
    let parts = [];

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        head.x = mouse.x; head.y = mouse.y;
        document.body.classList.add('has-fireball');
      }
      const t = e.target;
      sizeTarget = t && t.closest && t.closest('a, button, [role="button"], .chip') ? 1.55 : 1;
    }, { passive: true });
    document.addEventListener('pointerdown', () => { sizeTarget = 0.7; });
    document.addEventListener('pointerup', () => { sizeTarget = 1; });
    root.addEventListener('mouseleave', () => { visible = false; document.body.classList.remove('has-fireball'); });

    function frame(now) {
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      if (!visible && !parts.length) return;

      const light = root.getAttribute('data-theme') === 'light';

      // Head eases toward the pointer, which gives the trail its motion
      const px = head.x, py = head.y;
      head.x += (mouse.x - head.x) * 0.32;
      head.y += (mouse.y - head.y) * 0.32;
      head.vx = head.x - px; head.vy = head.y - py;
      size += (sizeTarget - size) * 0.15;

      // Emit flame particles: a steady flicker, more when moving fast
      if (visible && !reduceMotion) {
        const speed = Math.hypot(head.vx, head.vy);
        const n = 2 + Math.min(6, Math.floor(speed / 3));
        for (let i = 0; i < n; i++) {
          parts.push({
            x: head.x + rand(-3, 3) * size, y: head.y + rand(-3, 3) * size,
            vx: rand(-0.5, 0.5) - head.vx * 0.12, vy: rand(-1.7, -0.5) - head.vy * 0.12,
            life: 1, decay: rand(0.02, 0.04), r: rand(6, 11) * size
          });
        }
        if (parts.length > 240) parts.splice(0, parts.length - 240);
      }

      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        p.vy -= 0.025; p.vx += rand(-0.08, 0.08);
        p.life -= p.decay; p.r *= 0.972;
        if (p.life <= 0) { parts.splice(i, 1); continue; }

        const t = p.life;                       // 1 (fresh) -> 0 (gone)
        const hue = 8 + t * 44;                 // red -> orange -> yellow
        const lum = light ? 48 : 42 + t * 28;
        const alpha = (light ? 0.55 : 0.75) * t;
        const rad = p.r * 1.7;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        g.addColorStop(0, 'hsla(' + hue + ',100%,' + lum + '%,' + alpha + ')');
        g.addColorStop(1, 'hsla(' + (hue - 8) + ',100%,' + (lum - 10) + '%,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      if (visible) {
        // The fireball itself: white-hot core, orange body, red fringe
        const flicker = 1 + Math.sin(now * 0.02) * 0.05 + rand(-0.03, 0.03);
        const R = 20 * size * flicker;
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, R);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.2, 'rgba(255,244,190,1)');
        g.addColorStop(0.5, 'rgba(255,150,40,0.95)');
        g.addColorStop(0.8, 'rgba(255,70,10,0.45)');
        g.addColorStop(1, 'rgba(255,40,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(head.x, head.y, R, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  })();
})();