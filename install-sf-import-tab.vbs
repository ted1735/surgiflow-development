Option Explicit

Const TARGET_WORKBOOK = "SURGIFLOW__ORL_READMISSIONS__wNotes_GMLOS_LLM_20260808_1441.xlsx"
Const PREP_FILE = "SF-Import-A1-prepare.py"
Const OUTPUT_FILE = "SF-Import-A3-output.py"

Dim excelApp, wb, targetWb, ws, fso, basePath
Dim prepCode, outputCode, prepFormula, outputFormula

Function ReadUtf8(path)
  Dim stream
  Set stream = CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile path
  ReadUtf8 = stream.ReadText
  stream.Close
End Function

Function PythonFormula(code, returnType)
  PythonFormula = "=PY(""" & Replace(code, """", """""") & """," & returnType & ")"
End Function

Set fso = CreateObject("Scripting.FileSystemObject")
basePath = fso.GetParentFolderName(WScript.ScriptFullName)
prepCode = ReadUtf8(fso.BuildPath(basePath, PREP_FILE))
outputCode = ReadUtf8(fso.BuildPath(basePath, OUTPUT_FILE))
prepFormula = PythonFormula(prepCode, 0)
outputFormula = PythonFormula(outputCode, 0)

WScript.Echo "A1 formula characters=" & Len(prepFormula)
WScript.Echo "A3 formula characters=" & Len(outputFormula)
If Len(prepFormula) > 8192 Or Len(outputFormula) > 8192 Then
  WScript.Echo "ERROR: A generated formula exceeds Excel's 8192-character limit."
  WScript.Quit 2
End If

On Error Resume Next
Set excelApp = GetObject(, "Excel.Application")
If Err.Number <> 0 Then
  WScript.Echo "ERROR: Could not attach to the open Excel application: " & Err.Description
  WScript.Quit 3
End If
On Error GoTo 0

For Each wb In excelApp.Workbooks
  If StrComp(wb.Name, TARGET_WORKBOOK, vbTextCompare) = 0 Then
    Set targetWb = wb
    Exit For
  End If
Next

If targetWb Is Nothing Then
  WScript.Echo "ERROR: The target workbook is not open."
  WScript.Quit 4
End If

On Error Resume Next
Set ws = targetWb.Worksheets("SF-Import")
On Error GoTo 0
If ws Is Nothing Then
  Set ws = targetWb.Worksheets.Add(, targetWb.Worksheets(targetWb.Worksheets.Count))
  ws.Name = "SF-Import"
End If

' Clear only the setup/output area.  The appts source table is untouched.
ws.Range("A1:C40").Clear
ws.Range("A1").Formula2 = prepFormula
ws.Range("A2").Value = "Automated SharePoint import - do not edit A1 or A3. Verify READY, then follow the copy instructions below."
ws.Range("A3").Formula2 = outputFormula

ws.Columns("A").ColumnWidth = 28
ws.Columns("B").ColumnWidth = 42
ws.Columns("C").ColumnWidth = 80
ws.Range("A2:C2").Font.Bold = True
ws.Range("A2:C2").Interior.Color = RGB(217, 225, 242)
ws.Range("A3:C40").VerticalAlignment = -4160
ws.Range("C3:C40").WrapText = False
ws.Tab.Color = RGB(112, 173, 71)
ws.Activate
ws.Range("A1").Select

targetWb.Save
WScript.Echo "SUCCESS: SF-Import was installed and the workbook was saved."
