@echo off
chcp 65001
set folder_path=tmp/s01/assets
set replace_path=data

if exist "%folder_path%" (
    echo %folder_path%存在
) else (
    echo 【ERROR】%folder_path%不存在
    set FAIL=1
    goto end
)

if exist "%replace_path%" (
    echo %replace_path%存在
) else (
    echo 【ERROR】%replace_path%不存在
    set FAIL=1
    goto end
)

echo "删除 %folder_path%"
rd /s /q "%folder_path%"
echo "复制 %replace_path% %folder_path%"
xcopy /y /e /s /q /i "%replace_path%" "%folder_path%"

:end
if "%1"=="0" (
    echo no pause
) else (
    pause
)

if defined FAIL (
    EXIT /B 1
)
