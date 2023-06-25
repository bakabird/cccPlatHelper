@echo off
set folder_path=tmp
if exist "%folder_path%" (
    rd /s /q tmp
)
if "%1"=="0" (
    echo S00 END
) else (
    pause
)
