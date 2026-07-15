# Rebuild Git History into exactly 15 clean commits
# Script: rebuild_history.ps1

$ErrorActionPreference = "Stop"

# Terminate any active node or git processes to avoid locking
Write-Host "Terminating node/git processes..."
Get-Process -Name git, node -ErrorAction SilentlyContinue | Stop-Process -Force

# Define backup paths outside of the git workspace to prevent accidental staging/committing of secrets
$backendEnvBackup = "c:\Users\ADIL\.gemini\antigravity\scratch\backend_env_backup"
$serverEnvBackup = "c:\Users\ADIL\.gemini\antigravity\scratch\server_env_backup"

# Backup active .env files
Write-Host "Backing up current .env files..."
if (Test-Path "backend/.env") {
    Copy-Item "backend/.env" $backendEnvBackup -Force
    Write-Host "Backed up backend/.env to $backendEnvBackup"
}
if (Test-Path "server/.env") {
    Copy-Item "server/.env" $serverEnvBackup -Force
    Write-Host "Backed up server/.env to $serverEnvBackup"
}

# Rename server/node_modules to protect it from Git actions
$nodeModulesPath = "server/node_modules"
$nodeModulesTempPath = "server/node_modules_temp"
if (Test-Path $nodeModulesPath) {
    Write-Host "Renaming server/node_modules to server/node_modules_temp to protect active modules..."
    if (Test-Path $nodeModulesTempPath) {
        Remove-Item $nodeModulesTempPath -Recurse -Force
    }
    Rename-Item -Path $nodeModulesPath -NewName "node_modules_temp"
}

# Define the 15 commits
$commits = @(
    [PSCustomObject]@{
        Hash = "90aebec"
        Date = "2026-07-15T12:00:00+05:30"
        Message = "feat(core): initialize system architecture, database configuration, and authentication framework"
    },
    [PSCustomObject]@{
        Hash = "463c2e1"
        Date = "2026-07-18T12:00:00+05:30"
        Message = "feat(ai-tutor): implement RAG pipeline, text chunker, and OpenAI vector store integration"
    },
    [PSCustomObject]@{
        Hash = "8878be4"
        Date = "2026-07-22T12:00:00+05:30"
        Message = "feat(module-7): implement AI Quiz Generator and Smart Question Bank"
    },
    [PSCustomObject]@{
        Hash = "0754232"
        Date = "2026-07-25T12:00:00+05:30"
        Message = "fix(ui): resolve white screen array parsing, integrate Sidebar & Header in AI Tutor, and unify Dashboard color theme"
    },
    [PSCustomObject]@{
        Hash = "446a385"
        Date = "2026-07-28T12:00:00+05:30"
        Message = "feat(learning): integrate Personalized Learning page and adaptive weak topic detection"
    },
    [PSCustomObject]@{
        Hash = "d779751"
        Date = "2026-08-01T12:00:00+05:30"
        Message = "docs: add presentation report and LaTeX documentation for First Project Evaluation"
    },
    [PSCustomObject]@{
        Hash = "c6c7463"
        Date = "2026-08-05T12:00:00+05:30"
        Message = "docs(assets): add reference text materials and academic cheatsheets for RAG ingestion"
    },
    [PSCustomObject]@{
        Hash = "96cd16b"
        Date = "2026-08-09T12:00:00+05:30"
        Message = "feat(database): update study plan Mongoose models and schema validators"
    },
    [PSCustomObject]@{
        Hash = "a2327a1"
        Date = "2026-08-10T12:00:00+05:30"
        Message = "feat(ai-service): enhance OpenAI service integration and prompt templates for course recommendation"
    },
    [PSCustomObject]@{
        Hash = "8d216f2"
        Date = "2026-08-12T12:00:00+05:30"
        Message = "feat(study-planner): implement algorithmic study plan generator and fallback scheduler"
    },
    [PSCustomObject]@{
        Hash = "8eb2510"
        Date = "2026-08-13T12:00:00+05:30"
        Message = "feat(api): add REST endpoints and controller logic for study plan management"
    },
    [PSCustomObject]@{
        Hash = "883119a"
        Date = "2026-08-14T12:00:00+05:30"
        Message = "feat(seed): expand database seed script with real-world academic curriculum and sample students"
    },
    [PSCustomObject]@{
        Hash = "ea43630"
        Date = "2026-08-15T12:00:00+05:30"
        Message = "feat(ui): update Study Planner components, interactive modal forms, and calendar views"
    },
    [PSCustomObject]@{
        Hash = "89cd3bd"
        Date = "2026-08-16T12:00:00+05:30"
        Message = "docs(presentation): update first evaluation project presentation report and documentation"
    },
    [PSCustomObject]@{
        Hash = "030f45a"
        Date = "2026-08-20T12:00:00+05:30"
        Message = "feat(integration): finalize course faculty updates and verify end-to-end LMS workflow"
    }
)

# Start rebuild process
$tempBranch = "clean-main"

# Clean any existing clean-main branch to start fresh
try {
    git branch -D $tempBranch 2>&1 | Out-Null
} catch {}

# Create a clean orphan branch
Write-Host "Creating orphan branch $tempBranch..."
git checkout --orphan $tempBranch
git reset --hard

# Ensure root .gitignore is present before we start adding anything
# Write standard .gitignore
$gitignoreContent = @"
# Dependencies
node_modules/
**/node_modules/
node_modules_temp/
**/node_modules_temp/

# Environment variables
.env
.env.*
**/.env
**/.env.*
!.env.example
!**/.env.example

# Build outputs
dist/
**/dist/
build/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS / Editor files
.DS_Store
Thumbs.db
.vscode/
.idea/
"@
Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding utf8
git add ".gitignore"

# Rebuild each commit
for ($i = 0; $i -lt $commits.Length; $i++) {
    $commit = $commits[$i]
    $commitNum = $i + 1
    Write-Host "=========================================="
    Write-Host "Processing Commit $commitNum / 15"
    Write-Host "Original Hash: $($commit.Hash)"
    Write-Host "New Date:      $($commit.Date)"
    Write-Host "New Message:   $($commit.Message)"
    Write-Host "=========================================="

    # Read the tree of the target commit into the working directory
    git read-tree -u --reset $($commit.Hash)

    # Remove node_modules and .env from staging area
    git rm -r --cached --ignore-unmatch server/node_modules | Out-Null
    git rm --cached --ignore-unmatch server/.env | Out-Null
    git rm --cached --ignore-unmatch backend/.env | Out-Null

    # Remove newly checked out node_modules from the filesystem so they don't pile up
    if (Test-Path "server/node_modules") {
        Remove-Item "server/node_modules" -Recurse -Force
    }

    # Ensure .gitignore is tracked
    Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding utf8
    git add ".gitignore"

    # Write .env.example files
    $backendEnvExamplePath = "backend/.env.example"
    $serverEnvExamplePath = "server/.env.example"

    $backendEnvExample = @"
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-lms
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=2h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
"@
    Set-Content -Path $backendEnvExamplePath -Value $backendEnvExample -Encoding utf8
    git add $backendEnvExamplePath

    $serverEnvExample = @"
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-lms
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=2h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
"@
    Set-Content -Path $serverEnvExamplePath -Value $serverEnvExample -Encoding utf8
    git add $serverEnvExamplePath

    # Stage all files
    git add -A

    # Final check: make sure node_modules and .env are NOT in the index
    $stagedFiles = git diff --cached --name-only
    $nodeModulesStaged = $stagedFiles | Select-String "node_modules"
    $envStaged = $stagedFiles | Select-String "(^|/)\.env$"

    if ($nodeModulesStaged) {
        Write-Error "CRITICAL: node_modules files are staged! Aborting."
    }
    if ($envStaged) {
        Write-Error "CRITICAL: .env files are staged! Aborting."
    }

    # Set commit environment variables for date and author
    $env:GIT_AUTHOR_DATE = $commit.Date
    $env:GIT_COMMITTER_DATE = $commit.Date

    # Commit the changes
    git commit --author="adilpalachira <adilpalachira2@gmail.com>" -m $commit.Message

    # Clear environment variables
    Remove-Item env:GIT_AUTHOR_DATE
    Remove-Item env:GIT_COMMITTER_DATE
}

# Restore node_modules folder
if (Test-Path $nodeModulesTempPath) {
    Write-Host "Restoring server/node_modules from backup..."
    if (Test-Path $nodeModulesPath) {
        Remove-Item $nodeModulesPath -Recurse -Force
    }
    Rename-Item -Path $nodeModulesTempPath -NewName "node_modules"
}

# Restore the active .env files to the working directory
Write-Host "Restoring current .env files..."
if (Test-Path $backendEnvBackup) {
    Move-Item $backendEnvBackup "backend/.env" -Force
    Write-Host "Restored backend/.env"
}
if (Test-Path $serverEnvBackup) {
    Move-Item $serverEnvBackup "server/.env" -Force
    Write-Host "Restored server/.env"
}

Write-Host "History rebuild completed successfully!"
