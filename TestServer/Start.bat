:Y
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe -command "$Host.UI.RawUI.WindowTitle = 'FlynnIsGay 1.12'"
java -server -XX:+UseG1GC -Dsun.rmi.dgc.server.gcInterval=2147483646 -XX:+UnlockExperimentalVMOptions -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M -XX:ParallelGCThreads=4 -Xms512M -Xmx1G -jar minecraft_server.1.12.jar nogui -dfml.queryresult=confirm
goto Y
