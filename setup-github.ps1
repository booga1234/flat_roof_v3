# PowerShell script to set up GitHub repository
# Make sure you have GitHub CLI installed: https://cli.github.com/

Write-Host "Setting up GitHub repository..." -ForegroundColor Green

# Check if git user is configured
$gitUser = git config user.name
$gitEmail = git config user.email

if (-not $gitUser -or -not $gitEmail) {
    Write-Host "Git user not configured. Please run:" -ForegroundColor Yellow
    Write-Host "  git config --global user.name 'Your Name'" -ForegroundColor Yellow
    Write-Host "  git config --global user.email 'your.email@example.com'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Git user: $gitUser <$gitEmail>" -ForegroundColor Cyan

# Check if gh CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "GitHub CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host "Please install GitHub CLI from: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or create the repo manually:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/new" -ForegroundColor Yellow
    Write-Host "2. Create a new repository named 'flat_roof_v3'" -ForegroundColor Yellow
    Write-Host "3. Run: git remote add origin https://github.com/YOUR_USERNAME/flat_roof_v3.git" -ForegroundColor Yellow
    Write-Host "4. Run: git push -u origin main" -ForegroundColor Yellow
    exit 1
}

# Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "Staging and committing changes..." -ForegroundColor Cyan
    git add .
    git commit -m "Initial commit: React app with Tailwind CSS setup"
}

# Check if remote already exists
$remote = git remote get-url origin -ErrorAction SilentlyContinue
if ($remote) {
    Write-Host "Remote 'origin' already exists: $remote" -ForegroundColor Yellow
    Write-Host "Skipping repository creation. To push, run: git push -u origin main" -ForegroundColor Yellow
    exit 0
}

# Create GitHub repository
Write-Host "Creating GitHub repository..." -ForegroundColor Cyan
gh repo create flat_roof_v3 --public --source=. --remote=origin --push

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully created and pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$env:USERNAME/flat_roof_v3" -ForegroundColor Cyan
} else {
    Write-Host "Failed to create repository. Please check the error above." -ForegroundColor Red
}

