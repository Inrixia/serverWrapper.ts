@echo off
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe -command "$Host.UI.RawUI.WindowTitle = 'Spookelton Wrapper | Loading Bootwrapper...'"
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe write-host -foregroundcolor Green %2 "Ugh... 5 More Hours"
PING localhost -n 2 >NUL

:Y
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe write-host -foregroundcolor Green %2 "Restarting in 3..."
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe -command "$Host.UI.RawUI.WindowTitle = 'Spookelton Wrapper | Server Starting in 3...'"
PING localhost -n 1 >NUL

%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe write-host -foregroundcolor Green %2 "Restarting in 2..."
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe -command "$Host.UI.RawUI.WindowTitle = 'Spookelton Wrapper | Server Starting in 2...'"
PING localhost -n 1 >NUL

%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe write-host -foregroundcolor Green %2 "Restarting in 1..."
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe -command "$Host.UI.RawUI.WindowTitle = 'Spookelton Wrapper | Server Starting in 1...'"
PING localhost -n 1 >NUL

node serverWrapper.js

%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe write-host -foregroundcolor Red %1 "Server Has Stopped or Crashed!"
PING localhost -n 2 >NUL

goto :Y