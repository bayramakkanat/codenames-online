@echo off
echo.
echo  ========================================
echo   CODENAMES TURKCE - Sunucu Baslatiliyor
echo  ========================================
echo.
echo  Tarayicida su adresi ac:
echo.
node -e "const os=require('os');const i=Object.values(os.networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal);console.log('  http://' + (i?i.address:'localhost') + ':3456/');"
echo.
echo  Kapat: Bu pencereyi kapat = sunucu durur
echo  ========================================
echo.
node server.js
pause
