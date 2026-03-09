@echo off
chcp 65001 > nul
echo ==============================
echo 曼谷→国内服务器 一键部署脚本
echo （压缩传输+自动解压+启动容器）
echo ==============================

:: 1. 定义服务器信息（替换成你的）
set SERVER_IP=82.157.67.208
set SERVER_USER=ubuntu
set LOCAL_CODE_PATH=D:\code\bible
set SERVER_CODE_PATH=~/code/bible

:: 2. 进入代码目录，压缩文件（排除大文件/无用文件）
echo 正在压缩代码...
cd /d %LOCAL_CODE_PATH%
cd ..
if exist bible_deploy.zip del bible_deploy.zip
zip -r bible_deploy.zip bible -x "bible/node_modules/*" "bible/.git/*" "bible/.DS_Store"

:: 3. 上传压缩包到服务器（比传零散文件快10倍）
echo 正在上传压缩包（已压缩，速度更快）...
scp bible_deploy.zip %SERVER_USER%@%SERVER_IP%:~/code/

:: 4. 远程登录服务器，解压+启动容器
echo 正在服务器解压并启动容器...
ssh %SERVER_USER%@%SERVER_IP% ^
"cd ~/code && ^
sudo apt install unzip -y > /dev/null 2>&1 && ^
rm -rf %SERVER_CODE_PATH% && ^
unzip -q bible_deploy.zip -d . && ^
cd %SERVER_CODE_PATH% && ^
sudo docker-compose down && ^
sudo docker-compose up -d --build"

:: 5. 清理临时文件
echo 清理临时文件...
del bible_deploy.zip

echo ==============================
echo 部署完成！访问：http://%SERVER_IP%
echo ==============================
pause