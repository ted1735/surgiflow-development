Option Explicit

Dim excelApp, wb, ws, formulaText
On Error Resume Next
Set excelApp = GetObject(, "Excel.Application")
If Err.Number <> 0 Then
  WScript.Echo "ERROR: Could not attach to an open Excel instance: " & Err.Description
  WScript.Quit 1
End If
On Error GoTo 0

For Each wb In excelApp.Workbooks
  WScript.Echo "WORKBOOK=" & wb.Name & "|PATH=" & wb.FullName
  For Each ws In wb.Worksheets
    WScript.Echo "  SHEET=" & ws.Name
  Next
  On Error Resume Next
  Set ws = wb.Worksheets("SF-Import")
  If Err.Number = 0 Then
    formulaText = ws.Range("A1").Formula2
    WScript.Echo "  SF-A1-LEN=" & Len(formulaText) & "|FORMULA=" & Left(formulaText, 180)
    formulaText = ws.Range("A3").Formula2
    WScript.Echo "  SF-A3-LEN=" & Len(formulaText) & "|FORMULA=" & Left(formulaText, 180)
    WScript.Echo "  VALUES=A1:" & CStr(ws.Range("A1").Text) & "|A3:" & CStr(ws.Range("A3").Text) & "|A4:" & CStr(ws.Range("A4").Text) & "|B4:" & CStr(ws.Range("B4").Text)
  End If
  Err.Clear
  On Error GoTo 0
Next
