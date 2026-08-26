[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory)] [string] $SiteUrl,
  [string] $ListName = 'SurgiFlow Master',
  [ValidateSet('Provision','Validate','Enforce')] [string] $Phase = 'Provision'
)

$ErrorActionPreference = 'Stop'
Connect-PnPOnline -Url $SiteUrl -Interactive

if ($Phase -eq 'Provision') {
  $csn = Get-PnPField -List $ListName -Identity 'CSN' -ErrorAction SilentlyContinue
  if (-not $csn -and $PSCmdlet.ShouldProcess("$ListName.CSN", 'Create optional indexed number field')) {
    Add-PnPField -List $ListName -DisplayName 'CSN' -InternalName 'CSN' -Type Number -AddToDefaultView
  }
  if ($PSCmdlet.ShouldProcess("$ListName.CSN", 'Create index')) {
    Set-PnPField -List $ListName -Identity 'CSN' -Values @{ Indexed = $true; Required = $false }
  }
  if ($PSCmdlet.ShouldProcess("$ListName.Status", 'Reconcile approved choices')) {
    Set-PnPField -List $ListName -Identity 'Status' -Values @{
      Choices = @('Progressing On Schedule','Not Improving','Ready for DC','Discharged','Sent to ICU')
      DefaultValue = 'Progressing On Schedule'
    }
  }
  Write-Host 'Provisioning complete. Backfill CSN from the Epic/census feed, then run -Phase Validate.'
  return
}

$items = Get-PnPListItem -List $ListName -PageSize 2000 -Fields 'ID','MRN','CSN'
$missing = $items | Where-Object { [string]::IsNullOrWhiteSpace([string]$_['CSN']) }
$duplicates = $items | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_['MRN']) -and -not [string]::IsNullOrWhiteSpace([string]$_['CSN']) } |
  Group-Object { "$(($_['MRN']).ToString().Trim())|$(($_['CSN']).ToString().Trim())" } | Where-Object Count -gt 1

Write-Host "Items: $($items.Count); missing CSN: $($missing.Count); duplicate MRN + CSN pairs: $($duplicates.Count)"
if ($missing.Count) { $missing | Select-Object -ExpandProperty Id | ForEach-Object { Write-Warning "Missing CSN on item $_" } }
if ($duplicates.Count) { $duplicates | ForEach-Object { Write-Warning "Duplicate encounter $($_.Name) on $($_.Group.Id -join ', ')" } }
if ($missing.Count -or $duplicates.Count) { throw 'Encounter validation failed. Remediate before making CSN required.' }

if ($Phase -eq 'Enforce' -and $PSCmdlet.ShouldProcess("$ListName.CSN", 'Make field required after successful validation')) {
  Set-PnPField -List $ListName -Identity 'CSN' -Values @{ Indexed = $true; Required = $true }
  Write-Host 'CSN is now required and indexed.'
}
