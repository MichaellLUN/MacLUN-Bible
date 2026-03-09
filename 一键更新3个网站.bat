@echo off
chcp 65001 > nul
echo ======================================
echo Updating 3 local websites...
echo ======================================

:: 精准进入代码文件夹（曼谷环境适配）
cd /d D:\Code\bible

:: 步骤1：停止正在运行的3个网站容器
echo 1. Stopping 3 website containers...
docker-compose down

:: 步骤2：拉取GitHub最新代码（master分支）
echo 2. Pulling latest code from GitHub (master)...
git pull origin master

:: 步骤3：重建镜像+重启3个网站（适配泰国网络）
echo 3. Restarting 3 websites with latest code...
docker-compose up -d --build --pull always

:: 显示访问地址
echo ======================================
echo 3 Websites Updated Successfully!
echo Visit:
echo Website 1: http://localhost:8081
echo Website 2: http://localhost:8082
echo Website 3: http://localhost:8083
echo ======================================
pause