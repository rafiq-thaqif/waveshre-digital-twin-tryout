# Waveshare Digital Twin (revised)

This revision was rebuilt to match the new feedback:

- cleaner and more minimal homepage
- separate **Guide** tab for reading-focused lesson content
- interactive **Digital Twin** tab for the 3D board explorer
- simplified browser-only simulator
- board model updated to better resemble the physical board using the provided board photos as texture references

## Files

- `index.html` – main entry page
- `Waveshare-Digital-Twin.html` – duplicate standalone entry page
- `styles.css` – styling
- `app.js` – navigation, guide content and simulator logic
- `board3d.js` – Three.js 3D board viewer
- `assets/` – image textures extracted from the supplied photos

## Notes

The 3D board is implemented as a simplified textured 3D model so it resembles the real hardware more closely than the previous generic render. It is intended for learning and presentation, not mechanical CAD precision.
