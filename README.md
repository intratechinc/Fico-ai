<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/11iFSzLq3lDPCNefxYmLQKvj_AK_xDMWz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Advanced Troubleshooting: Level Zero Reset

If you encounter persistent build failures or styling issues that are not resolved by standard commands, you may need to perform a "Level Zero Reset." This is a scorched-earth approach that clears all local caches and rebuilds the project from a completely clean state.

### 1. Create the Reset Script

Create a new file in the root of the project named `reset.ps1` and paste the following content into it:

```powershell
# Level Zero Reset Script
# This script performs a complete reset of the project environment to resolve stubborn build issues.

# 1. Announce the start
Write-Host "--- Starting Level Zero Reset ---" -ForegroundColor Yellow

# 2. Manually destroy the Vite cache if it exists
if (Test-Path "node_modules/.vite") {
    Write-Host "Destroying Vite cache..."
    Remove-Item -Recurse -Force "node_modules/.vite"
} else {
    Write-Host "Vite cache not found, skipping."
}

# 3. Destroy all installed packages and lockfile
Write-Host "Destroying all installed packages..."
Remove-Item -Recurse -Force "node_modules", "package-lock.json" -ErrorAction SilentlyContinue

# 4. Force clear the global npm cache
Write-Host "Clearing global NPM cache..."
npm cache clean --force

# 5. Reinstall everything from scratch
Write-Host "Reinstalling all dependencies from scratch..."
npm install

# 6. Run the final build
Write-Host "Running the final production build..."
npm run build

# 7. Announce completion
Write-Host "--- Level Zero Reset Complete ---" -ForegroundColor Green
Write-Host "You can now deploy the application by running:"
Write-Host "firebase deploy --only hosting --project ai-fico-simulator" -ForegroundColor Cyan
```

### 2. Run the Script

Once the file is saved, execute the following commands in your PowerShell terminal:

**Allow script execution (only needs to be run once per session):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

**Run the reset:**
```powershell
./reset.ps1
```

The script will handle all the cleaning and rebuilding. When it's done, you can proceed with the final deployment command as prompted.