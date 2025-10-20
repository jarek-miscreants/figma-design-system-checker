# Quick Start Guide

## Installation (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Build the backend code
npm run build

# 3. In Figma:
# - Plugins → Development → Import plugin from manifest
# - Select manifest.json from this directory
```

That's it! The plugin is ready to use.

## Development Workflow

### Working on UI (ui-standalone.html)
1. Edit `ui-standalone.html`
2. Reload plugin in Figma (right-click plugin → Reload)
3. Done! ✨ (No build needed)

### Working on Backend (src/code.ts)
1. Run `npm run dev` (watches for changes)
2. Edit files in `src/`
3. Auto-rebuilds on save
4. Reload plugin in Figma
5. Done! ✨

## Using the Plugin

### 1. Select Elements
Select any frames, groups, or elements in Figma

### 2. Analyze
Click "Analyze Selection" button

### 3. Review Results
The plugin shows all unconnected elements in a table:
- Element name and path
- Type (Fill, Stroke, or Text)
- Current value
- Best matching style (with % confidence)
- Manual style selector dropdown

### 4. Connect Elements

**Option A: Auto-Connect** (Recommended)
- Click the green "🔗 Auto" button
- Connects to the best matching style automatically

**Option B: Manual Selection**
- Use the dropdown to choose any style
- Connects immediately when selected

### 5. Filter Results (Optional)
- Click "All" to see everything
- Click "Colors" to see only fills and strokes
- Click "Typography" to see only text elements

## Project Structure

```
ui-standalone.html     ← UI (edit directly, no build)
manifest.json         ← Plugin config
src/
  ├── code.ts        ← Main backend (needs build)
  ├── types.ts       ← Type definitions
  └── utils/
      ├── analyzer.ts ← Scanning logic
      └── matcher.ts  ← Matching algorithms
dist/
  └── code.js        ← Built backend
```

## Common Tasks

### Update UI Styling
1. Edit styles in `<style>` section of `ui-standalone.html`
2. Reload plugin
3. See changes immediately

### Add New UI Feature
1. Edit JavaScript in `<script>` section of `ui-standalone.html`
2. Reload plugin
3. Test

### Add Backend Feature
1. Edit `src/code.ts` or `src/utils/`
2. Auto-rebuilds if `npm run dev` is running
3. Reload plugin
4. Test

### Debug UI
1. Open plugin in Figma
2. Right-click in plugin → Inspect Element
3. Use Chrome DevTools normally

### Debug Backend
1. Open plugin in Figma
2. Plugins → Development → Open Console
3. See backend console.logs here

## Troubleshooting

### Blank Interface
- Make sure you reloaded the plugin after changes
- Check browser console for errors (right-click → Inspect)
- Verify `ui-standalone.html` exists in root directory

### Backend Not Working
- Run `npm run build` to compile
- Check Figma plugin console for errors
- Make sure `dist/code.js` exists

### Changes Not Appearing
- Always reload plugin after changes
- For UI: No build needed, just reload
- For backend: Make sure it rebuilt (check `dist/code.js` timestamp)

## Tips

### Fast Iteration
- Keep plugin open while developing
- Edit → Save → Reload plugin (Cmd/Ctrl + R usually)
- Changes appear in ~1 second

### Best Practices
- Test with real design files
- Try edge cases (mixed selections, no styles, etc.)
- Check console for errors regularly

### Performance
- UI is very fast (~10ms render time)
- Backend processes thousands of nodes quickly
- No lag even with complex documents

## Need Help?

1. Check `ARCHITECTURE.md` for technical details
2. Check `README.md` for full documentation  
3. Check `CHANGELOG.md` for recent changes
4. Open issues on the repository

Happy coding! 🚀


