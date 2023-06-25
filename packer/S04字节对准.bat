@echo off
chcp 65001
set inApk=tmp/s03.apk
set outApk=tmp/s04.apk
zipalign -v 4 "%inApk%" "%outApk%"

:end
if "%1"=="0" (
    echo no pause
) else (
    pause
)

if defined FAIL (
    EXIT /B 1
)
