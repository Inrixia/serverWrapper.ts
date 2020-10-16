:Y
%Windir%\System32\WindowsPowerShell\v1.0\Powershell.exe -command "$Host.UI.RawUI.WindowTitle = 'FlynnIsGay 1.12'"
java -server -Xms12G -Xmx12G -XX:+UseG1GC -Dsun.rmi.dgc.server.gcInterval=2147483646 -XX:+UnlockExperimentalVMOptions -XX:MaxGCPauseMillis=50 -XX:+DisableExplicitGC -XX:TargetSurvivorRatio=90 -XX:G1NewSizePercent=30 -XX:G1HeapRegionSize=32M -XX:G1MaxNewSizePercent=80 -XX:G1MixedGCLiveThresholdPercent=35 -XX:+ParallelRefProcEnabled -XX:ParallelGCThreads=8 -XX:ConcGCThreads=8 -jar forge-1.12.2-14.23.5.2814-universal.jar nogui -dfml.queryresult=confirm
goto Y