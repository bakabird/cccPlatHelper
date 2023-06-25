@echo off
chcp 65001
set folder_path=母包/
echo %folder_path%*.apk

for %%f in (%folder_path%*.apk) do (
    echo %%f
    set apk_path=%%f
    goto outA
)
:outA

if defined apk_path (
    echo %apk_path%
    cmd.exe /c apktool.bat d -f %folder_path%%apk_path% -o ./tmp/s01 < nul
) else (
    echo 【ERROR】no apk in %folder_path%
    set FAIL=1
)

if "%1"=="0" (
    echo no pause
) else (
    pause
)

if defined FAIL (
    EXIT /B 1
)
