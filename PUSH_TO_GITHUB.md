# How to Push This Project to GitHub

Your repository: https://github.com/jarek-miscreants/figma-design-system-checker.git

## Step 1: Install Git

1. Download Git for Windows from: https://git-scm.com/download/win
2. Run the installer with default options
3. Restart your terminal/IDE after installation

## Step 2: Configure Git (First Time Only)

Open a terminal (PowerShell, Command Prompt, or Git Bash) and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize and Push

Navigate to your project directory and run these commands:

```bash
# Navigate to project
cd "L:\Apps\Figma Extension"

# Initialize git repository
git init

# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "Version 2.0.0 - Initial release

Features:
- Enhanced dropdowns with color previews and font sizes
- Create new styles functionality
- Improved typography matching (20% threshold)
- Larger window (1000x850px)
- Custom modal dialogs
- Full design system management"

# Add your GitHub repository as remote
git remote add origin https://github.com/jarek-miscreants/figma-design-system-checker.git

# Push to GitHub (main branch)
git push -u origin main
```

## Alternative: If you get "branch name" error

Some Git versions use `master` instead of `main`:

```bash
# If the above fails, try:
git branch -M main
git push -u origin main
```

## Step 4: Verify

Go to your GitHub repository to verify the files are uploaded:
https://github.com/jarek-miscreants/figma-design-system-checker

## Using GitHub Desktop (Alternative)

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in to GitHub
3. Click "Add" → "Add Existing Repository"
4. Browse to: `L:\Apps\Figma Extension`
5. Click "Publish repository"
6. Choose "figma-design-system-checker" as the name
7. Click "Publish Repository"

## Files Included

The `.gitignore` file has been created to exclude:
- `node_modules/` (dependencies)
- `dist/` (you can remove this from .gitignore if you want to include built files)
- OS and editor files
- Logs and temp files

## What Gets Pushed

✅ Source code (`src/`)
✅ UI file (`ui-standalone.html`)
✅ Configuration files (`manifest.json`, `package.json`, `webpack.config.js`, `tsconfig.json`)
✅ Documentation (all `.md` files)
✅ Build output (`dist/code.js`)

❌ `node_modules/` (excluded - users will run `npm install`)
❌ Editor settings
❌ OS files

## After Pushing

Your repository will be public and available at:
https://github.com/jarek-miscreants/figma-design-system-checker

### Recommended: Add Topics

On GitHub, add these topics to help people find your plugin:
- `figma`
- `figma-plugin`
- `design-system`
- `design-tools`
- `typescript`
- `vanilla-javascript`

### Recommended: Add Description

Set your repository description to:
> A Figma plugin to check design system compliance. Features enhanced dropdowns with previews, create new styles, improved matching, and more.

## Need Help?

- Git documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Common Git commands: https://education.github.com/git-cheat-sheet-education.pdf

