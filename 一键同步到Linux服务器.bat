@echo off
chcp 65001 > nul
echo ==============================
echo 同步代码到Linux服务器+更新域名
echo ==============================

:: 1. 本地代码同步到GitHub
cd /d D:\Code\bible
git pull origin master
git add .
git commit -m "更新代码：%date% %time%"
git push origin master

:: 2. 远程登录Linux服务器，拉取代码+重启容器
:: 替换：你的服务器IP、仓库名
echo 正在更新服务器...
ssh ubuntu@82.157.67.208 "cd /root/code/你的仓库名 && sudo git pull origin master && sudo docker-compose down && sudo docker-compose up -d --build"

echo ==============================
echo 同步完成！访问：www.你的域名.com
echo ==============================
pause