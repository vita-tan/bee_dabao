@echo off
chcp 65001 >nul 2>nul
title BeeBrain - NestJS Backend (port 3000)
cd /d "E:\bee_dabao\bee-platform-server"
echo Starting NestJS backend on port 3000...
npx nest start
pause
