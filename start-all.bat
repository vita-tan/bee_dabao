@echo off
echo === Starting MySQL ===
start "" /min "D:\Program Files\mysql-9.7.0-winx64\mysql-9.7.0-winx64\bin\mysqld.exe" --defaults-file="D:\Program Files\mysql-9.7.0-winx64\mysql-9.7.0-winx64\my.ini"

echo === Starting NestJS Backend (port 3000) ===
start "" /min cmd /c "cd /d E:\蜂产业大脑南浦溪\bee-platform-server && npx nest start"

echo === Starting Admin Panel (port 5173) ===
start "" /min cmd /c "cd /d E:\蜂产业大脑南浦溪\bee-admin && npx vite --port 5173 --host"

echo === Starting DataScreen (port 4174) ===
start "" /min cmd /c "cd /d E:\蜂产业大脑南浦溪\bee-datascreen && npx vite preview --port 4174 --host"

echo === Starting Trace H5 (port 4175) ===
start "" /min cmd /c "cd /d E:\蜂产业大脑南浦溪\bee-trace-h5 && npx vite preview --port 4175 --host"

echo === Starting MiniApp H5 (port 4176) ===
start "" /min cmd /c "cd /d E:\蜂产业大脑南浦溪\bee-miniapp && npx vite dev --port 4176 --host"

echo.
echo === All services starting... waiting 10s ===
ping -n 11 127.0.0.1 >nul

echo.
echo === Port Check ===
netstat -ano | findstr LISTENING | findstr "3000 5173 4174 4175 4176"
echo.
echo === Done ===
