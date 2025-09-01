@echo off

if "%1"=="" (
    echo ❌ Error: Debes proporcionar al menos la versión
    echo 📝 Uso: create-release.bat ^<versión^> [descripción]
    echo 📝 Ejemplo: create-release.bat 1.0.1 "Corrección de bugs y mejoras"
    exit /b 1
)

set VERSION=%1
set DESCRIPTION=%~2
if "%DESCRIPTION%"=="" set DESCRIPTION=Release %VERSION%

echo 🚀 Creando release v%VERSION%

echo 📝 Actualizando package.json...
call npm version %VERSION% --no-git-tag-version

echo 💾 Creando commit...
git add package.json
git commit -m "chore: bump version to %VERSION%"

echo 🏷️ Creando tag v%VERSION%...
git tag -a "v%VERSION%" -m "%DESCRIPTION%"

echo ⬆️ Subiendo cambios y tag...
git push origin main
git push origin "v%VERSION%"

echo ✅ Release v%VERSION% creado exitosamente!
echo 🔗 GitHub Actions se encargará de construir y publicar automáticamente
echo 📦 Los usuarios recibirán la actualización automáticamente

pause
