Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run """" & scriptDir & "\run_backend.bat""", 0, False
WshShell.Run """" & scriptDir & "\run_frontend.bat""", 0, False
WScript.Sleep 3500
WshShell.Run "http://localhost:5173"
Set WshShell = Nothing
Set fso = Nothing
