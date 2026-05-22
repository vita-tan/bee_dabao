@echo off
"D:\Program Files\mysql-9.7.0-winx64\mysql-9.7.0-winx64\bin\mysql.exe" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Qwer134679@'; CREATE DATABASE IF NOT EXISTS bee_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; SHOW DATABASES;"
