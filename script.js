// ==========================================================
// SentinelAudit — frontend prototype logic (no backend, no APIs)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  initSidebarNav();
  initHamburger();
  animateCounters();
  initAudit();
  initFindingFilters();
  initSimulation();
  initChat();
});

/* ---------------- Sidebar navigation ---------------- */
function initSidebarNav() {
  const links = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const target = link.dataset.page;
      pages.forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + target).classList.add('active');

      // Close sidebar on mobile after navigating
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  btn.addEventListener('click', () => sidebar.classList.toggle('open'));
}

/* ---------------- Dashboard counters ---------------- */
function animateCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ---------------- Configuration Audit (simulated) ---------------- */
function initAudit() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const fileChip = document.getElementById('fileChip');
  const runBtn = document.getElementById('runAuditBtn');
  const resultsPanel = document.getElementById('auditResults');

  let selectedFile = null;

  uploadZone.addEventListener('click', () => fileInput.click());

  ['dragover', 'dragenter'].forEach(evt =>
    uploadZone.addEventListener(evt, e => {
      e.preventDefault();
      uploadZone.classList.add('drag');
    })
  );
  ['dragleave', 'drop'].forEach(evt =>
    uploadZone.addEventListener(evt, e => {
      e.preventDefault();
      uploadZone.classList.remove('drag');
    })
  );
  uploadZone.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    selectedFile = file;
    fileChip.hidden = false;
    fileChip.textContent = file.name;
  }

  runBtn.addEventListener('click', () => {
    resultsPanel.hidden = false;

    // Simulated vendor detection
    const vendors = ['Cisco', 'Fortinet', 'Juniper'];
    let vendor = vendors[Math.floor(Math.random() * vendors.length)];
    if (selectedFile) {
      const name = selectedFile.name.toLowerCase();
      if (name.includes('cisco')) vendor = 'Cisco';
      else if (name.includes('forti')) vendor = 'Fortinet';
      else if (name.includes('juniper')) vendor = 'Juniper';
    }

    const totalChecks = 24;
    const failed = Math.floor(Math.random() * 6) + 2; // 2–7 failed
    const passed = totalChecks - failed;
    const score = Math.round((passed / totalChecks) * 100);

    let risk = 'Low';
    if (score < 60) risk = 'Critical';
    else if (score < 75) risk = 'High';
    else if (score < 90) risk = 'Medium';

    document.getElementById('resVendor').textContent = vendor;
    document.getElementById('resChecks').textContent = totalChecks;
    document.getElementById('resPassed').textContent = passed;
    document.getElementById('resFailed').textContent = failed;
    document.getElementById('resScore').textContent = score + '%';
    document.getElementById('resRisk').textContent = risk;

    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ---------------- Findings filters ---------------- */
function initFindingFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.finding-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.severity === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---------------- Network Simulation ---------------- */
function initSimulation() {
  const nodes = document.querySelectorAll('.topo-node');
  const log = document.getElementById('simLog');
  const toast = document.getElementById('toast');

  document.getElementById('btnStart').addEventListener('click', () => {
    resetNodes();
    logLine('Simulation started. Sweeping topology for live status...', 'ok');

    let i = 0;
    nodes.forEach(node => {
      setTimeout(() => {
        node.classList.add('state-active');
        logLine(`Checked ${node.querySelector('span:last-child').textContent} — reachable`, 'ok');
      }, i * 350);
      i++;
    });
  });

  document.getElementById('btnIssue').addEventListener('click', () => {
    resetNodes(false);
    const fw = document.querySelector('.topo-node[data-node="firewall"]');
    fw.classList.remove('state-active');
    fw.classList.add('state-critical');
    logLine('CRITICAL: Overly permissive rule detected on Branch Firewall.', 'critical');
    showToast('Critical security issue detected on Branch Firewall.');
  });

  document.getElementById('btnDrift').addEventListener('click', () => {
    const router = document.querySelector('.topo-node[data-node="branch-router"]');
    router.classList.remove('state-active', 'state-critical');
    router.classList.add('state-warning');
    logLine('WARNING: Configuration drift detected on Juniper Branch Router (baseline mismatch).', 'warning');
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    resetNodes();
    log.innerHTML = '<div class="sim-log-line">Simulation idle. Press "Start Simulation" to begin.</div>';
  });

  function resetNodes(clearActive = true) {
    nodes.forEach(n => n.classList.remove('state-critical', 'state-warning'));
    if (clearActive) nodes.forEach(n => n.classList.remove('state-active'));
  }

  function logLine(text, type) {
    const line = document.createElement('div');
    line.className = 'sim-log-line' + (type ? ' log-' + type : '');
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

/* ---------------- AI Security Assistant (simulated) ---------------- */
function initChat() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const window_ = document.getElementById('chatWindow');
  const chips = document.querySelectorAll('.chip-btn');

  const responses = [
    {
      keywords: ['firewall', 'insecure', 'any-to-any', 'any to any'],
      answer: 'The firewall contains an overly permissive rule that allows unrestricted traffic. Restrict the source, destination and required services.'
    },
    {
      keywords: ['telnet'],
      answer: 'Telnet transmits credentials in plaintext. Disable Telnet and switch to SSHv2 for all remote management access.'
    },
    {
      keywords: ['compliance', 'score'],
      answer: 'Your current fleet-wide compliance score is 78%. Network Security and Logging are the weakest categories and should be prioritized.'
    },
    {
      keywords: ['log', 'logging'],
      answer: 'Logging is disabled on Core-Router. Enable centralized logging and forward events to a syslog server for visibility.'
    },
    {
      keywords: ['ntp', 'time'],
      answer: 'NTP is not configured on Branch-Router, which can cause clock drift. Configure at least two NTP servers for accurate timestamps.'
    },
    {
      keywords: ['critical', 'issue', 'issues'],
      answer: 'There are 3 critical issues, the most severe being an Any-to-Any firewall rule on Branch-FW. Address critical findings first.'
    },
    {
      keywords: ['device', 'devices'],
      answer: 'You have 12 devices across Cisco, Juniper and Fortinet, with 10 audited so far. Branch-Router currently has the lowest security score at 54%.'
    }
  ];

  const fallback = "I don't have a specific answer for that in this prototype, but in the full version I'd analyze your live configuration and findings to answer that.";

  function respond(question) {
    const q = question.toLowerCase();
    const match = responses.find(r => r.keywords.some(k => q.includes(k)));
    return match ? match.answer : fallback;
  }

  function addMessage(text, from) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + (from === 'user' ? 'chat-user' : 'chat-bot');
    msg.innerHTML = `
      <div class="chat-avatar">${from === 'user' ? 'You' : '✦'}</div>
      <div class="chat-bubble"></div>
    `;
    msg.querySelector('.chat-bubble').textContent = text;
    window_.appendChild(msg);
    window_.scrollTop = window_.scrollHeight;
  }

  function handleAsk(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    setTimeout(() => addMessage(respond(text), 'bot'), 500);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    handleAsk(input.value);
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => handleAsk(chip.dataset.q));
  });
}
