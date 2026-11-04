(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const parts = {
    mcu: { group:'Controller', name:'ESP32-S3 module', kicker:'MAIN CONTROLLER', description:'The ESP32-S3 is the controller that runs the application firmware. Waveshare documents a dual-core Xtensa LX7 processor up to 240 MHz with 2.4 GHz Wi-Fi and Bluetooth LE.', tags:['Dual-core LX7','Up to 240 MHz','Wi-Fi + BLE'], note:'The controller sits inside the enclosure. Use the internal view to see its conceptual position.' },
    di: { group:'Field I/O', name:'Digital inputs · DI1–DI8', kicker:'FIELD INPUTS', description:'Eight optocoupler-isolated digital inputs accept dry-contact or active-switch signals. The supplied practical example uses a push button on DI1.', tags:['8 channels','Optocoupler isolated','Dry contact / active switch'], note:'On a real device, DI states are read from the field wiring. A website cannot force a physical input ON.' },
    do: { group:'Field I/O', name:'Digital outputs · DO1–DO8', kicker:'FIELD OUTPUTS', description:'Eight optocoupler-isolated Darlington transistor outputs are controlled by firmware. Waveshare specifies sinking output current up to 500 mA per channel.', tags:['8 channels','Sinking transistor outputs','Up to 500 mA sink current'], note:'These are transistor outputs, not mechanical relay contacts. Verify the load and wiring against the official manual.' },
    power: { group:'Power', name:'DC power input · 7–36 V', kicker:'POWER INPUT', description:'The removable two-position terminal block provides the wide-range DC supply input. The manufacturer specifies 7–36 V DC, with USB-C and PoE also listed as power options.', tags:['7–36 V DC','Screw terminal','Polarity marked'], note:'Check polarity and the power source rating before energising the controller.' },
    rs485: { group:'Connectivity', name:'RS485 interface', kicker:'INDUSTRIAL COMMUNICATION', description:'The isolated RS485 interface exposes A, B and G terminals for compatible serial devices and Modbus RTU applications.', tags:['A / B / G','Isolated','Modbus RTU use cases'], note:'Check bus polarity, termination and topology for the devices being connected.' },
    can: { group:'Connectivity', name:'CAN interface', kicker:'INDUSTRIAL COMMUNICATION', description:'The board includes an isolated CAN interface with H, L and G terminals for compatible CAN networks.', tags:['H / L / G','Isolated CAN','CAN 2.0 use cases'], note:'CAN networks require suitable wiring and termination at the correct points.' },
    usb: { group:'Connectivity', name:'USB Type-C', kicker:'PROGRAMMING & DEBUG', description:'USB-C is used for development power, firmware download and debugging. The website can use browser serial access on supported desktop browsers after the correct firmware protocol is installed.', tags:['USB-C','Firmware upload','Serial debug'], note:'The browser-based flasher is planned around a verified merged firmware image and Web Serial.' },
    ethernet: { group:'Connectivity', name:'Ethernet / PoE', kicker:'WIRED NETWORK', description:'The board uses a W5500 Ethernet controller for 10/100 Mbps networking and an IEEE 802.3af PoE module for compatible power-over-Ethernet installations.', tags:['W5500','10/100 Mbps','IEEE 802.3af PoE'], note:'A regular Ethernet switch does not necessarily provide PoE. Use compatible PoE equipment.' },
    antenna: { group:'Connectivity', name:'External antenna', kicker:'WIRELESS', description:'The external antenna supports the board’s Wi-Fi and Bluetooth radio functions.', tags:['External antenna','2.4 GHz Wi-Fi','Bluetooth LE'], note:'Keep the antenna attached and positioned as recommended by the manufacturer.' },
    buzzer: { group:'Controller', name:'Onboard buzzer', kicker:'AUDIO FEEDBACK', description:'The board includes an onboard buzzer. Waveshare maps its control to GPIO46 in the interface table.', tags:['Onboard component','GPIO46','Audible feedback'], note:'The buzzer can be used for status tones, alerts and the adapted mini-piano lesson.' }
  };

  const componentGroups = [
    ['Controller', ['mcu', 'buzzer']],
    ['Field I/O', ['di', 'do']],
    ['Connectivity', ['ethernet', 'usb', 'rs485', 'can', 'antenna']],
    ['Power', ['power']]
  ];

  // Lesson content is loaded after the source Lessons 2–6 are confirmed.

  // Navigation
  const viewNames = ['home','meet','guide','lessons','reference'];
  function showView(name) {
    const target = viewNames.includes(name) ? name : 'home';
    $$('.view').forEach(view => view.classList.toggle('active', view.id === `view-${target}`));
    $$('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.nav === target));
    history.replaceState(null, '', `#${target}`);
    $('#main-nav').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded','false');
    window.dispatchEvent(new CustomEvent('board:resize'));
  }
  $$('[data-nav]').forEach(button => button.addEventListener('click', () => showView(button.dataset.nav)));
  $('#menu-toggle').addEventListener('click', () => {
    const nav = $('#main-nav'); nav.classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });

  // Meet the Board component list and detail panel.
  const list = $('#component-list');
  list.innerHTML = componentGroups.map(([group, ids]) => `<div class="component-group-label">${group}</div>${ids.map(id => `<button class="component-button" data-part="${id}"><i class="component-dot"></i><span>${parts[id].name}</span><small>↗</small></button>`).join('')}`).join('');
  function renderPart(id, focus = false) {
    const part = parts[id] || parts.mcu;
    $('#detail-kicker').textContent = part.kicker;
    $('#detail-title').textContent = part.name;
    $('#detail-description').textContent = part.description;
    $('#detail-tags').innerHTML = part.tags.map(tag => `<span>${tag}</span>`).join('');
    $('#detail-note').textContent = part.note;
    $$('[data-part]').forEach(button => button.classList.toggle('active', button.dataset.part === id));
    if (focus) window.dispatchEvent(new CustomEvent('board:focus', { detail: { id } }));
  }
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-part]'); if (button) renderPart(button.dataset.part, true);
  });
  window.addEventListener('board:component-selected', event => {
    if (event.detail?.id) renderPart(event.detail.id, false);
  });
  renderPart('mcu');
  $('#meet-reset').addEventListener('click', () => { spin = true; window.dispatchEvent(new CustomEvent('board:reset')); $('#meet-spin').textContent = 'Pause spin'; });
  let spin = true;
  $('#meet-spin').addEventListener('click', event => {
    spin = !spin; event.currentTarget.textContent = spin ? 'Pause spin' : 'Resume spin';
    window.dispatchEvent(new CustomEvent('board:spin', { detail: { enabled: spin } }));
  });
  let internalsShown = false;
  $('#meet-explode')?.addEventListener('click', event => { internalsShown = !internalsShown; window.dispatchEvent(new CustomEvent('board:internals', { detail: { show: internalsShown } })); event.currentTarget.textContent = internalsShown ? 'Hide internals' : 'Show internals'; });

  // Guide tabs
  $$('.guide-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.guide-tab').forEach(t => t.classList.toggle('active', t === tab));
    $$('.guide-pane').forEach(pane => pane.classList.toggle('active', pane.id === `guide-${tab.dataset.guide}`));
    window.dispatchEvent(new CustomEvent('board:resize'));
  }));

  // Two paths through the Guide: browser-only simulation or physical hardware.
  let guideMode = 'virtual';
  function setGuideMode(mode) {
    guideMode = mode === 'hardware' ? 'hardware' : 'virtual';
    $('#view-guide').dataset.mode = guideMode;
    $$('.guide-mode-button').forEach(button => button.classList.toggle('active', button.dataset.guideMode === guideMode));
    $$('.virtual-mode-panel').forEach(panel => { panel.hidden = guideMode !== 'virtual'; });
    $$('.hardware-mode-panel').forEach(panel => { panel.hidden = guideMode !== 'hardware'; });
    ioMode = guideMode === 'virtual' ? 'demo' : 'hardware';
    if (guideMode === 'hardware' && !serialPort) {
      $('#connection-state').classList.remove('connected');
      $('#connection-state').innerHTML = '<i></i> HARDWARE NOT CONNECTED';
      $('#usb-note').textContent = 'Connect the physical board over USB-C. Live I/O requires the companion web-bridge firmware; the browser firmware installer remains disabled until that build is verified.';
    } else if (guideMode === 'virtual') {
      $('#connection-state').classList.remove('connected');
      $('#connection-state').innerHTML = '<i></i> VIRTUAL MODE';
    }
    renderIO();
    window.dispatchEvent(new CustomEvent('board:resize'));
  }
  $$('.guide-mode-button').forEach(button => button.addEventListener('click', () => setGuideMode(button.dataset.guideMode)));

  // I/O demo and optional USB serial bridge.
  let di = Array(8).fill(false);
  let dout = Array(8).fill(false);
  let ioMode = 'demo';
  let serialPort = null;
  let serialReader = null;
  let serialWriter = null;
  let serialBuffer = '';
  let readLoopActive = false;

  function logSerial(line) {
    const log = $('#serial-log');
    if (log.textContent === 'Waiting for USB connection…') log.textContent = '';
    log.textContent += `${line}\n`;
    const lines = log.textContent.split('\n');
    if (lines.length > 18) log.textContent = lines.slice(-18).join('\n');
    log.scrollTop = log.scrollHeight;
  }
  function renderIO() {
    const hardware = guideMode === 'hardware';
    $('#di-grid').innerHTML = di.map((on,i) => `<div class="io-channel ${on?'on':''}"><i class="state-dot"></i><strong>DI${i+1}</strong><small>${on?'ACTIVE':'INACTIVE'}</small><button data-di="${i}" ${hardware?'disabled':''}>${hardware?'READ ONLY':(on?'Set OFF':'Set ON')}</button></div>`).join('');
    $('#do-grid').innerHTML = dout.map((on,i) => `<div class="io-channel ${on?'on':''}"><i class="state-dot"></i><strong>DO${i+1}</strong><small>${on?'ON':'OFF'}</small><button data-do="${i}" ${hardware&&!serialPort?'disabled':''}>${on?'Switch OFF':'Switch ON'}</button></div>`).join('');
    $('#io-mode-label').textContent = hardware ? (serialPort ? 'HARDWARE CONNECTED' : 'HARDWARE · CONNECT BOARD') : 'VIRTUAL MODE';
    window.dispatchEvent(new CustomEvent('localio:state', { detail: { di1:di[0], do1:dout[0] } }));
    $('#virtual-button-toggle').setAttribute('aria-pressed', String(di[0]));
    $('#virtual-button-toggle').textContent = di[0] ? 'Release virtual button' : 'Press virtual button';
    $('#virtual-di-state').textContent = di[0] ? 'ON' : 'OFF';
    $('#virtual-do-state').textContent = dout[0] ? 'ON' : 'OFF';
    $('#virtual-lamp-state').textContent = dout[0] ? 'ON' : 'OFF';
    $('#virtual-button-toggle').classList.toggle('is-pressed', di[0]);
  }
  $('#di-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-di]'); if (!button || ioMode !== 'demo') return;
    const i = Number(button.dataset.di); di[i] = !di[i]; if (i === 0) dout[0] = di[0]; renderIO();
  });
  $('#do-grid').addEventListener('click', async event => {
    const button = event.target.closest('[data-do]'); if (!button) return;
    const i = Number(button.dataset.do); const next = !dout[i];
    if (ioMode === 'hardware') {
      if (!serialPort || !serialWriter) { logSerial('Connect the USB serial device first.'); return; }
      try { await serialWriter.write(new TextEncoder().encode(JSON.stringify({ cmd:'set_do', channel:i+1, state:next ? 1 : 0 }) + '\n')); }
      catch (err) { logSerial(`Command error: ${err.message}`); return; }
    }
    dout[i] = next; renderIO();
  });
  $('#virtual-button-toggle').addEventListener('click', () => {
    if (guideMode !== 'virtual') return;
    di[0] = !di[0]; dout[0] = di[0]; renderIO();
  });
  $('#virtual-io-reset').addEventListener('click', () => {
    if (guideMode !== 'virtual') return;
    di = Array(8).fill(false); dout = Array(8).fill(false); renderIO();
    window.dispatchEvent(new CustomEvent('localio:reset'));
  });
  window.addEventListener('localio:toggle', () => {
    if (guideMode !== 'virtual') return;
    di[0] = !di[0]; dout[0] = di[0]; renderIO();
  });
  setGuideMode('virtual');

  function processSerialLine(line) {
    const clean = line.trim(); if (!clean) return;
    logSerial(clean);
    try {
      const data = JSON.parse(clean);
      if (Array.isArray(data.di) && data.di.length >= 8) di = data.di.slice(0,8).map(Boolean);
      if (Array.isArray(data.do) && data.do.length >= 8) dout = data.do.slice(0,8).map(Boolean);
      if (data.type === 'io' || (Array.isArray(data.di) && Array.isArray(data.do))) renderIO();
    } catch (_) { /* non-JSON serial log line */ }
  }

  async function connectSerial() {
    if (!('serial' in navigator)) {
      $('#usb-note').textContent = 'Web Serial is not available in this browser. Use Chrome or Edge on desktop, and open the site over HTTPS.';
      return;
    }
    try {
      serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 115200 });
      serialWriter = serialPort.writable.getWriter();
      $('#connection-state').classList.add('connected'); $('#connection-state').innerHTML = '<i></i> USB CONNECTED';
      $('#serial-status').textContent = 'CONNECTED'; $('#usb-connect').disabled = true; $('#usb-disconnect').disabled = false;
      $('#usb-note').textContent = 'USB serial connected at 115200 baud. The device firmware must support the web bridge protocol for live I/O updates.';
      logSerial('USB serial connected. Waiting for device messages…');
      setGuideMode('hardware'); ioMode = 'hardware'; renderIO();
      await serialWriter.write(new TextEncoder().encode('{"cmd":"get_state"}\n'));
      readLoopActive = true;
      const decoder = new TextDecoder();
      while (serialPort?.readable && readLoopActive) {
        serialReader = serialPort.readable.getReader();
        try {
          while (true) {
            const { value, done } = await serialReader.read();
            if (done) break;
            serialBuffer += decoder.decode(value, { stream: true });
            const chunks = serialBuffer.split(/\r?\n/); serialBuffer = chunks.pop() || '';
            chunks.forEach(processSerialLine);
          }
        } finally { serialReader.releaseLock(); serialReader = null; }
      }
    } catch (err) {
      if (err.name !== 'NotFoundError') logSerial(`USB connection failed: ${err.message}`);
      await disconnectSerial(false);
    }
  }
  async function disconnectSerial(updateNote = true) {
    readLoopActive = false;
    try { if (serialReader) await serialReader.cancel(); } catch (_) {}
    try { if (serialWriter) { serialWriter.releaseLock(); serialWriter = null; } } catch (_) {}
    try { if (serialPort) await serialPort.close(); } catch (_) {}
    serialPort = null; serialReader = null;
    $('#connection-state').classList.remove('connected'); $('#connection-state').innerHTML = guideMode === 'hardware' ? '<i></i> HARDWARE NOT CONNECTED' : '<i></i> VIRTUAL MODE';
    $('#serial-status').textContent = 'DISCONNECTED'; $('#usb-connect').disabled = false; $('#usb-disconnect').disabled = true;
    ioMode = guideMode === 'hardware' ? 'hardware' : 'demo'; renderIO();
    if (updateNote) $('#usb-note').textContent = guideMode === 'hardware' ? 'USB disconnected. Hardware mode is selected, but the board is not connected.' : 'USB disconnected. Virtual mode is active.';
  }
  $('#usb-connect').addEventListener('click', connectSerial);
  $('#usb-disconnect').addEventListener('click', () => disconnectSerial(true));

  // Hands-on Projects: exact source Lessons 2–6 will be imported after their titles/content are verified.
  $('#lesson-index').innerHTML = '<div class="lesson-index-title">REFERENCE COURSE · LESSONS 2–6</div><div class="lesson-pending"><strong>Five source lessons</strong><p>Ready to be adapted into Waveshare projects once the original lesson titles and instructions are confirmed.</p><a href="https://nani2905-ap.github.io/esp32-s3-waveshare/learn-esp32-s3/" target="_blank" rel="noreferrer">Open original learning website ↗</a></div>';
  $('#lesson-view').innerHTML = '<p class="eyebrow">SOURCE LESSONS 2–6</p><h2>Hands-on Projects</h2><p class="lesson-intro">This section is separate from the Integration Guide. I need the actual Lessons 2–6 content from your specified reference site before inserting the projects, so that I do not substitute lessons from a different ESP32 website.</p><div class="lesson-section"><h3>How the projects will work</h3><ul><li>Preserve the original lesson title, learning goal and teaching sequence.</li><li>Adapt hardware steps to the Waveshare 8DI/8DO interfaces only where appropriate.</li><li>Give each project a virtual 3D exercise for visitors without hardware and a physical workflow for board owners.</li></ul><div class="info-callout"><strong>Needed to finish this section:</strong> screenshots of the reference website’s Lessons tab showing Lessons 2–6, or screenshots of each lesson opened. The public page loads its lesson details dynamically, and the lesson text is not available in the page content I can retrieve.</div></div>';

  const initial = location.hash.replace('#',''); showView(initial || 'home');
})();
