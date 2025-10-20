# Architecture Overview

## Design Decision: Standalone UI

This plugin uses a **standalone HTML architecture** instead of a React-based build system for the UI.

## Why Standalone?

### Issues with React in Figma

Figma plugins run the UI in an iframe with specific constraints:

1. **Rendering timing issues**: React's virtual DOM and lifecycle methods can conflict with Figma's iframe initialization
2. **Bundle size overhead**: React adds ~150KB to the bundle for minimal UI needs
3. **Debugging complexity**: React DevTools don't work in Figma's iframe environment
4. **Build process dependency**: Every UI change requires a full webpack rebuild

### Benefits of Standalone Approach

✅ **Immediate rendering**: Direct DOM manipulation starts immediately when HTML loads
✅ **Zero framework overhead**: ~10KB total UI code vs ~150KB+ with React
✅ **Simple debugging**: Standard browser DevTools work perfectly
✅ **No build for UI**: Edit `ui-standalone.html` and reload - no compilation needed
✅ **100% compatibility**: Works reliably in Figma's iframe environment

## Architecture Components

### Backend (`src/code.ts`)
- Runs in Figma's plugin sandbox (Node.js-like environment)
- Has access to Figma's document API
- Handles all data processing and style connections
- Compiled by webpack to `dist/code.js`

**Build required**: Yes (TypeScript → JavaScript)

### UI (`ui-standalone.html`)
- Runs in iframe (browser environment)
- Displays data and handles user interactions
- Communicates with backend via `postMessage` API
- Self-contained HTML with inline JavaScript and CSS

**Build required**: No (pure HTML/JS/CSS)

## Communication Flow

```
User Action (UI)
    ↓ postMessage
Backend (Plugin Code)
    ↓ Figma API calls
Figma Document
    ↓ Data collection
Backend Processing
    ↓ postMessage
UI Update
```

## Message Types

### UI → Backend
- `analyze`: Scan selected elements
- `connect-element`: Connect element to style/variable

### Backend → UI
- `analysis-result`: Send found unconnected elements
- `connection-success`: Confirm successful connection
- `error`: Report error messages
- `no-selection`: Notify when nothing is selected

## Build Process

### Development
```bash
npm run dev
```
- Watches `src/**/*.ts` files
- Compiles to `dist/code.js` on changes
- UI changes require no rebuild (just reload plugin)

### Production
```bash
npm run build
```
- Compiles backend code once
- Minifies for smaller bundle
- UI is already production-ready (no build needed)

## File Structure

```
Root
├── ui-standalone.html     ← UI (no build)
├── manifest.json         ← Plugin config
└── src/
    ├── code.ts          ← Backend entry point
    ├── types.ts         ← Shared type definitions
    └── utils/
        ├── analyzer.ts  ← Element scanning logic
        └── matcher.ts   ← Style matching algorithms

Compiled
└── dist/
    └── code.js          ← Built backend only
```

## Dependencies

### Production
None - plugin runs with no external runtime dependencies

### Development
- `@figma/plugin-typings`: TypeScript definitions for Figma API
- `typescript`: Type-safe development
- `webpack`: Backend code bundling
- `ts-loader`: TypeScript compilation in webpack

**Removed dependencies** (from previous React version):
- ❌ `react`
- ❌ `react-dom`
- ❌ `@types/react`
- ❌ `@types/react-dom`
- ❌ `html-webpack-plugin`
- ❌ `css-loader`
- ❌ `style-loader`

## Performance Metrics

| Metric | React Version | Standalone |
|--------|--------------|------------|
| Bundle size (UI) | ~154 KB | ~10 KB |
| Initial render | ~200-500ms | ~10-50ms |
| Build time | ~2-3s | ~1s (backend only) |
| Hot reload | Full rebuild | Instant (no build) |

## Development Workflow

### Changing UI
1. Edit `ui-standalone.html`
2. Reload plugin in Figma
3. Done! ✅

### Changing Backend
1. Edit files in `src/`
2. Auto-rebuilds (if `npm run dev` is running)
3. Reload plugin in Figma
4. Done! ✅

## Debugging

### UI Debugging
1. Open plugin in Figma
2. Right-click → **Inspect Element** (or F12)
3. Use Console, Elements, Network tabs normally
4. Console logs from UI appear here

### Backend Debugging
1. Run plugin in Figma
2. **Plugins** → **Development** → **Open Console**
3. Console logs from `src/code.ts` appear here
4. Can also add `console.log()` anywhere in backend code

## Future Considerations

This architecture is optimized for:
- ✅ Reliability in Figma's environment
- ✅ Development speed (no build for UI)
- ✅ Small bundle size
- ✅ Simple maintenance

If the UI grows significantly more complex in the future, consider:
- UI component libraries (lightweight, like Preact)
- Template systems (but keep inline for Figma compatibility)
- Build step for UI only if absolutely necessary

However, vanilla JavaScript with template literals has proven sufficient for even complex UIs (like this tabular interface with real-time updates).


