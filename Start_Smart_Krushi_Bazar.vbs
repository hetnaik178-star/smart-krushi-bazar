Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""d:\vc.het naik\smart-krushi-bazar\start_servers.ps1""", 0, False
Set WshShell = Nothing
