# iPad Interactive Robot

Touch-first prototype for iPad Pro 11-inch, built as a lightweight PWA.

## Interactions
- Tap: luminous ripple + contextual robot reaction
- Tap the head: head wobble + expression
- Tap a hand/arm: high-five
- Tap the body: bounce
- Drag: robot and eyes follow the finger with a light trail
- Long press (~0.68s): special spin/dance mode
- Two fingers: multi-touch energy mode
- Device tilt: subtle background parallax on supported iPadOS versions
- Sound toggle: lightweight WebAudio feedback
- Offline: service worker caches the app shell
- PWA: add to the iPad Home Screen and open standalone

## GitHub Pages
In repository Settings → Pages, choose GitHub Actions as the Source once. Every push to main then redeploys automatically.