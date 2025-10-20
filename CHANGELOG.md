# Changelog

All notable changes to the Figma Design System Checker plugin will be documented in this file.

## [2.0.0] - 2025-10-20

### Added

#### Create New Style Feature
- **New "Create New" Column**: Added purple "✨ Create" button for every unconnected element
- **Style Creation**: Create paint styles (fills/strokes) and text styles directly from elements
- **Smart Naming**: Auto-suggests style names based on element type:
  - Color fills: `Color/{element-name}`
  - Strokes: `Stroke/{element-name}`
  - Text: `Text/{element-name}`
- **Custom Modal**: Built-in modal dialog for entering style names (works in Figma iframe)
- **Auto-Apply**: Newly created styles are automatically applied to the source element
- **Property Copying**: All element properties are copied to the new style:
  - Text: font family, size, weight, line height, letter spacing, paragraph spacing, text case, decoration
  - Colors: RGBA values, opacity, all paint properties

#### Enhanced Dropdowns
- **Color Preview Thumbnails**: 16×16px color preview boxes next to color style names
- **Font Size Display**: Shows font size (e.g., "24px") under text style names
- **Custom Dropdown Component**: Replaced native `<select>` with rich HTML dropdowns
- **Visual Feedback**: Hover effects and better visual hierarchy
- **Better Organization**: Two-line layout for text styles (name + metadata)

#### Improved Typography Matching
- **Lower Threshold**: Reduced from 60% to 20% to catch more potential matches
- **Better Font Size Scoring**: Full credit if sizes are within 2px of each other
- **Forgiving Weight Matching**: More generous scoring for similar font weights (e.g., 400 vs 500)
- **Wrong Font Detection**: Now surfaces matches where font size is correct but font family is wrong
- **Use Case**: Helps identify elements where users accidentally used the wrong font

### Changed

#### Window Size
- **Increased Dimensions**: 700×700px → 1000×850px
- **Better Visibility**: More room for table columns and longer element names
- **Improved UX**: Less scrolling needed to view results

#### UI/UX Improvements
- **Table Layout**: Added new column for "Create New" action
- **Column Headers**: Renamed "Actions" to "Auto-Connect" for clarity
- **Success Messages**: Added feedback for style creation
- **Modal Dialogs**: Custom modals replace browser prompts for better compatibility

### Fixed
- **Prompt Dialog**: Replaced non-working native `prompt()` with custom modal
- **TypeScript Errors**: Fixed mixed text properties in style creation
- **Iframe Compatibility**: All UI components now work properly in Figma's iframe environment

### Technical

#### Backend (`src/code.ts`)
- Added `handleCreateStyle()` function
- New message type: `create-style`
- New response type: `style-created`
- Handles text style and paint style creation
- Copies all element properties to new styles

#### Types (`src/types.ts`)
- Extended `MessageToPlugin` union with `create-style`
- Extended `MessageToUI` union with `style-created`
- Added optional `color` and `typography` fields to `AvailableStyle`

#### Matcher (`src/utils/matcher.ts`)
- Reduced match threshold from 60% to 20%
- Improved font size scoring algorithm
- Enhanced font weight scoring
- Better partial credit for near matches

#### UI (`ui-standalone.html`)
- Added CSS for custom dropdowns
- Added CSS for modal overlay
- Implemented modal state management
- Added keyboard support (Enter to confirm)
- Custom dropdown rendering with previews

### Build
- All builds successful
- No breaking changes to existing features
- Fully backward compatible

---

## [1.0.0] - Initial Release

### Features
- Color checking for fills and strokes
- Typography checking for text elements
- Smart matching algorithm for styles
- Manual style selection via dropdown
- Auto-connect to best matching style
- Filter by element type (colors/typography)
- Support for both paint styles and color variables
- Tabular display with detailed information
- Confidence scoring for matches
- Layer path breadcrumbs

### Architecture
- Standalone HTML UI (no framework)
- TypeScript backend compiled with Webpack
- Vanilla JavaScript for maximum performance
- Message-based communication between UI and plugin

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

---

## Contributing

See [CONTRIBUTING.md] for guidelines on how to contribute to this project.

---

## Documentation

- **README.md** - Main documentation and getting started guide
- **ARCHITECTURE.md** - Technical architecture details
- **INTERFACE_UPGRADE_SUMMARY.md** - Details on dropdown enhancements
- **CREATE_STYLE_FEATURE.md** - Create new style feature documentation
- **UI_IMPROVEMENTS.md** - Visual reference for UI changes
- **COMPLETE.md** - Implementation completion status
- **QUICK_START.md** - Quick start guide for new users
