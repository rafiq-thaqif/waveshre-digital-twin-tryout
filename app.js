(() => {
  const componentData = {
    mcu: {
      kicker: 'Main controller',
      title: 'ESP32-S3 controller',
      description: 'The ESP32-S3 is the main microcontroller for the unit. It runs the application logic and provides Wi‑Fi and Bluetooth support.',
      tags: ['Dual-core', 'Wi‑Fi', 'Bluetooth'],
      note: 'Think of this as the brain of the controller.'
    },
    di: {
      kicker: 'Field inputs',
      title: 'DI1–DI8 digital inputs',
      description: 'These terminals receive digital input signals from switches, sensors or other field devices.',
      tags: ['8 channels', 'Input side', 'Industrial I/O'],
      note: 'In the simulator, DI1 is used as the first example input.'
    },
    do: {
      kicker: 'Controlled outputs',
      title: 'DO1–DO8 digital outputs',
      description: 'These are the digital outputs controlled by the firmware. In the learning example, DO1 follows DI1.',
      tags: ['8 channels', 'Output side', 'Transistor outputs'],
      note: 'Use the official documentation to confirm real-world load wiring.'
    },
    ethernet: {
      kicker: 'Wired networking',
      title: 'Ethernet / PoE port',
      description: 'The RJ45 connector provides wired Ethernet communication and may be used with PoE depending on the installation.',
      tags: ['RJ45', 'Ethernet', 'PoE'],
      note: 'A wired connection is useful for stable industrial communication.'
    },
    usb: {
      kicker: 'Programming port',
      title: 'USB Type‑C',
      description: 'Used for programming, serial communication and convenient power during development.',
      tags: ['USB-C', 'Programming', 'Serial'],
      note: 'The setup guide uses this port during Arduino IDE upload.'
    },
    rs485: {
      kicker: 'Industrial bus',
      title: 'RS485 terminals',
      description: 'The RS485 interface is provided for compatible fieldbus or serial communication scenarios.',
      tags: ['A/B/G', 'RS485', 'Serial bus'],
      note: 'Always verify bus wiring and termination when using a real installation.'
    },
    can: {
      kicker: 'Industrial bus',
      title: 'CAN terminals',
      description: 'The board includes a CAN interface for compatible CAN devices and networks.',
      tags: ['H/L/G', 'CAN bus', 'Industrial'],
      note: 'Topology and termination matter on real CAN networks.'
    },
    power: {
      kicker: 'Primary supply',
      title: '7–36V DC power input',
      description: 'This screw terminal accepts external DC power input for the controller.',
      tags: ['DC input', '7–36V', 'Power'],
      note: 'Check polarity before energising the board.'
    },
    antenna: {
      kicker: 'Wireless interface',
      title: 'External antenna',
      description: 'The external antenna supports the board’s wireless communication capability.',
      tags: ['Antenna', 'Wi‑Fi', 'Wireless'],
      note: 'The board photos show the external antenna mounted on the enclosure.'
    },
    terminals: {
      kicker: 'Removable connectors',
      title: 'Pluggable terminal blocks',
      description: 'The green removable terminal blocks are used to land the digital I/O and communication wiring.',
      tags: ['Removable', 'Screw terminal', 'Wiring'],
      note: 'This is one of the most distinctive mechanical features of the unit.'
    }
  };

  const guideLessons = [
    {
      title: 'Explore the board',
      subtitle: 'Get familiar with the hardware',
      duration: '5 min',
      flow: 'Explore',
      bullets: [
        'Identify the ESP32-S3 controller, terminal blocks, USB-C, Ethernet/PoE, RS485, CAN and DC power input.',
        'Use the Digital Twin tab to rotate the enclosure and inspect its different sides.',
        'Start by understanding where inputs, outputs and communication ports physically sit on the unit.'
      ]
    },
    {
      title: 'Prepare Arduino IDE',
      subtitle: 'Set up the software environment',
      duration: '10–15 min',
      flow: 'Run',
      bullets: [
        'Use the Waveshare demo package as the starting point for examples and board-specific files.',
        'Select the correct ESP32-S3 board profile and the COM port detected over USB-C.',
        'Check key project settings before upload, especially serial and board package configuration.'
      ]
    },
    {
      title: 'Wire the first I/O demo',
      subtitle: 'DI1 to DO1 example',
      duration: '10 min',
      flow: 'Wire',
      bullets: [
        'Use DI1 as the first test input and DO1 as the first example output.',
        'The tutorial logic is simple: when DI1 turns on, DO1 turns on and drives the example load.',
        'Use the simulator tab first if you want to understand the signal flow before touching hardware.'
      ]
    },
    {
      title: 'Wi‑Fi AP mode',
      subtitle: 'Board creates its own access point',
      duration: '8 min',
      flow: 'Run',
      bullets: [
        'Configure the firmware so the board exposes its own Wi‑Fi access point.',
        'Set the SSID and password in the project configuration.',
        'Connect a laptop or phone to that network and open the board dashboard in a browser.'
      ]
    },
    {
      title: 'Wi‑Fi STA mode',
      subtitle: 'Board joins an existing network',
      duration: '8 min',
      flow: 'Run',
      bullets: [
        'Use station mode when the board should join an existing 2.4 GHz network.',
        'Set the network credentials and monitor the IP address returned after connection.',
        'Open the board page from another device on the same network.'
      ]
    },
    {
      title: 'MQTT and Node-RED',
      subtitle: 'Understand data flow',
      duration: '12–15 min',
      flow: 'Run',
      bullets: [
        'Configure broker details in the project and make sure the board and PC share a reachable network.',
        'Use Node-RED to visualise topic flow and broker activity.',
        'Confirm topic names, port numbers and IP addresses carefully during testing.'
      ]
    },
    {
      title: 'Ethernet and PoE',
      subtitle: 'Wired networking basics',
      duration: '6 min',
      flow: 'Explore',
      bullets: [
        'Use Ethernet for stable wired connectivity where appropriate.',
        'PoE requires compatible network equipment and correct deployment.',
        'Confirm address assignment and communication path when testing with services such as MQTT.'
      ]
    },
    {
      title: 'Troubleshooting',
      subtitle: 'Check layer by layer',
      duration: '8 min',
      flow: 'Run',
      bullets: [
        'If upload fails, check the cable, COM port, USB-C connection and board selection.',
        'If I/O does not respond, check the terminal labels, common references and logic.',
        'If network features fail, verify Wi‑Fi band, broker address, serial output and dashboard URL.'
      ]
    }
  ];

  const views = ['home', 'twin', 'guide', 'simulator', 'reference'];
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));

  function showView(name) {
    const target = views.includes(name) ? name : 'home';
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${target}`);
    });
    document.querySelectorAll('.nav-link').forEach(button => {
      button.classList.toggle('active', button.dataset.nav === target);
    });
    history.replaceState(null, '', `#${target}`);
    document.getElementById('main-nav').classList.remove('open');
    document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
    if (target === 'twin') {
      setTimeout(() => window.dispatchEvent(new CustomEvent('board:resize')), 50);
    }
  }

  navLinks.forEach(button => button.addEventListener('click', () => showView(button.dataset.nav)));

  const menuToggle = document.getElementById('menu-toggle');
  menuToggle.addEventListener('click', () => {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });

  const guideGrid = document.getElementById('guide-grid');
  guideGrid.innerHTML = guideLessons.map(item => `
    <article class="card guide-card">
      <p class="eyebrow eyebrow-dark">${item.flow}</p>
      <h3>${item.title}</h3>
      <div class="guide-meta"><span>${item.subtitle}</span><span>${item.duration}</span></div>
      <ul>${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
    </article>
  `).join('');

  const detailKicker = document.getElementById('detail-kicker');
  const detailTitle = document.getElementById('detail-title');
  const detailDescription = document.getElementById('detail-description');
  const detailTags = document.getElementById('detail-tags');
  const detailNote = document.getElementById('detail-note');
  const pills = document.getElementById('component-pills');

  const componentOrder = ['mcu', 'di', 'do', 'ethernet', 'usb', 'rs485', 'can', 'power', 'antenna', 'terminals'];
  pills.innerHTML = componentOrder.map(id => `<button class="pill-btn" data-component="${id}">${componentData[id].title}</button>`).join('');

  function selectComponent(id) {
    const item = componentData[id] || componentData.mcu;
    detailKicker.textContent = item.kicker;
    detailTitle.textContent = item.title;
    detailDescription.textContent = item.description;
    detailTags.innerHTML = item.tags.map(tag => `<span>${tag}</span>`).join('');
    detailNote.textContent = item.note;
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.component === id));
    window.dispatchEvent(new CustomEvent('board:focus-component', { detail: { id } }));
  }

  pills.addEventListener('click', (event) => {
    const button = event.target.closest('[data-component]');
    if (!button) return;
    selectComponent(button.dataset.component);
  });

  window.addEventListener('board:component-selected', (event) => {
    if (event.detail?.id) selectComponent(event.detail.id);
  });

  selectComponent('mcu');

  document.getElementById('reset-view').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('board:reset'));
  });

  let spinning = true;
  document.getElementById('toggle-spin').addEventListener('click', (event) => {
    spinning = !spinning;
    event.currentTarget.textContent = spinning ? 'Pause spin' : 'Resume spin';
    window.dispatchEvent(new CustomEvent('board:spin', { detail: { enabled: spinning } }));
  });

  const inputButton = document.getElementById('sim-input');
  const output = document.getElementById('sim-output');
  const outputLabel = document.getElementById('sim-output-label');
  const lamp = document.getElementById('sim-lamp');
  const simCaption = document.getElementById('sim-caption');
  let di1 = false;
  inputButton.addEventListener('click', () => {
    di1 = !di1;
    inputButton.classList.toggle('on', di1);
    inputButton.textContent = di1 ? 'ON' : 'OFF';
    inputButton.setAttribute('aria-pressed', String(di1));
    output.classList.toggle('on', di1);
    lamp.classList.toggle('on', di1);
    outputLabel.textContent = di1 ? 'ON' : 'OFF';
    simCaption.textContent = di1
      ? 'DI1 is active. The example logic mirrors that state to DO1, so the lamp turns on.'
      : 'Toggle DI1 to see the example logic turn DO1 on or off.';
  });

  const initial = location.hash.replace('#', '');
  showView(initial || 'home');
})();
