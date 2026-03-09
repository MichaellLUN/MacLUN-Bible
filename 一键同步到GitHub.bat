@echo off
chcp 65001 > nul
echo ======================================
echo Syncing code to GitHub...
echo ======================================

cd /d D:\Code\bible

echo 1. Pulling latest code from GitHub...
git pull origin master

echo 2. Adding all modified files...
git add .

echo 3. Committing changes...
git commit -m "Update from Bangkok: %date% %time%"

echo 4. Pushing to GitHub...
git push -u origin master

echo ======================================
echo Sync completed!
echo Now you can run '一键更新3个网站.bat'
echo ======================================
pause