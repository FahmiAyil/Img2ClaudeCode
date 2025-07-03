# Image Helper for Claude Code

A VS Code/Cursor extension that captures clipboard images and sends their file paths directly to your terminal for use with Claude Code.

## 🚀 Features

- **One-click clipboard image capture** with `Ctrl+Shift+V`
- **Cross-platform support** (Windows, Linux, macOS, WSL)
- **Automatic file management** (saves to `/tmp/clipboard/` and auto-deletes after 10 minutes)
- **Terminal integration** (sends file path directly to active terminal)
- **Clean error messaging** for better user experience

## 📦 Installation

### Option 1: Download Release (Recommended)

1. Go to [Releases](https://github.com/FahmiAyil/Img2ClaudeCode/releases)
2. Download the latest `clipboard-image-helper-0.0.1.vsix` file
3. Open VS Code or Cursor
4. Press `Ctrl+Shift+P` to open Command Palette
5. Type "Extensions: Install from VSIX..."
6. Select the downloaded VSIX file
7. Reload the window when prompted

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/FahmiAyil/Img2ClaudeCode.git
cd Img2ClaudeCode

# Install dependencies
npm install

# Build the extension
npm run compile

# Package as VSIX
npm run package
```

## 🔧 Prerequisites

### For Windows Users

- **PowerShell** (pre-installed on Windows 10/11)
- No additional setup required

### For Linux Users

Install clipboard utilities:

```bash
# Ubuntu/Debian
sudo apt install xclip

# Or for Wayland users
sudo apt install wl-clipboard
```

### For WSL Users

The extension works in WSL with Windows clipboard access:

```bash
# Install Linux clipboard tools (optional, as fallback)
sudo apt install xclip

# PowerShell should be accessible from WSL
```

### For macOS Users

Install pngpaste:

```bash
# Using Homebrew
brew install pngpaste
```

## 🎯 Usage

### Basic Usage

1. **Copy an image** to your clipboard:

   - Screenshot (`Win+Shift+S` on Windows, `Cmd+Shift+4` on macOS)
   - Copy image from browser/file manager (`Ctrl+C`)
   - Copy from image editing software

2. **Open a terminal** in VS Code/Cursor:

   - `Ctrl+`` (backtick) or use Terminal menu

3. **Paste the image**:

   - Press `Ctrl+Shift+V`
   - Or use Command Palette: "Paste Clipboard Image to Claude Code"

4. **The file path will appear in your terminal**, ready to use with Claude Code:
   ```
   /tmp/clipboard/claude-image-1751234567890.png
   ```

### With Claude Code

Perfect for sending images to Claude Code:

```bash
# The extension automatically types the path in terminal
/tmp/clipboard/claude-image-1751234567890.png

# Just press Enter to send to Claude Code
```

## 📁 File Management

### Storage Location

- **Linux/WSL**: `/tmp/clipboard/`
- **Windows**: `%TEMP%` (then copied to terminal path)
- **macOS**: `/tmp/clipboard/`

### Auto-cleanup

- Files are **automatically deleted after 10 minutes**
- Files are also **cleaned up when VS Code closes**
- No manual cleanup required

### File Naming

Files are named with timestamp: `claude-image-[timestamp].png`

Example: `claude-image-1751234567890.png`

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action                            |
| -------------- | --------------------------------- |
| `Ctrl+Shift+V` | Paste clipboard image to terminal |

_Note: Only works when terminal is focused_

## ❗ Troubleshooting

### "No image found in clipboard"

- Ensure you've copied an image (not text or file)
- Try copying the image again
- Some applications may not properly copy to system clipboard

### "No active terminal found"

- Open a terminal first: `Ctrl+`` (backtick)
- Make sure the terminal is focused/active
- Try clicking in the terminal area

### WSL Issues

- Ensure PowerShell is accessible: `powershell.exe -Command "echo test"`
- Install xclip as fallback: `sudo apt install xclip`

### Linux Issues

- Install required clipboard tools:
  ```bash
  sudo apt install xclip
  # or for Wayland
  sudo apt install wl-clipboard
  ```

### Permission Issues

- Ensure `/tmp` directory is writable
- Check that the extension can create `/tmp/clipboard/` directory

## 🛠️ Development

### Project Structure

```
Img2ClaudeCode/
├── src/
│   └── extension.ts          # Main extension code
├── out/                      # Compiled JavaScript
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript config
├── README.md                # This file
├── INSTALL.md               # Quick installation guide
├── CHANGELOG.md             # Version history
└── .gitignore               # Git ignore file
```

### Build Commands

```bash
npm run compile              # Compile TypeScript
npm run package             # Create VSIX package
npm run vscode:prepublish   # Pre-publish script
```

### Platform Support

The extension detects your environment and uses the appropriate clipboard method:

- **Windows**: PowerShell with Windows.Forms
- **WSL**: PowerShell via WSL + Linux tools fallback
- **Linux**: xclip or wl-paste
- **macOS**: pngpaste

## 📝 License

This project is open source. Feel free to modify and distribute.

## 👤 Author

**FahmiAyil**

## 🐛 Issues & Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Try reloading VS Code/Cursor
4. Check that you have an image in clipboard (not text/files)

## 🔄 Version History

### v0.0.1

- Initial release
- Cross-platform clipboard image capture
- Auto-cleanup functionality
- Terminal integration
- WSL support
