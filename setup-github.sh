#!/bin/bash

# Bash script to set up GitHub repository
# Make sure you have GitHub CLI installed: https://cli.github.com/

echo "Setting up GitHub repository..."

# Check if git user is configured
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    echo "Git user not configured. Please run:"
    echo "  git config --global user.name 'Your Name'"
    echo "  git config --global user.email 'your.email@example.com'"
    exit 1
fi

echo "Git user: $GIT_USER <$GIT_EMAIL>"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not found. Please install from: https://cli.github.com/"
    echo ""
    echo "Or create the repo manually:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'flat_roof_v3'"
    echo "3. Run: git remote add origin https://github.com/YOUR_USERNAME/flat_roof_v3.git"
    echo "4. Run: git push -u origin main"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Staging and committing changes..."
    git add .
    git commit -m "Initial commit: React app with Tailwind CSS setup"
fi

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo "Remote 'origin' already exists. Skipping repository creation."
    echo "To push, run: git push -u origin main"
    exit 0
fi

# Create GitHub repository
echo "Creating GitHub repository..."
gh repo create flat_roof_v3 --public --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo "Successfully created and pushed to GitHub!"
    echo "Repository URL: https://github.com/$(git config user.name)/flat_roof_v3"
else
    echo "Failed to create repository. Please check the error above."
fi

