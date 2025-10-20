# Quick Reference Guide

## Plugin Actions At-a-Glance

### Main Workflow
```
1. Select elements in Figma
2. Click "Analyze Selection"
3. Review unconnected elements
4. Choose action: Connect, Auto-Connect, or Create New
```

---

## Table Columns Explained

| Column | Description | Action |
|--------|-------------|--------|
| **Element** | Name and layer path | Click to identify in Figma |
| **Type** | Fill, Stroke, or Text | Badge color-coded by type |
| **Current Value** | Color preview or typography info | Visual representation |
| **Best Match** | Suggested style with % confidence | Shows top match from library |
| **Select Style** | Dropdown with all available styles | Click to browse and select |
| **Auto-Connect** | One-click connect button | Green "🔗 Auto" button |
| **Create New** | Create style from element | Purple "✨ Create" button |

---

## Button Guide

### 🔗 Auto (Green)
- **When Available**: When a match is found (any confidence %)
- **What It Does**: Connects element to the best matching style
- **Best For**: Quick connections when match looks good

### ✨ Create (Purple)
- **When Available**: Always (for all elements)
- **What It Does**: Creates new style from element properties
- **Best For**: Adding new styles to your design system

---

## Dropdown Features

### Color Style Dropdowns
```
┌─────────────────────────┐
│ [■] Primary Blue       │ ← Color preview
│ [■] Secondary Green    │
│ 🎨 [■] Variable/Main  │ ← Variable (with emoji)
└─────────────────────────┘
```

### Text Style Dropdowns
```
┌─────────────────────────┐
│ Heading 1              │ ← Style name
│   24px                 │ ← Font size
│ Body Text              │
│   16px                 │
└─────────────────────────┘
```

---

## Confidence Scores

| Score | Meaning | Recommendation |
|-------|---------|----------------|
| **100%** | Exact match | Safe to connect |
| **70-99%** | Very close | Review before connecting |
| **50-69%** | Similar | Check if it's correct |
| **20-49%** | Partial match | Verify properties match |
| **< 20%** | No match shown | Consider creating new style |

### Typography Scoring Breakdown
- Font Family: 50 points
- Font Size: 20 points (within 2px = full credit)
- Font Weight: 15 points
- Line Height: 10 points
- Letter Spacing: 5 points

---

## Common Workflows

### Workflow 1: Clean Up Existing Design
1. Select entire frame/page
2. Analyze
3. For each element:
   - If match is 80%+: Use Auto-Connect
   - If match is 50-79%: Review and manually select
   - If no match: Create New or ignore

### Workflow 2: Import From Another File
1. Import design
2. Select all imported elements
3. Analyze
4. For duplicate colors/text: Auto-Connect
5. For new styles: Create New
6. Result: Fully connected to design system

### Workflow 3: Expand Design System
1. Designer creates new elements
2. Select new elements
3. Analyze
4. For approved elements: Create New
5. Result: Design system grows organically

### Workflow 4: Fix Wrong Fonts
1. Select text elements
2. Analyze
3. Look for 20-40% matches (correct size, wrong font)
4. Use Auto-Connect or manual dropdown
5. Result: Correct fonts applied

---

## Filters

Click filter buttons to show only specific types:

| Filter | Shows |
|--------|-------|
| **All** | Everything |
| **Colors** | Fills and Strokes only |
| **Typography** | Text elements only |

---

## Keyboard Tips

- **Enter**: Confirm style creation in modal
- **Escape**: Close dropdown (click outside)
- **Tab**: Navigate between buttons

---

## Creating New Styles

### Steps:
1. Click **✨ Create** button
2. Modal appears with suggested name
3. Edit name if desired (optional)
4. Press **Enter** or click **Create**
5. Style is created and applied
6. Element disappears from list ✓

### Default Naming:
- **Colors**: `Color/ElementName`
- **Strokes**: `Stroke/ElementName`
- **Text**: `Text/ElementName`

### Best Practices:
- Use `/` to organize into folders
- Be descriptive: `Color/Button/Primary` not `Color1`
- Follow team naming conventions
- Group related styles together

---

## Tips & Tricks

### Finding Issues Fast
- Use filters to focus on one type at a time
- Sort by confidence to tackle easy ones first
- Check "Current Value" column for patterns

### Batch Processing
1. Connect all high-confidence matches first (80%+)
2. Review medium matches (50-79%)
3. Create new styles for unique elements
4. Re-analyze to confirm everything is connected

### Maintaining Design System
- Run plugin regularly on new work
- Create styles for approved variations
- Use consistent naming patterns
- Document decisions in style names

### Common Patterns
- **Same color, different name**: Auto-Connect
- **Similar color**: Check if it should be same
- **Correct size, wrong font**: Auto-Connect (20-40% match)
- **One-off element**: Create New if approved
- **Experimental**: Leave unconnected, decide later

---

## Status Messages

| Message | Meaning |
|---------|---------|
| ✓ All elements are connected | Nothing to fix! |
| Found X unconnected element(s) | Issues found |
| ✓ Element connected successfully | Connection worked |
| ✓ Style "Name" created successfully | New style created |
| Analyzing selection... | Analysis in progress |
| ⚠ Please select elements | Nothing selected |
| ⚠ Error: ... | Something went wrong |

---

## Troubleshooting

### "Create does nothing"
- Modal should appear - check if it's behind other windows
- Try reloading the plugin
- Check browser console for errors

### "No matches found"
- Lower confidence threshold helps (now at 20%)
- Element might be truly unique - use Create New
- Check if styles exist in your file

### "Wrong style suggested"
- Use manual dropdown instead of Auto
- Check confidence score
- Review actual properties in Figma

### "Can't see full table"
- Window is now 1000×850px (larger)
- Scroll horizontally if needed
- Use filters to reduce items shown

---

## Performance

- **Fast**: Analyzing 100s of elements takes seconds
- **Efficient**: Only scans selected elements
- **Responsive**: UI updates immediately after actions
- **Reliable**: No data loss, all actions are reversible in Figma

---

## Need Help?

1. Check README.md for detailed documentation
2. Review CHANGELOG.md for recent changes
3. See CREATE_STYLE_FEATURE.md for style creation details
4. Open an issue on GitHub for bugs
5. Contribute improvements via pull request

---

## Version Info

Current Version: **2.0.0**
- Enhanced dropdowns with previews
- Create new style feature
- Improved matching algorithm
- Larger window (1000×850px)
- Custom modal dialogs

For full version history, see CHANGELOG.md


