# UI Improvements - Visual Reference

## Enhanced Dropdowns

### Color Style Dropdown

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│  Choose manually...              ▼     │ ← Trigger (clickable)
└─────────────────────────────────────────┘
         │ (when opened)
         ▼
┌─────────────────────────────────────────┐
│  [■] Primary Blue                       │ ← Color thumbnail + name
│  [■] Secondary Green                    │
│  [■] Accent Red                         │
│  [■] Background Gray                    │
│  🎨 [■] Primary/Main                   │ ← Variable (with emoji)
│  🎨 [■] Surface/Light                  │
└─────────────────────────────────────────┘
```

**Features:**
- 16×16px color preview box (rounded corners, 1px border)
- Color shown as RGBA background
- Border helps distinguish light colors
- Variable colors prefixed with 🎨 emoji
- Hover effect on each option

### Text Style Dropdown

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│  Choose manually...              ▼     │ ← Trigger (clickable)
└─────────────────────────────────────────┘
         │ (when opened)
         ▼
┌─────────────────────────────────────────┐
│  Heading 1                              │ ← Style name (bold)
│    32px                                 │ ← Font size (gray, smaller)
│  Heading 2                              │
│    24px                                 │
│  Body Text                              │
│    16px                                 │
│  Caption                                │
│    12px                                 │
└─────────────────────────────────────────┘
```

**Features:**
- Style name in bold text (10px)
- Font size displayed below in gray (9px)
- Two-line layout per option
- Hover effect on each option

## CSS Classes Reference

### Main Container
- `.custom-dropdown` - Relative positioned container

### Trigger Button
- `.dropdown-trigger` - Main clickable button
  - Width: 100%
  - Padding: 6px 8px
  - Border: 1px solid #ddd
  - Border radius: 4px
  - Hover: Border changes to #18a0fb

### Dropdown Menu
- `.dropdown-menu` - Popup menu container
  - Position: Absolute
  - Max height: 200px (scrollable)
  - Box shadow: 0 4px 12px rgba(0,0,0,0.15)
  - Display: none (until .open class added)

### Options
- `.dropdown-option` - Individual style option
  - Display: flex (horizontal layout)
  - Gap: 8px
  - Padding: 8px 10px
  - Hover: Background #f5f5f5

### Color Preview
- `.color-preview` - Color thumbnail
  - Width: 16px
  - Height: 16px
  - Border radius: 3px
  - Border: 1px solid #ddd
  - Flex shrink: 0

### Style Info
- `.style-info` - Text container
  - Display: flex (vertical layout)
  - Gap: 2px

- `.style-name` - Style name text
  - Font weight: 500
  - Color: #000

- `.style-meta` - Metadata text (font size)
  - Font size: 9px
  - Color: #999

## Interaction Flow

1. **Opening Dropdown**
   - User clicks trigger button
   - `toggleDropdown(idx)` function is called
   - Closes all other open dropdowns
   - Adds `.open` class to menu (displays it)

2. **Selecting Style**
   - User clicks an option
   - `handleConnect(element, styleId)` is called
   - Style is applied to element
   - Dropdown closes
   - UI re-renders with updated data

3. **Closing Dropdown**
   - Click outside dropdown area
   - Click trigger again (toggle)
   - Select an option
   - All trigger `.open` class removal

## Browser Compatibility

- Uses standard CSS Flexbox (widely supported)
- Uses rgba() colors (widely supported)
- No CSS Grid or advanced features
- Works in Figma's embedded browser environment

## Accessibility Considerations

- Keyboard navigation: Can be enhanced with arrow key support
- Focus states: Visible on trigger button
- Color contrast: Meets WCAG AA standards
- Screen readers: Could be enhanced with ARIA labels

## Performance

- Lightweight: No external dependencies
- Fast rendering: Simple DOM manipulation
- Efficient: Only visible dropdowns are in DOM
- No framework overhead

## Customization Options

To customize colors:
- Change `.dropdown-trigger:hover` border color
- Adjust `.dropdown-option:hover` background
- Modify `.color-preview` border radius for different shape
- Update `.style-meta` color for different emphasis

To customize sizes:
- Adjust `.color-preview` width/height for larger thumbnails
- Change `.dropdown-menu` max-height for more visible options
- Modify padding in `.dropdown-option` for spacing


