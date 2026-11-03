# Waveshare ESP32-S3-POE-ETH-8DI-8DO Digital Twin

This is a static GitHub Pages website with a custom Three.js model. The 3D enclosure is built from individual Three.js geometries (case, mounting flange, terminal blocks, screws, ports, vents, antenna, latches and internal components). The supplied reference photographs are not mapped onto the 3D enclosure.

## Website sections

- **Home** – minimal landing page with a slowly rotating 3D model.
- **Meet the Board** – component list, clickable 3D hotspots, camera focus/zoom and a conceptual internal view.
- **Guide** – Local I/O Control, Wi-Fi AP, Wi-Fi STA, MQTT & Node-RED. A small 3D model remains visible in the Guide header.
- **Lessons** – adapted versions of reference Lessons 2–6.
- **Reference** – official Waveshare links and source material.

## Run locally

Because the site uses ES modules and Three.js, run it from a local HTTP server (for example VS Code Live Server) or publish it through HTTPS on GitHub Pages. Do not open `index.html` directly with `file://`.

## GitHub Pages

Upload the contents of this folder to the repository root. Keep `index.html`, `styles.css`, `app.js`, `board3d.js` and `.nojekyll` at the same level. No photo texture folder is required for the new 3D model.

## Hardware connection status

The Guide includes a browser USB serial bridge interface. It currently expects a companion firmware protocol:

- Device reports one JSON object per line: `{"type":"io","di":[0,0,0,0,0,0,0,0],"do":[0,0,0,0,0,0,0,0]}`
- Website requests state with: `{"cmd":"get_state"}`
- Website commands an output with: `{"cmd":"set_do","channel":1,"state":1}`

The previous Arduino demo package is not enough by itself to guarantee this serial protocol. The official Waveshare demo ZIP must be inspected so a companion firmware can be built against the correct board libraries and I/O behaviour.

## Browser firmware upload

A public HTTPS website can flash pre-built ESP32-S3 firmware in supported browsers using Web Serial and a browser flasher such as esptool-js / ESP Web Tools. A static website cannot compile arbitrary ESP32 source code by itself. For a no-Arduino user experience, build and publish verified `.bin` images (for example with a CI build pipeline), then let the website install those images. The exact merged image, flash layout and board configuration must be verified against the official demo package before enabling a flash button.

## Safety

The board has optocoupler-isolated digital inputs and Darlington transistor sinking outputs. DO channels are not mechanical relays. Use compatible field devices, verify supply polarity/current ratings, and follow the official Waveshare documentation before wiring hardware. Demo-mode I/O toggles are visual teaching controls and do not operate a physical board.
