# Create New Style Feature

## Overview
Added a new column that allows users to create new styles or variables directly from unconnected elements in the plugin.

## What Changed

### 1. New Column: "Create New"
- Added a purple "✨ Create" button for each unconnected element
- Positioned as the last column in the table
- Always available for all elements (unlike Auto-Connect which requires a match)

### 2. Backend Implementation (`src/code.ts`)
- New message handler: `handleCreateStyle()`
- Supports creating:
  - **Text Styles** from text elements
  - **Paint Styles** from fill colors
  - **Paint Styles** from stroke colors

### 3. Style Creation Process
When user clicks "✨ Create":
1. Prompts for style name with suggested default
2. Creates appropriate style in Figma
3. Copies all properties from the element to the style
4. Automatically applies the new style to the element
5. Re-analyzes to update the UI (element disappears from list)

## Default Style Names

The plugin suggests smart default names based on element type:

| Element Type | Default Name Format | Example |
|--------------|---------------------|---------|
| Fill | `Color/{element-name}` | `Color/Button Background` |
| Stroke | `Stroke/{element-name}` | `Stroke/Border Line` |
| Typography | `Text/{element-name}` | `Text/Heading` |

Users can modify the name before creating.

## Technical Details

### Message Types
**New Plugin Message:**
```typescript
{ 
  type: 'create-style';
  nodeId: string;
  elementType: 'fill' | 'stroke' | 'typography';
  styleName: string;
  paintIndex?: number;
}
```

**New UI Message:**
```typescript
{ 
  type: 'style-created';
  nodeId: string;
  styleName: string;
}
```

### Created Style Properties

**Text Styles include:**
- Font family & style (weight)
- Font size
- Line height
- Letter spacing
- Paragraph spacing
- Text case (if not mixed)
- Text decoration (if not mixed)

**Paint Styles include:**
- Color (RGBA)
- Opacity
- All paint properties from source element

## User Interface

### Table Layout
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Element │ Type │ Current Value │ Best Match │ Select Style │ Auto │ Create │
├──────────────────────────────────────────────────────────────────────────┤
│ Button  │ FILL │ [■] #3B82F6   │ Primary    │ [Dropdown]  │ 🔗 │ ✨     │
│         │      │                │ (85%)      │             │ Auto│ Create │
└──────────────────────────────────────────────────────────────────────────┘
```

### Create Button
- **Color**: Purple (#7c3aed)
- **Icon**: ✨ sparkles emoji
- **Label**: "Create"
- **Size**: Same as Auto-Connect button
- **Always visible**: Unlike Auto button which only shows with matches

### Workflow Example

1. **User has text with Arial 16px (not in design system)**
2. **Plugin shows**: No match or low confidence match
3. **User clicks** "✨ Create"
4. **Dialog appears**: "Enter a name for the new style:"
   - Default: "Text/My Heading"
5. **User confirms** (or edits name)
6. **Plugin creates** text style with all properties
7. **Style is applied** to the element
8. **Element disappears** from unconnected list (now connected!)

## Benefits

### For Users:
- **Quick style creation** without leaving the plugin
- **Batch workflow**: Analyze → Create missing styles → Done
- **Consistency**: All properties copied accurately
- **Organization**: Suggested naming with folders (Color/, Stroke/, Text/)

### For Design Systems:
- **Easy onboarding**: Convert existing designs to design system
- **Capture variations**: Create styles from actual usage
- **Expand library**: Add missing styles on the fly
- **Maintain compliance**: Convert unconnected → connected quickly

## Use Cases

### 1. New Project Setup
- Import designs from non-design-system file
- Analyze all elements
- Create styles for unique colors/typography
- Connect duplicates to existing styles

### 2. Design System Expansion
- Designer uses one-off color/text
- Team reviews and approves
- Create new style from the element
- Now part of the design system

### 3. Migration
- Moving from old design system
- Analyze entire file
- Create new styles for valid elements
- Connect similar ones to existing styles

### 4. Cleanup
- Find all unconnected elements
- Decide: Connect to existing or create new
- Batch process with mix of both actions
- Achieve 100% compliance

## Testing Recommendations

1. **Test creating text styles:**
   - Simple text (single font, size)
   - Mixed text properties
   - Different fonts and sizes

2. **Test creating color styles:**
   - Solid fills
   - Solid strokes
   - Various colors (light, dark, transparent)

3. **Test naming:**
   - Accept default names
   - Custom names with folders
   - Special characters
   - Very long names

4. **Test workflow:**
   - Create → Apply → Element disappears
   - Create multiple styles in sequence
   - Mix create + connect actions

## Known Limitations

1. **Only solid colors**: Gradients not yet supported for style creation
2. **Single paint**: Multi-fill/stroke elements use first paint only
3. **No variable creation**: Creates paint styles, not variables (could be added)
4. **Basic text**: Some advanced text properties might not transfer
5. **No undo**: Once style is created, use Figma's history to undo

## Future Enhancements

Potential additions:
- [ ] Create color variables instead of paint styles (user choice)
- [ ] Support gradient style creation
- [ ] Bulk create for multiple elements at once
- [ ] Custom naming templates/patterns
- [ ] Preview before creating
- [ ] Duplicate detection (warn if style name exists)
- [ ] Create in specific folder structure
- [ ] Apply to similar elements automatically

## API Reference

### handleCreateStyle Function
```typescript
async function handleCreateStyle(
  nodeId: string,
  elementType: 'fill' | 'stroke' | 'typography',
  styleName: string,
  paintIndex?: number
): Promise<void>
```

**Parameters:**
- `nodeId`: Figma node ID of the element
- `elementType`: Type of style to create
- `styleName`: Name for the new style
- `paintIndex`: For multi-paint elements (optional)

**Returns:** void (posts message to UI)

**Errors:** Posts error message if creation fails

## Build Status

✅ TypeScript compilation successful
✅ All linter checks passed
✅ Build size: 9.68 KiB
✅ No breaking changes

## Compatibility

- Works with existing analyze/connect features
- No changes to existing API
- Fully backward compatible
- Extends MessageToPlugin union type

## Summary

The "Create New Style" feature completes the plugin's functionality by allowing users to not only connect to existing styles but also create new ones on the fly. This makes the plugin a complete tool for achieving and maintaining design system compliance.

**Before:** Analyze → Connect existing
**After:** Analyze → Connect existing OR Create new

Users now have full control over their design system workflow! 🎨✨


