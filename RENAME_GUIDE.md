# 📁 How to Rename Directory from "app" to "lectra"

## Issue
The directory cannot be renamed while VS Code or development servers have files open/locked.

## Solution - Manual Rename

Follow these steps to rename the root directory:

### Step 1: Close VS Code
1. Save all your files
2. Close VS Code completely
3. Make sure no terminals are running

### Step 2: Stop All Node Processes
In PowerShell or Command Prompt:
```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Or restart your computer to be sure
```

### Step 3: Rename the Directory

#### Option A: Using File Explorer
1. Navigate to `C:\Pra_programming\Projects\`
2. Right-click on the `app` folder
3. Select "Rename"
4. Type `lectra`
5. Press Enter

#### Option B: Using PowerShell
```powershell
# Navigate to parent directory
cd C:\Pra_programming\Projects

# Rename the folder
Rename-Item -Path "app" -NewName "lectra"

# Verify the rename
Get-ChildItem -Directory | Where-Object {$_.Name -eq "lectra"}
```

#### Option C: Using Command Prompt
```cmd
cd C:\Pra_programming\Projects
rename app lectra
dir lectra
```

### Step 4: Reopen in VS Code
1. Open VS Code
2. File → Open Folder
3. Navigate to `C:\Pra_programming\Projects\lectra`
4. Open the folder

### Step 5: Verify Everything Works
```bash
# In VS Code terminal
npm run dev
```

Visit http://localhost:3000 to verify the app works.

---

## Alternative: Keep Current Name

If you prefer to keep the directory name as "app", that's perfectly fine! The application name is already "LECTRA" in all the branding:
- Package name: `lectra`
- Application title: `LECTRA`
- All UI references: `LECTRA` or `Lectra`

The directory name doesn't affect the application itself.

---

## What's Already Updated

✅ Package.json name: `lectra`  
✅ Package.json description: "LECTRA - Your Personal AI Learning Companion"  
✅ All UI branding: `LECTRA` with ⚡  
✅ Logo: `LECTRA` with lightning bolt on E  
✅ All documentation references  

The only thing remaining is the physical directory name, which is cosmetic.
