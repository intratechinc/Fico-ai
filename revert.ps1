# Revert to Remote Script
# This script will overwrite local files with the versions from the main branch of the GitHub repository.

# 1. Announce the start
Write-Host "--- Starting revert process. Fetching files from GitHub... ---" -ForegroundColor Yellow

# 2. Overwrite local files with remote versions
Invoke-WebRequest -Uri https://raw.githubusercontent.com/intratechinc/Fico-ai/main/index.html -OutFile index.html
Invoke-WebRequest -Uri https://raw.githubusercontent.com/intratechinc/Fico-ai/main/App.tsx -OutFile App.tsx
Invoke-WebRequest -Uri https://raw.githubusercontent.com/intratechinc/Fico-ai/main/components/pages/Simulator.tsx -OutFile components/pages/Simulator.tsx
Invoke-WebRequest -Uri https://raw.githubusercontent.com/intratechinc/Fico-ai/main/components/GoalCard.tsx -OutFile components/GoalCard.tsx
Invoke-WebRequest -Uri https://raw.githubusercontent.com/intratechinc/Fico-ai/main/components/SimulatorModal.tsx -OutFile components/SimulatorModal.tsx
Write-Host "File replacement complete." -ForegroundColor Green

# 3. Delete obsolete files created during refactoring
Write-Host "Deleting obsolete files from failed refactoring..." -ForegroundColor Yellow
Remove-Item -Path "components/WelcomeScreen.tsx", "components/ResultsScreen.tsx", "reset.ps1", "index.css", "postcss.config.js", "tailwind.config.js" -ErrorAction SilentlyContinue
Write-Host "Obsolete files deleted." -ForegroundColor Green

# 4. Announce completion
Write-Host "--- Revert to Remote Complete ---" -ForegroundColor Green
Write-Host "Your project has been reverted to the original state from the GitHub repository." -ForegroundColor Cyan
Write-Host "You should now deploy this version to Firebase Hosting." -ForegroundColor Cyan
