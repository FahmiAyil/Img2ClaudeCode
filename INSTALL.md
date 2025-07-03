# Quick Installation Guide

## 🚀 Install the Extension

### Step 1: Download
Get the latest `clipboard-image-helper-0.0.1.vsix` file from the project.

### Step 2: Install in VS Code/Cursor
1. Open VS Code or Cursor
2. Press `Ctrl+Shift+P` (Command Palette)
3. Type: `Extensions: Install from VSIX...`
4. Select the `.vsix` file
5. Click "Reload Window" when prompted

## 🔧 Install Dependencies

### Windows Users ✅
No additional setup needed! PowerShell is pre-installed.

### Linux/Ubuntu Users
```bash
sudo apt install xclip
```

### WSL Users
```bash
# Optional (extension uses Windows clipboard automatically)
sudo apt install xclip
```

### macOS Users
```bash
brew install pngpaste
```

## ✅ Test Installation

1. Copy any image to clipboard
2. Open terminal in VS Code (`Ctrl+` `)
3. Press `Ctrl+Shift+V`
4. Should see: `/tmp/clipboard/claude-image-[timestamp].png`

## ❗ Issues?
- Windows: Ensure PowerShell works: `powershell.exe -Command "echo test"`
- Linux: Install xclip: `sudo apt install xclip`
- macOS: Install pngpaste: `brew install pngpaste`
- WSL: Should work automatically with Windows clipboard

## 🎯 Ready to Use!
Press `Ctrl+Shift+V` whenever you have an image in clipboard!