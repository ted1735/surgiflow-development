# 1. Create-ConsolidatedColumns.js
$jsPath = "projects/surgiflow/Create-ConsolidatedColumns.js"
if (Test-Path $jsPath) {
    $content = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)
    $regex = [regex]'"DisplayName":\s*"([^\w\s\d\-_&/\\\(\)\[\]'',\.:;]+)\s+(.*?)\s+([^\w\s\d\-_&/\\\(\)\[\]'',\.:;]+)"'
    $newContent = $regex.Replace($content, {
        param($match)
        $p1 = $match.Groups[1].Value
        $p2 = $match.Groups[2].Value
        $p3 = $match.Groups[3].Value
        $alreadyDoubled = $false
        if ($p1.Length -gt 1 -and $p1.Length % 2 -eq 0) {
            $halfLen = $p1.Length / 2
            $firstHalf = $p1.Substring(0, $halfLen)
            $secondHalf = $p1.Substring($halfLen)
            if ($firstHalf -eq $secondHalf) { $alreadyDoubled = $true }
        }
        $newP1 = if ($alreadyDoubled) { $p1 } else { $p1 + $p1 }
        $newP3 = if ($alreadyDoubled) { $p3 } else { $p3 + $p3 }
        return '"DisplayName": "' + $newP1 + ' ' + $p2 + ' ' + $newP3 + '"'
    })
    [System.IO.File]::WriteAllText($jsPath, $newContent, [System.Text.Encoding]::UTF8)
}

# 2. SF Master Live Data Fields and Choices.json
$jsonPath = "projects/surgiflow/schemas/SF Master Live Data Fields and Choices.json"
if (Test-Path $jsonPath) {
    $content = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
    $regex = [regex]'"Title":\s*"([^\w\s\d\-_&/\\\(\)\[\]'',\.:;]+)\s+(.*?)\s+([^\w\s\d\-_&/\\\(\)\[\]'',\.:;]+)"'
    $newContent = $regex.Replace($content, {
        param($match)
        $p1 = $match.Groups[1].Value
        $p2 = $match.Groups[2].Value
        $p3 = $match.Groups[3].Value
        $alreadyDoubled = $false
        if ($p1.Length -gt 1 -and $p1.Length % 2 -eq 0) {
            $halfLen = $p1.Length / 2
            $firstHalf = $p1.Substring(0, $halfLen)
            $secondHalf = $p1.Substring($halfLen)
            if ($firstHalf -eq $secondHalf) { $alreadyDoubled = $true }
        }
        $newP1 = if ($alreadyDoubled) { $p1 } else { $p1 + $p1 }
        $newP3 = if ($alreadyDoubled) { $p3 } else { $p3 + $p3 }
        return '"Title": "' + $newP1 + ' ' + $p2 + ' ' + $newP3 + '"'
    })
    [System.IO.File]::WriteAllText($jsonPath, $newContent, [System.Text.Encoding]::UTF8)
}

# 3. SurgiFlow_Consolidated_Schema.csv
$csvPath = "projects/surgiflow/schemas/SurgiFlow_Consolidated_Schema.csv"
if (Test-Path $csvPath) {
    $content = [System.IO.File]::ReadAllText($csvPath, [System.Text.Encoding]::UTF8)
    $regex = [regex]'(?m)^"?([^\w\s\d\-_&/\\\(\)\[\]'',\.:;]+)\s+(.*?)\s+([^\w\s\d\-_&/\\\(\)\[\]'',\.:;]+)"?,'
    $newContent = $regex.Replace($content, {
        param($match)
        $p1 = $match.Groups[1].Value
        $p2 = $match.Groups[2].Value
        $p3 = $match.Groups[3].Value
        $alreadyDoubled = $false
        if ($p1.Length -gt 1 -and $p1.Length % 2 -eq 0) {
            $halfLen = $p1.Length / 2
            $firstHalf = $p1.Substring(0, $halfLen)
            $secondHalf = $p1.Substring($halfLen)
            if ($firstHalf -eq $secondHalf) { $alreadyDoubled = $true }
        }
        $newP1 = if ($alreadyDoubled) { $p1 } else { $p1 + $p1 }
        $newP3 = if ($alreadyDoubled) { $p3 } else { $p3 + $p3 }
        return '"' + $newP1 + ' ' + $p2 + ' ' + $newP3 + '",'
    })
    [System.IO.File]::WriteAllText($csvPath, $newContent, [System.Text.Encoding]::UTF8)
}

Write-Output "Successfully updated emoji counts in schema configuration files."
