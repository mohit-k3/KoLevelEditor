## Getting Started

### Local Development

```bash
npm install
npm run dev
```

### Production Build & Deploy

```bash
npm install
npm run build
firebase deploy --only hosting:koleveleditor
```

---

## Adding More Colors to the Palette

1. **Update Color Constants:**
    - Edit `constants.ts` and add your new colors to:
      - `AVAILABLE_COLORS`
      - `LIMITED_FABRIC_COLORS`
      - `COLOR_MAP`

2. **Update Global Styles:**
    - In `global.css`, inside `@layer base :root`, add your new color variables.

