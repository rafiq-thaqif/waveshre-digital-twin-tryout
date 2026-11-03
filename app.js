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

  const lessons = [
    {
      id:2, title:'Flash two LEDs', subtitle:'Use two outputs in sequence', original:'Flash two LEDs',
      intro:'Make two indicator lights take turns. On this industrial controller, the closest practical equivalent is to use DO1 and DO2 to control two correctly rated 24 V indicator lamps.',
      concept:'A program can switch multiple outputs in a timed sequence. The board’s DO channels are sinking transistor outputs, so use suitable industrial indicator lamps or a correctly designed driver circuit — not bare LEDs connected directly to the terminals.',
      steps:['Wire one compatible indicator lamp to DO1 and a second to DO2 using the appropriate supply and DO GND reference.','Install the lesson firmware using the browser flasher once the verified firmware package is available.','Run the sequence and observe DO1 and DO2 turn on alternately.'],
      note:'Adaptation: the original ESP32 lesson uses two LEDs on GPIO pins. This board exposes isolated industrial DO channels instead.', demo:'leds'
    },
    {
      id:3, title:'Guard the fridge', subtitle:'Detect a door opening with DI1', original:'Guard the fridge',
      intro:'A reed switch detects whether a door is open or closed. Wire it as a dry-contact input to DI1, then use the program to trigger an indicator or alarm output.',
      concept:'A reed switch is a magnetic contact. When the magnet moves away, the contact changes state. The controller reads that change through its optocoupler-isolated digital input.',
      steps:['Connect the reed switch to the DI1 input circuit using the board’s supported input wiring method.','Read DI1 in the firmware and decide what should count as an open door.','Use DO1 to activate a suitable warning lamp, or use the onboard buzzer for an alert.'],
      note:'Adaptation: the original lesson demonstrates a reed switch on a general-purpose ESP32 GPIO. Here it is connected to the industrial DI terminal; follow the Waveshare input wiring requirements.', demo:'reed'
    },
    {
      id:4, title:'Use Wi-Fi', subtitle:'Open a control page from a browser', original:'Use Wi-Fi',
      intro:'Give the controller network access and use a browser page to view input states or send output commands. This is where the AP and STA modes become useful.',
      concept:'In Access Point mode, the board creates its own Wi-Fi network. In Station mode, the board joins an existing 2.4 GHz network. Both can support a local web interface, depending on the firmware.',
      steps:['Choose AP for a direct laptop-to-board connection, or STA to join the lab router.','Configure the network details in the lesson firmware.','Open the board’s web interface and use the page to monitor DI states and control DO outputs.'],
      note:'The reference lesson uses a tiny /toggle web endpoint. For this controller, the website should control DO1–DO8 and display the actual DI1–DI8 values.', demo:'wifi'
    },
    {
      id:5, title:'Sound a siren', subtitle:'Use the onboard buzzer', original:'Sound a siren',
      intro:'Create an audible alert using the buzzer already fitted inside the Waveshare enclosure. The buzzer is a board feature, so this exercise does not need an external speaker.',
      concept:'A buzzer can be driven with a repeating on/off pattern or a tone sequence. The Waveshare interface table identifies GPIO46 as the buzzer control pin.',
      steps:['Use the board-specific buzzer function from the official demo package.','Create a short repeating alert pattern in firmware.','Trigger the siren from an input event, a web command or a lesson button.'],
      note:'The actual buzzer behaviour and driver calls must be taken from the official demo package; the browser preview below only illustrates the timing.', demo:'buzzer'
    },
    {
      id:6, title:'Build a mini piano', subtitle:'Eight inputs, eight notes', original:'Build a mini piano',
      intro:'Turn eight push buttons into a simple eight-note controller. Each button is wired to one of the isolated digital inputs; the onboard buzzer plays a different tone for each input.',
      concept:'The original ESP32 mini-piano lesson uses capacitive-touch GPIOs. Those touch pins are not the user-facing field terminals on this industrial board, so this adaptation uses DI1–DI8 instead.',
      steps:['Wire eight momentary push buttons to DI1–DI8 using the supported input circuit.','Map each input channel to a different note in the firmware.','Press the buttons and use the onboard buzzer to play a simple melody.'],
      note:'Adaptation: this uses external dry-contact buttons and the onboard buzzer, rather than direct capacitive-touch pads.', demo:'piano'
    }
  ];

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
    $('#di-grid').innerHTML = di.map((on,i) => `<div class="io-channel ${on?'on':''}"><i class="state-dot"></i><strong>DI${i+1}</strong><small>${on?'ACTIVE':'INACTIVE'}</small><button data-di="${i}" ${ioMode==='hardware'?'disabled':''}>${ioMode==='hardware'?'READ ONLY':(on?'Set OFF':'Set ON')}</button></div>`).join('');
    $('#do-grid').innerHTML = dout.map((on,i) => `<div class="io-channel ${on?'on':''}"><i class="state-dot"></i><strong>DO${i+1}</strong><small>${on?'ON':'OFF'}</small><button data-do="${i}" ${ioMode==='hardware'&&!serialPort?'disabled':''}>${on?'Switch OFF':'Switch ON'}</button></div>`).join('');
    $$('.mode-button').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === ioMode));
  }
  $('#di-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-di]'); if (!button || ioMode !== 'demo') return;
    const i = Number(button.dataset.di); di[i] = !di[i]; renderIO();
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
  $$('.mode-button').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mode === 'hardware' && !serialPort) {
      $('#usb-note').textContent = 'Connect the board over USB first. Hardware mode requires companion firmware that reports DI/DO state and accepts output commands.';
      return;
    }
    ioMode = button.dataset.mode; renderIO();
  }));
  renderIO();

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
      ioMode = 'hardware'; renderIO();
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
    $('#connection-state').classList.remove('connected'); $('#connection-state').innerHTML = '<i></i> DEMO MODE';
    $('#serial-status').textContent = 'DISCONNECTED'; $('#usb-connect').disabled = false; $('#usb-disconnect').disabled = true;
    ioMode = 'demo'; renderIO();
    if (updateNote) $('#usb-note').textContent = 'USB disconnected. Demo mode is active.';
  }
  $('#usb-connect').addEventListener('click', connectSerial);
  $('#usb-disconnect').addEventListener('click', () => disconnectSerial(true));

  // Lessons 2-6 from the reference learning sequence, adapted to this industrial board.
  let currentLesson = 0;
  const lessonIndex = $('#lesson-index');
  lessonIndex.innerHTML = `<div class="lesson-index-title">LEARNING PATH · LESSONS 2–6</div>${lessons.map((lesson,i)=>`<button data-lesson="${i}" class="${i===0?'active':''}"><span class="lesson-num">${lesson.id}</span><span><strong>${lesson.title}</strong><small>${lesson.subtitle}</small></span></button>`).join('')}`;

  function lessonDemo(lesson) {
    if (lesson.demo === 'leds') return `<div class="lesson-demo"><p class="eyebrow">OUTPUT PREVIEW</p><h3>Two outputs, alternating</h3><div class="demo-led-row"><i class="demo-led" id="lesson-led-1"></i><i class="demo-led" id="lesson-led-2"></i></div><button class="demo-button" data-demo-action="alternate">Run sequence</button><p id="lesson-demo-note">Try the two simulated indicators.</p></div>`;
    if (lesson.demo === 'reed') return `<div class="lesson-demo"><p class="eyebrow">INPUT PREVIEW</p><h3>Fridge door contact</h3><button class="demo-button" data-demo-action="reed">Toggle reed switch</button><p id="lesson-demo-note">Door closed · DI1 inactive</p><div class="demo-led-row"><i class="demo-led" id="lesson-alarm-led"></i></div></div>`;
    if (lesson.demo === 'wifi') return `<div class="lesson-demo"><p class="eyebrow">NETWORK PREVIEW</p><h3>Choose a connection mode</h3><div class="demo-led-row"><button class="demo-button" data-demo-action="ap">Access Point</button><button class="demo-button" data-demo-action="sta">Station</button></div><p id="lesson-demo-note">Select a mode to see how the board connects.</p></div>`;
    if (lesson.demo === 'buzzer') return `<div class="lesson-demo"><p class="eyebrow">BUZZER PREVIEW</p><h3>Onboard alert</h3><div class="demo-led-row"><i class="demo-led" id="lesson-buzzer-led"></i></div><button class="demo-button" data-demo-action="buzzer">Trigger alert pattern</button><p id="lesson-demo-note">The preview animates the buzzer state; actual sound requires lesson firmware.</p></div>`;
    return `<div class="lesson-demo"><p class="eyebrow">INPUT PREVIEW</p><h3>Eight-button mini piano</h3><div class="piano-keys">${Array.from({length:8},(_,i)=>`<button class="demo-button piano-key" data-note="${i}">${i+1}</button>`).join('')}</div><p id="lesson-demo-note">Press a key to hear a simple browser tone. Hardware version uses DI1–DI8 and the onboard buzzer.</p></div>`;
  }

  function renderLesson(index) {
    currentLesson = Math.max(0, Math.min(lessons.length - 1, index));
    const lesson = lessons[currentLesson];
    $$('.lesson-index button').forEach(btn => btn.classList.toggle('active', Number(btn.dataset.lesson) === currentLesson));
    $('#lesson-view').innerHTML = `<p class="eyebrow">LESSON ${lesson.id} · ADAPTED FOR WAVESHARE 8DI / 8DO</p><h2>${lesson.title}</h2><p class="lesson-intro">${lesson.intro}</p><div class="lesson-body-grid"><div class="lesson-section"><h3>What you'll learn</h3><p>${lesson.concept}</p><h3>Steps</h3><ul>${lesson.steps.map(step=>`<li>${step}</li>`).join('')}</ul><div class="info-callout"><strong>Board-specific note:</strong> ${lesson.note}</div></div>${lessonDemo(lesson)}</div><div class="lesson-footer"><small>Lesson ${currentLesson+1} of ${lessons.length} · Original lesson theme: “${lesson.original}”</small><div><button id="lesson-prev" ${currentLesson===0?'disabled':''}>← Previous</button> <button class="primary" id="lesson-next">${currentLesson===lessons.length-1?'Finish':'Next lesson →'}</button></div></div>`;
    $('#lesson-prev').addEventListener('click', () => renderLesson(currentLesson - 1));
    $('#lesson-next').addEventListener('click', () => renderLesson(currentLesson === lessons.length - 1 ? 0 : currentLesson + 1));
  }
  lessonIndex.addEventListener('click', event => { const btn = event.target.closest('[data-lesson]'); if (btn) renderLesson(Number(btn.dataset.lesson)); });
  $('#lesson-view').addEventListener('click', event => {
    const action = event.target.closest('[data-demo-action]')?.dataset.demoAction;
    if (action === 'alternate') {
      const a = $('#lesson-led-1'); const b = $('#lesson-led-2'); let count = 0;
      const timer = setInterval(() => { a.classList.toggle('lit', count % 2 === 0); b.classList.toggle('lit', count % 2 === 1); count++; if (count >= 8) clearInterval(timer); }, 420);
      $('#lesson-demo-note').textContent = 'DO1 and DO2 are alternating in this browser preview.';
    }
    if (action === 'reed') {
      const on = !$('#lesson-alarm-led').classList.contains('lit'); $('#lesson-alarm-led').classList.toggle('lit', on); $('#lesson-demo-note').textContent = on ? 'Door open · DI1 active · alert output requested.' : 'Door closed · DI1 inactive.';
    }
    if (action === 'ap') $('#lesson-demo-note').textContent = 'AP mode: the board creates a Wi-Fi hotspot. Your laptop connects directly to it.';
    if (action === 'sta') $('#lesson-demo-note').textContent = 'STA mode: the board joins the lab router. Your laptop and board share the same network.';
    if (action === 'buzzer') {
      const led = $('#lesson-buzzer-led'); led.classList.add('lit'); $('#lesson-demo-note').textContent = 'Alert pattern preview active. The real board uses its onboard buzzer.'; setTimeout(()=>led.classList.remove('lit'),1800);
    }
  });
  $('#lesson-view').addEventListener('click', event => {
    const key = event.target.closest('[data-note]'); if (!key) return;
    const frequencies = [262,294,330,349,392,440,494,523];
    try { const AudioCtx = window.AudioContext || window.webkitAudioContext; const ctx = new AudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type='sine'; osc.frequency.value=frequencies[Number(key.dataset.note)]; gain.gain.value=0.06; osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.22); osc.onended=()=>ctx.close(); } catch (_) {}
    key.style.background = '#eaf4ff'; setTimeout(()=>key.style.background='',220);
  });
  renderLesson(0);

  const initial = location.hash.replace('#',''); showView(initial || 'home');
})();
