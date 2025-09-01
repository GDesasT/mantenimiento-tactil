#!/bin/bash

if [ $# -eq 0 ]; then
    echo "❌ Error: Debes proporcionar al menos la versión"
    echo "📝 Uso: ./create-release.sh <versión> [descripción]"
    echo "📝 Ejemplo: ./create-release.sh 1.0.1 'Corrección de bugs y mejoras'"
    exit 1
fi

VERSION=$1
DESCRIPTION=${2:-"Release $VERSION"}

echo "🚀 Creando release v$VERSION"

echo "📝 Actualizando package.json..."
npm version $VERSION --no-git-tag-version

echo "💾 Creando commit..."
git add package.json
git commit -m "chore: bump version to $VERSION"

echo "🏷️ Creando tag v$VERSION..."
git tag -a "v$VERSION" -m "$DESCRIPTION"

echo "⬆️ Subiendo cambios y tag..."
git push origin main
git push origin "v$VERSION"

echo "✅ Release v$VERSION creado exitosamente!"
echo "🔗 GitHub Actions se encargará de construir y publicar automáticamente"
echo "📦 Los usuarios recibirán la actualización automáticamente"
