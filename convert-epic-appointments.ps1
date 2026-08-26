param(
  [Parameter(Mandatory=$true)] [string] $WorkbookPath,
  [string] $OutputJson = '.\appointment-import-8901-8936.json',
  [string] $OutputJs = '.\appointment-import-8901-8936.js'
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-ZipText($zip, $name) {
  $entry = $zip.GetEntry($name)
  if ($null -eq $entry) { throw "Missing $name in workbook" }
  $reader = [IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Decode-ExcelString([string] $value) {
  return [System.Net.WebUtility]::HtmlDecode($value)
}

function Normalize([object] $value) {
  if ($null -eq $value) { return '' }
  return ([string]$value).Trim()
}

function Get-AppointmentSentences([string] $notes, [string] $nextPcp, [string] $schedTime, [string] $schedStatus, [string] $providers) {
  $joined = Normalize $notes
  $hasConcreteSchedulingSignal = ($joined -match '(?i)appointment|appt|schedul|book.?it|follow.?up|follow up|existing appts|upcoming appts')
  if (!$hasConcreteSchedulingSignal) { return '' }
  # Care Navigation Notes is the authoritative narrative. Do not append AD/AE/AG:
  # those export fields contain workflow timestamps/status/provider rosters, not the
  # appointment text itself, and can create misleading values in Appointment Detail.
  return $joined
}

$resolvedWorkbook = (Resolve-Path -LiteralPath $WorkbookPath).Path
$workingCopy = Join-Path ([IO.Path]::GetTempPath()) ("surgiflow-" + [guid]::NewGuid().ToString() + '.xlsx')
Copy-Item -LiteralPath $resolvedWorkbook -Destination $workingCopy -Force
$zip = [System.IO.Compression.ZipFile]::OpenRead($workingCopy)
try {
  $sharedText = Read-ZipText $zip 'xl/sharedStrings.xml'
  $sharedMatches = [regex]::Matches($sharedText, '<si>(.*?)</si>', [Text.RegularExpressions.RegexOptions]::Singleline)
  $shared = New-Object System.Collections.Generic.List[string]
  foreach ($m in $sharedMatches) {
    $textParts = [regex]::Matches($m.Groups[1].Value, '<t[^>]*>(.*?)</t>', [Text.RegularExpressions.RegexOptions]::Singleline)
    $shared.Add((Decode-ExcelString (($textParts | ForEach-Object { $_.Groups[1].Value }) -join '')))
  }
  $sheet = Read-ZipText $zip 'xl/worksheets/sheet1.xml'
  $rowObjects = New-Object System.Collections.Generic.List[object]
  foreach ($rowMatch in [regex]::Matches($sheet, '<row r="(\d+)".*?</row>', [Text.RegularExpressions.RegexOptions]::Singleline)) {
    $row = @{}
    foreach ($cell in [regex]::Matches($rowMatch.Value, '<c r="([A-Z]+\d+)"([^>]*)>(.*?)</c>', [Text.RegularExpressions.RegexOptions]::Singleline)) {
      $column = $cell.Groups[1].Value -replace '\d',''
      $attrs = $cell.Groups[2].Value
      $inner = $cell.Groups[3].Value
      $v = [regex]::Match($inner, '<v>(.*?)</v>', [Text.RegularExpressions.RegexOptions]::Singleline)
      if (!$v.Success) { continue }
      $value = $v.Groups[1].Value
      if ($attrs -match 't="s"' -and $value -ne '') { $value = $shared[[int]$value] }
      $row[$column] = Decode-ExcelString $value
    }
    if ($row.ContainsKey('B') -and $row['B'] -match '^\s*(89(?:0[1-9]|1[0-9]|2[0-9]|3[0-6]))\b') {
      $room = $Matches[1]
      $detail = Get-AppointmentSentences $row['AH'] $row['AC'] $row['AD'] $row['AE'] $row['AG']
      $skip = ''
      if (!$detail) { $skip = 'No appointment-specific content found in Care Navigation Notes or structured follow-up fields.' }
      elseif ($detail -match '(?i)out of scope|no scheduling needs|scheduling assistance is not indicated') { $skip = 'Source explicitly says outpatient scheduling is out of scope.' }
      $rowObjects.Add([ordered]@{
        room = $room
        roomAndBed = (Normalize $row['B'])
        name = (Normalize $row['C'])
        patientName = (Normalize $row['C'])
        csn = (Normalize $row['D'])
        mrn = (Normalize $row['E'])
        attendingMD = (Normalize $row['G'])
        readmissionRiskLevel = (Normalize $row['H'])
        dispo = (Normalize $row['N'])
        edd = (Normalize $row['J'])
        age = (Normalize $row['U'])
        los = (Normalize $row['AA'])
        fallRisk = (Normalize $row['AQ'])
        braden = (Normalize $row['AR'])
        admitReason = (Normalize $row['AU'])
        appointmentDetail = $detail
        sourceStatus = (Normalize $row['AI'])
        sourceProviders = (Normalize $row['AG'])
        nextPcpVisit = (Normalize $row['AC'])
        rawCareNavigationNotes = (Normalize $row['AH'])
        skipReason = $skip
      })
    }
  }
  $payload = [ordered]@{
    schemaVersion = '1.0'
    source = [IO.Path]::GetFileName($WorkbookPath)
    asOf = (Get-Date).ToString('o')
    scope = [ordered]@{ roomMin = 8901; roomMax = 8936 }
    rows = @($rowObjects | ForEach-Object { $_ })
  }
  $json = $payload | ConvertTo-Json -Depth 8
  Set-Content -LiteralPath $OutputJson -Value $json -Encoding UTF8
  Set-Content -LiteralPath $OutputJs -Value ("window.SURGIPLOW_APPOINTMENT_IMPORT = $json;") -Encoding UTF8
  Write-Output "Wrote $($rowObjects.Count) scoped rows to $OutputJson and $OutputJs"
} finally {
  if ($null -ne $zip) { $zip.Dispose() }
  if (Test-Path -LiteralPath $workingCopy) { Remove-Item -LiteralPath $workingCopy -Force }
}
