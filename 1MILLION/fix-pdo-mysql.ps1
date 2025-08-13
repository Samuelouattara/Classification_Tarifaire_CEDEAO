# Script pour activer PDO MySQL dans MAMP
Write-Host "Activation de PDO MySQL dans MAMP..." -ForegroundColor Green

$phpIniPath = "C:\MAMP\bin\php\php8.3.1\php.ini"
$backupPath = "C:\MAMP\bin\php\php8.3.1\php.ini.backup"

# Vérifier si le fichier existe
if (-not (Test-Path $phpIniPath)) {
    Write-Host "❌ Fichier php.ini non trouvé: $phpIniPath" -ForegroundColor Red
    exit 1
}

# Créer une sauvegarde
Write-Host "📋 Création de la sauvegarde..." -ForegroundColor Yellow
Copy-Item $phpIniPath $backupPath

# Lire le contenu
$content = Get-Content $phpIniPath

# Remplacer la ligne commentée
$newContent = $content -replace ';extension=pdo_mysql', 'extension=pdo_mysql'

# Écrire le nouveau contenu
Write-Host "✏️ Modification du fichier php.ini..." -ForegroundColor Yellow
$newContent | Set-Content $phpIniPath

# Vérifier le changement
$check = Get-Content $phpIniPath | Select-String "extension=pdo_mysql"
if ($check -match "^extension=pdo_mysql") {
    Write-Host "✅ PDO MySQL activé avec succès!" -ForegroundColor Green
    Write-Host "🔄 Redémarrez MAMP pour appliquer les changements" -ForegroundColor Yellow
} else {
    Write-Host "❌ Échec de l'activation de PDO MySQL" -ForegroundColor Red
}

Write-Host "📁 Sauvegarde créée: $backupPath" -ForegroundColor Cyan
