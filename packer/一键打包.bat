@echo off
chcp 65001

CALL S00清除临时文件夹.bat 0
CALL S01拆包.bat 0
if %errorlevel% neq 0 (
    echo S01失败，请检查后重试。
    pause
    exit \b 1
)
CALL S02替换asset.bat 0
if %errorlevel% neq 0 (
    echo S02失败，请检查后重试。
    pause
    exit \b 1
)
CALL S03装包.bat 0
CALL S04字节对准.bat 0
CALL S05签名.bat 0
CALL S06输出.bat 0