# Rename .md files to start with creation date (YYYY-MM-DD-) using git first-commit date.
# Excludes: node_modules, venv, .pytest_cache, Backup_files
$ErrorActionPreference = "Stop"
$root = "c:\Users\Usuario\Documents\GitHub\Cotizador"
Set-Location $root

$getDate = {
    param($relPath)
    $d = git log --follow -1 --format=%ci -- "$relPath" 2>$null
    if ($d) { $d.Substring(0,10) } else { "2026-02-07" }
}

$renamed = @()
$skipped = @()

# Collect project .md files (no node_modules, venv)
$allMd = @()
Get-ChildItem -Path $root -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object { $allMd += $_ }
Get-ChildItem -Path (Join-Path $root "docs") -Recurse -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object { $allMd += $_ }
Get-ChildItem -Path (Join-Path $root "scripts") -Recurse -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object { $allMd += $_ }
Get-ChildItem -Path (Join-Path $root "backend") -Recurse -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object { if ($_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\venv\\") { $allMd += $_ } }
Get-ChildItem -Path (Join-Path $root ".github") -Recurse -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object { $allMd += $_ }
Get-ChildItem -Path (Join-Path $root ".cursorrules") -Recurse -Filter "*.md" -File -ErrorAction SilentlyContinue | ForEach-Object { $allMd += $_ }

foreach ($f in $allMd) {
    $name = $f.Name
    if ($name -match "^\d{4}-\d{2}-\d{2}-") { $skipped += $f.FullName; continue }
    $rel = $f.FullName.Replace("$root\", "").Replace("\", "/")
    $date = & $getDate $rel
    $newName = "${date}-$name"
    $parent = $f.DirectoryName
    $newPath = Join-Path $parent $newName
    if ($newPath -eq $f.FullName) { continue }
    Rename-Item -LiteralPath $f.FullName -NewName $newName -ErrorAction Stop
    $renamed += "$rel -> $date-$name"
}

Write-Output "Renamed: $($renamed.Count)"
$renamed | ForEach-Object { Write-Output $_ }
Write-Output "Skipped (already dated): $($skipped.Count)"
