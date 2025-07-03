# Changelog

All notable changes to the "Clipboard Image Helper" extension will be documented in this file.

## [0.0.1] - 2024-07-03

### Added
- ✨ Initial release of Clipboard Image Helper
- 🎯 One-click clipboard image capture with `Ctrl+Shift+V`
- 🌍 Cross-platform support (Windows, Linux, macOS, WSL)
- 📁 Organized storage in `/tmp/clipboard/` directory
- ⏰ Automatic file cleanup after 10 minutes
- 🧹 Extension shutdown cleanup
- 💻 Terminal integration - sends file path directly to active terminal
- 🛡️ WSL support with Windows clipboard access
- 📝 Clean error messaging and user feedback
- 🔄 Fallback methods for different clipboard tools (xclip, wl-paste, pngpaste)

### Technical Features
- PowerShell integration for Windows clipboard access
- Linux clipboard tools support (xclip, wl-clipboard)
- macOS pngpaste integration
- Smart WSL path conversion and file copying
- Automatic directory creation
- Timeout-based cleanup system
- Error handling with user-friendly messages

### Platform Support
- ✅ Windows 10/11 (PowerShell)
- ✅ Linux (xclip/wl-paste)
- ✅ WSL (Windows + Linux hybrid)
- ✅ macOS (pngpaste)

## Future Plans
- [ ] Configurable cleanup timer
- [ ] Support for different image formats
- [ ] Custom save directory option
- [ ] Clipboard history feature