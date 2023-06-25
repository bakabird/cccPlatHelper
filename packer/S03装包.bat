@echo off
chcp 65001
set folder_path=tmp/s01
set out_Path=tmp/s03.apk

cmd.exe /c apktool.bat b %folder_path% -o %out_Path% < nul

:end
if "%1"=="0" (
    echo no pause
) else (
    pause
)

if defined FAIL (
    EXIT /B 1
)
