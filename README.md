# Figma Design System Checker

A Figma plugin that helps maintain design system compliance by checking if all color and typography elements in your selection are properly connected to styles or variables.

## Features

- ✅ **Color Checking**: Scans fills and strokes to detect unconnected colors
- ✅ **Typography Checking**: Identifies text elements not using text styles
- ✅ **Smart Matching**: Suggests matching styles with exact and closest match algorithms (improved for font size matches)
- ✅ **Visual Dropdowns**: Color preview thumbnails and font size display in style dropdowns
- ✅ **Manual Selection**: Choose from dropdown of all available styles and variables
- ✅ **Auto-Connect**: One-click automatic connection to best matching style
- ✅ **Create New Styles**: Convert any unconnected element into a new style with one click
- ✅ **Clear Overview**: Tabular display with filter by type (colors, typography)
- ✅ **Variable Support**: Full support for color variables alongside paint styles
- ✅ **Large Interface**: Spacious 1000×850px window for comfortable viewing

## Installation

### For Development

1. Install dependencies:
```bash
npm install
```

2. Build the plugin backend:
```bash
npm run build
```

Or run in development mode with watch:
```bash
npm run dev
```

3. Load the plugin in Figma:
   - Open Figma Desktop App
   - Go to **Plugins** → **Development** → **Import plugin from manifest...**
   - Select the `manifest.json` file from this directory
   - The plugin will appear in **Plugins** → **Development** → **Design System Checker**

**Note**: The UI is a standalone HTML file (`ui-standalone.html`) that requires no build process. Only the backend code (`src/code.ts`) needs to be compiled.

## Usage

1. **Select Elements**: Select one or more frames, layers, or elements in your Figma document
2. **Analyze**: Click the "Analyze Selection" button in the plugin UI
3. **Review Results**: The plugin displays all unconnected elements in a table with:
   - Element name and layer path
   - Element type (Fill, Stroke, or Text)
   - Current color/typography value with visual preview
   - Best match suggestion with confidence percentage
   - Dropdown to manually select any available style or variable (with color previews and font sizes)
   - Auto-connect button for quick connection to best match
   - Create new style button to generate a style from the element
4. **Connect or Create**: 
   - **Auto-Connect**: Click the green "🔗 Auto" button to connect to the best matching style
   - **Manual Selection**: Choose any style from the enhanced dropdown to connect manually
   - **Create New**: Click the purple "✨ Create" button to create a new style from this element
5. **Filter**: Use the filter buttons to show only colors or typography issues

## How It Works

### Color Matching
- **Exact Match**: Finds styles with identical RGB values (100% confidence)
- **Closest Match**: Calculates Euclidean distance in RGB color space to find similar colors (50-99% confidence)

### Typography Matching
- **Exact Match**: All properties must match (font family, size, weight, line height, letter spacing)
- **Closest Match**: Weighted scoring algorithm prioritizing:
  - Font family (50%)
  - Font size (20%) - Full credit if within 2px, helps catch wrong fonts with correct sizes
  - Font weight (15%) - More forgiving with similar weights
  - Line height (10%)
  - Letter spacing (5%)
- **Lower Threshold**: Shows matches above 20% confidence (down from 60%) to help find elements with correct size but wrong font

### What Gets Checked

**Colors:**
- Fills on all layer types
- Strokes on all layer types
- Both paint styles and color variables
- Variable binding support for automatic and manual connections

**Typography:**
- Text layers without text styles
- All text properties (family, size, weight, line height, letter spacing)

### Interface Features

**Tabular Display:**
- All unconnected elements shown in a clean, sortable table
- Columns for element info, type, current value, best match, manual selection, auto-connect, and create new
- Large 1000×850px window for comfortable viewing

**Enhanced Dropdowns:**
- **Color Styles**: 16×16px color preview thumbnails next to style names
- **Text Styles**: Font size displayed under style name for easy identification
- **Variables**: Color variables are prefixed with 🎨 emoji
- **Custom UI**: Rich HTML dropdowns with hover effects and visual feedback

**Connection Options:**
- **Best Match**: AI-suggested style based on proximity matching (now shows more results)
- **Manual Dropdown**: Select from all available styles and variables with visual previews
- **Auto-Connect Button**: One-click connection to best match (green "🔗 Auto" button)
- **Create New Style**: Create a new style from any element (purple "✨ Create" button)

## Project Structure

```
├── manifest.json           # Figma plugin configuration
├── package.json           # Dependencies and scripts
├── webpack.config.js      # Build configuration (backend only)
├── tsconfig.json          # TypeScript configuration
├── ui-standalone.html     # Standalone UI (no build required)
└── src/
    ├── code.ts           # Main plugin code (runs in Figma sandbox)
    ├── types.ts          # TypeScript interfaces
    └── utils/
        ├── analyzer.ts   # Element scanning and analysis
        └── matcher.ts    # Style matching algorithms
└── dist/
    └── code.js           # Compiled plugin backend
```

## Building for Production

```bash
npm run build
```

This compiles the TypeScript backend code to `dist/code.js`. The UI (`ui-standalone.html`) requires no build process.

## Technology Stack

- **TypeScript**: Type-safe plugin development
- **Vanilla JavaScript**: Lightweight, performant UI with no framework overhead
- **Webpack**: Module bundling for backend code
- **Figma Plugin API**: Direct integration with Figma

## Architecture

The plugin uses a **standalone UI architecture** for maximum compatibility with Figma:

- **Backend** (`src/code.ts`): Compiled TypeScript that runs in Figma's sandbox
- **UI** (`ui-standalone.html`): Self-contained HTML file with inline JavaScript and CSS
- **Benefits**:
  - No React rendering issues in Figma's iframe environment
  - Faster loading and better performance
  - Simpler debugging with direct DOM manipulation
  - No build process required for UI changes

## Recent Updates

### Version 2.0 Features:
- ✅ **Enhanced Dropdowns**: Color preview thumbnails and font size display
- ✅ **Create New Styles**: One-click style creation from any element  
- ✅ **Improved Matching**: Better typography matching for elements with correct size but wrong font
- ✅ **Larger Window**: Increased to 1000×850px for better visibility
- ✅ **Custom Modals**: Native modal dialogs that work in Figma's iframe environment

## Future Enhancements

- Create color variables (in addition to paint styles)
- Export audit reports (CSV, JSON)
- Bulk connect/create multiple elements at once
- Custom matching thresholds configuration
- Support for gradient and image fills
- Effect styles checking (shadows, blurs)
- History of changes made
- Undo/redo functionality
- Advanced filtering and search
- Keyboard shortcuts for common actions

## Documentation

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for all features and workflows
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and detailed changes
- **[CREATE_STYLE_FEATURE.md](CREATE_STYLE_FEATURE.md)** - In-depth guide to creating new styles
- **[INTERFACE_UPGRADE_SUMMARY.md](INTERFACE_UPGRADE_SUMMARY.md)** - Technical details on UI improvements
- **[UI_IMPROVEMENTS.md](UI_IMPROVEMENTS.md)** - Visual reference for interface components

## License

MIT

## Contributing

Feel free to open issues or submit pull requests for improvements!

## Version

**Current: 2.0.0**

See [CHANGELOG.md](CHANGELOG.md) for version history.

