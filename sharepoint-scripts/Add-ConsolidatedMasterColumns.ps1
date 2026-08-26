<#
SUMMARY: PowerShell script designed to provision consolidated master tracking columns in the SurgiFlow SharePoint list.
#>
<#
  Add-ConsolidatedMasterColumns.ps1
  Bulk-adds the SurgiFlow Master consolidated columns to a new or existing SharePoint list.
  Idempotent: any column that already exists is skipped.

  ONE-TIME PREREQ (run once in PowerShell):
      Install-Module PnP.PowerShell -Scope CurrentUser
  You must be a Site Owner, or a Member with "Manage Lists" permission.

  RUN:
      .\Add-ConsolidatedMasterColumns.ps1 -SiteUrl "https://ahsonline.sharepoint.com/teams/SurgiFlow" -ListName "SurgiFlow Master"
#>
param(
    [Parameter(Mandatory = $true)][string]$SiteUrl,
    [Parameter(Mandatory = $true)][string]$ListName,
    [string]$CsvPath = (Join-Path $PSScriptRoot "schemas\SurgiFlow_Consolidated_Schema.csv")
)

# Load the 5.1 compatible version explicitly if running in PowerShell 5.x
if ($PSVersionTable.PSVersion.Major -eq 5) {
    Import-Module PnP.PowerShell -RequiredVersion 1.12.0 -ErrorAction SilentlyContinue
}

# Connect using the well-known SharePoint Online Management Shell Client ID to bypass the retired default PnP App
Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId "9bf0edb7-a8df-4b5d-b0ee-ed05bdd360a0"

# Resolve path
$resolvedCsv = Resolve-Path $CsvPath
Write-Host "Loading schema from: $resolvedCsv" -ForegroundColor Cyan

# Import columns and loop
$cols = Import-Csv -Path $resolvedCsv
foreach ($c in $cols) {
    if (Get-PnPField -List $ListName -Identity $c.InternalName -ErrorAction SilentlyContinue) {
        Write-Host "Skip (already exists): $($c.DisplayName)" -ForegroundColor Yellow
        continue
    }
    try {
        switch ($c.FieldType) {
            'Choice' {
                $choices = ($c.Choices -split ';') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
                Add-PnPField -List $ListName -DisplayName $c.DisplayName -InternalName $c.InternalName -Type Choice -Choices $choices -AddToDefaultView | Out-Null
            }
            'MultiChoice' {
                $choices = ($c.Choices -split ';') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
                Add-PnPField -List $ListName -DisplayName $c.DisplayName -InternalName $c.InternalName -Type MultiChoice -Choices $choices -AddToDefaultView | Out-Null
            }
            'Note' {
                Add-PnPField -List $ListName -DisplayName $c.DisplayName -InternalName $c.InternalName -Type Note -AddToDefaultView | Out-Null
            }
            'DateTime' {
                Add-PnPField -List $ListName -DisplayName $c.DisplayName -InternalName $c.InternalName -Type DateTime -AddToDefaultView | Out-Null
                $fmt = if ($c.Choices -eq 'DateOnly') { 0 } else { 1 }
                Set-PnPField -List $ListName -Identity $c.InternalName -Values @{ DisplayFormat = $fmt } | Out-Null
            }
            default {
                Add-PnPField -List $ListName -DisplayName $c.DisplayName -InternalName $c.InternalName -Type Text -AddToDefaultView | Out-Null
            }
        }
        if ($c.Required -eq 'TRUE') {
            Set-PnPField -List $ListName -Identity $c.InternalName -Values @{ Required = $true } | Out-Null
        }
        if ($c.Default -and $c.Default.Trim() -ne '') {
            Set-PnPField -List $ListName -Identity $c.InternalName -Values @{ DefaultValue = $c.Default } | Out-Null
        }
        Write-Host "Added: $($c.DisplayName) [$($c.FieldType)]" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR on $($c.DisplayName): $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host "Finished. Review the list columns; refine any choices/required/defaults in SharePoint." -ForegroundColor Cyan
