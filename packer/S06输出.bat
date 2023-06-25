@echo off
chcp 936
setlocal EnableDelayedExpansion

:: 获取当前时间的日期部分
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
  set "day=%%c"
  set "year=%%a"
  set "month=%%b"
)
:: 获取当前时间的时分秒部分
for /f "tokens=1-3 delims=:." %%a in ("%TIME%") do (
  set "hour=%%a"
  set "minute=%%b"
  set "second=%%c"
)
set apktime=%year%%month%%day%%hour%%minute%
echo %apktime%
copy /Y "tmp\\s05.apk" "dist\\out%apktime%.apk"

:end
if "%1"=="0" (
    echo no pause
) else (
    pause
)

if defined FAIL (
    EXIT /B 1
)
