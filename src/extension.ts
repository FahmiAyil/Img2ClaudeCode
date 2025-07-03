import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Track temporary files for cleanup
const tempFiles: Map<string, NodeJS.Timeout> = new Map();

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('clipboardImageHelper.pasteImage', async () => {
        try {
            const tempDir = '/tmp/clipboard';
            
            // Create clipboard directory if it doesn't exist
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            const timestamp = Date.now();
            const imagePath = path.join(tempDir, `claude-image-${timestamp}.png`);
            
            const success = await saveClipboardImage(imagePath);
            
            if (success) {
                // Schedule file deletion after 10 minutes
                scheduleFileDeletion(imagePath);
                
                // Send path to active terminal
                const terminal = vscode.window.activeTerminal;
                if (terminal) {
                    const formattedPath = imagePath.replace(/\\/g, '/');
                    terminal.sendText(formattedPath);
                    vscode.window.showInformationMessage(`✅ Image saved: ${path.basename(imagePath)}`);
                } else {
                    vscode.window.showErrorMessage('No active terminal found. Please open a terminal first.');
                }
            } else {
                vscode.window.showErrorMessage('❌ No image found in clipboard. Copy an image first, then try again.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error pasting image: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
    
    // Clean up temp files when extension is deactivated
    context.subscriptions.push({
        dispose: () => {
            tempFiles.forEach((timeout, filePath) => {
                clearTimeout(timeout);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {
                    // Silently handle cleanup errors
                }
            });
            tempFiles.clear();
        }
    });
}

async function saveClipboardImage(imagePath: string): Promise<boolean> {
    try {
        // Check if we're in WSL
        let isWSL = false;
        try {
            isWSL = process.env.WSL_DISTRO_NAME !== undefined || 
                   process.env.WSLENV !== undefined;
            
            if (!isWSL && fs.existsSync('/proc/version')) {
                const procVersion = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
                isWSL = procVersion.includes('microsoft') || procVersion.includes('wsl');
            }
        } catch (e) {
            // Continue with detection failure
        }
        
        // Try different methods based on environment
        if (process.platform === 'win32' && !isWSL) {
            return await saveClipboardImageWindows(imagePath);
        }
        else if (isWSL) {
            // Method 1: Try PowerShell via WSL
            const windowsSuccess = await saveClipboardImageWindowsWSL(imagePath);
            if (windowsSuccess) {
                return true;
            }
            
            // Method 2: Try Linux clipboard tools
            const hasXclip = await checkCommand('xclip');
            const hasWlPaste = await checkCommand('wl-paste');
            
            if (hasXclip || hasWlPaste) {
                const linuxSuccess = await saveClipboardImageLinux(imagePath);
                if (linuxSuccess) {
                    return true;
                }
            }
            
            return false;
        }
        else if (process.platform === 'linux') {
            return await saveClipboardImageLinux(imagePath);
        }
        else if (process.platform === 'darwin') {
            return await saveClipboardImageMac(imagePath);
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

async function saveClipboardImageWindowsWSL(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        
        // Use Windows temp directory and copy to WSL path later
        const fileName = path.basename(imagePath);
        const windowsPath = `C:\\Windows\\Temp\\${fileName}`;
        
        // PowerShell script to save clipboard image
        const psScript = `
            try {
                Add-Type -AssemblyName System.Windows.Forms;
                Add-Type -AssemblyName System.Drawing;
                $clipboard = [System.Windows.Forms.Clipboard]::GetDataObject();
                if ($clipboard.GetDataPresent([System.Windows.Forms.DataFormats]::Bitmap)) {
                    $image = $clipboard.GetData([System.Windows.Forms.DataFormats]::Bitmap);
                    $image.Save("${windowsPath.replace(/\\/g, '\\\\')}", [System.Drawing.Imaging.ImageFormat]::Png);
                    Write-Output 'success';
                } else {
                    Write-Output 'no-image';
                }
            } catch {
                Write-Output 'error';
            }
        `;
        
        const ps = spawn('powershell.exe', ['-Command', psScript], { 
            stdio: ['pipe', 'pipe', 'pipe'] 
        });
        
        let output = '';
        ps.stdout.on('data', (data: Buffer) => {
            output += data.toString();
        });
        
        ps.on('close', () => {
            if (output.trim() === 'success') {
                // Copy from Windows temp to WSL path
                try {
                    const wslWindowsPath = `/mnt/c/Windows/Temp/${fileName}`;
                    
                    if (fs.existsSync(wslWindowsPath)) {
                        fs.copyFileSync(wslWindowsPath, imagePath);
                        // Clean up Windows temp file
                        fs.unlinkSync(wslWindowsPath);
                        resolve(fs.existsSync(imagePath));
                    } else {
                        resolve(false);
                    }
                } catch (copyError) {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
        
        ps.on('error', () => {
            resolve(false);
        });
    });
}

async function saveClipboardImageWindows(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        
        // PowerShell script to save clipboard image
        const psScript = `
            try {
                Add-Type -AssemblyName System.Windows.Forms;
                Add-Type -AssemblyName System.Drawing;
                $clipboard = [System.Windows.Forms.Clipboard]::GetDataObject();
                if ($clipboard.GetDataPresent([System.Windows.Forms.DataFormats]::Bitmap)) {
                    $image = $clipboard.GetData([System.Windows.Forms.DataFormats]::Bitmap);
                    $image.Save("${imagePath.replace(/\\/g, '\\\\')}", [System.Drawing.Imaging.ImageFormat]::Png);
                    Write-Output 'success';
                } else {
                    Write-Output 'no-image';
                }
            } catch {
                Write-Output 'error';
            }
        `;
        
        const ps = spawn('powershell.exe', ['-Command', psScript], { 
            stdio: ['pipe', 'pipe', 'pipe'] 
        });
        
        let output = '';
        ps.stdout.on('data', (data: Buffer) => {
            output += data.toString();
        });
        
        ps.on('close', () => {
            resolve(output.trim() === 'success' && fs.existsSync(imagePath));
        });
        
        ps.on('error', () => {
            resolve(false);
        });
    });
}

async function saveClipboardImageLinux(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        
        // Try xclip first
        const xclip = spawn('xclip', ['-selection', 'clipboard', '-t', 'image/png', '-o'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        const writeStream = fs.createWriteStream(imagePath);
        xclip.stdout.pipe(writeStream);
        
        xclip.on('close', (code: number) => {
            writeStream.close();
            const fileExists = fs.existsSync(imagePath);
            const fileSize = fileExists ? fs.statSync(imagePath).size : 0;
            
            if (code === 0 && fileExists && fileSize > 0) {
                resolve(true);
            } else {
                // Try wl-clipboard as fallback
                tryWlClipboard(imagePath, resolve);
            }
        });
        
        xclip.on('error', () => {
            writeStream.close();
            tryWlClipboard(imagePath, resolve);
        });
    });
}

function tryWlClipboard(imagePath: string, resolve: (value: boolean) => void) {
    const { spawn } = require('child_process');
    
    const wlPaste = spawn('wl-paste', ['--type', 'image/png'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const writeStream = fs.createWriteStream(imagePath);
    wlPaste.stdout.pipe(writeStream);
    
    wlPaste.on('close', (code: number) => {
        writeStream.close();
        resolve(code === 0 && fs.existsSync(imagePath) && fs.statSync(imagePath).size > 0);
    });
    
    wlPaste.on('error', () => {
        writeStream.close();
        resolve(false);
    });
}

async function saveClipboardImageMac(imagePath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        
        const pngpaste = spawn('pngpaste', [imagePath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        pngpaste.on('close', (code: number) => {
            resolve(code === 0 && fs.existsSync(imagePath));
        });
        
        pngpaste.on('error', () => {
            resolve(false);
        });
    });
}

function scheduleFileDeletion(filePath: string) {
    // Cancel existing timeout if file already tracked
    if (tempFiles.has(filePath)) {
        clearTimeout(tempFiles.get(filePath)!);
    }
    
    // Schedule deletion after 10 minutes (600,000 ms)
    const timeout = setTimeout(() => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            // Silently handle deletion errors
        } finally {
            tempFiles.delete(filePath);
        }
    }, 10 * 60 * 1000); // 10 minutes
    
    tempFiles.set(filePath, timeout);
}

async function checkCommand(command: string): Promise<boolean> {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        const which = spawn('which', [command], { stdio: 'pipe' });
        
        which.on('close', (code: number) => {
            resolve(code === 0);
        });
        
        which.on('error', () => {
            resolve(false);
        });
    });
}

export function deactivate() {
    // Cleanup handled in activate function's disposal
}