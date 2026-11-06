# Converts the local MongoDB Windows service to a single-node replica set, which transactions need.
# Run from the project root, in PowerShell opened as Administrator:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-mongodb-replica-set.ps1
#
# See the change without applying it (no Administrator needed):
#   powershell -ExecutionPolicy Bypass -File scripts\setup-mongodb-replica-set.ps1 -DryRun
#
# This service may hold databases for other projects. They keep working on the same address,
# but they all restart with the service, so stop anything that is writing to MongoDB first.
#
# To undo: copy the backup file this script prints over mongod.cfg, then run Restart-Service MongoDB.
param(
  [string]$ConfigPath = 'C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg',
  [string]$ServiceName = 'MongoDB',
  [string]$ReplicaSetName = 'rs0',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "MongoDB config not found at $ConfigPath. Pass the right path with -ConfigPath."
}

$config = Get-Content -LiteralPath $ConfigPath -Raw

if ($config -match '(?m)^\s*replSetName\s*:') {
  Write-Host 'mongod.cfg already has a replica set name, so it was not changed.'
  $updated = $config
} elseif ($config -match '(?m)^#replication:\s*$') {
  $updated = $config -replace '(?m)^#replication:\s*$', "replication:`r`n  replSetName: $ReplicaSetName`r`n"
} elseif ($config -match '(?m)^replication:\s*$') {
  throw 'mongod.cfg has a replication section without replSetName. Add it by hand, then run this again.'
} else {
  $updated = $config.TrimEnd() + "`r`n`r`nreplication:`r`n  replSetName: $ReplicaSetName`r`n"
}

if ($DryRun) {
  Write-Host '--- mongod.cfg after this script ---'
  Write-Host $updated
  Write-Host '--- No changes made (dry run) ---'
  return
}

$identity = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $identity.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Open PowerShell as Administrator and run this again.'
}

if ($updated -ne $config) {
  $backup = "$ConfigPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item -LiteralPath $ConfigPath -Destination $backup
  Write-Host "Backup saved to $backup"
  [IO.File]::WriteAllText($ConfigPath, $updated)
}

Write-Host "Restarting the $ServiceName service..."
Restart-Service -Name $ServiceName

node scripts/init-replica-set.mjs localhost:27017 $ReplicaSetName
if ($LASTEXITCODE -ne 0) {
  throw 'Could not start the replica set. See the message above.'
}
