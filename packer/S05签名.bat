@echo off
chcp 65001
set inApk=tmp/s04.apk
set outApk=tmp/s05.apk

CALL %~dp0apksigner.bat sign --ks qhhz230608.jks --ks-key-alias key0 --ks-pass pass:1q2w3e4r5t --v3-signing-enabled false --in %inApk% --out %outApk%
echo "sign suc"

:end
if "%1"=="0" (
    echo no pause
) else (
    pause
)

if defined FAIL (
    EXIT /B 1
)
