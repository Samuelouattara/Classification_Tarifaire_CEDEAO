# Script simple pour activer PDO MySQL
Write-Host "Activation de PDO MySQL dans MAMP..."

$phpIniPath = "C:\MAMP\bin\php\php8.3.1\php.ini"

# Vérifier si le fichier existe
if (-not (Test-Path $phpIniPath)) {
    Write-Host "Fichier php.ini non trouve: $phpIniPath"
    exit 1
}

# Créer une sauvegarde
Write-Host "Creation de la sauvegarde..."
Copy-Item $phpIniPath "$phpIniPath.backup"

# Lire le contenu
$content = Get-Content $phpIniPath

# Remplacer la ligne commentée
$newContent = $content -replace ';extension=pdo_mysql', 'extension=pdo_mysql'

# Écrire le nouveau contenu
Write-Host "Modification du fichier php.ini..."
$newContent | Set-Content $phpIniPath

# Vérifier le changement
$check = Get-Content $phpIniPath | Select-String "extension=pdo_mysql"
if ($check -match "^extension=pdo_mysql") {
    Write-Host "PDO MySQL active avec succes!"
    Write-Host "Redemarrez MAMP pour appliquer les changements"
} else {
    Write-Host "Echec de l'activation de PDO MySQL"
}

Write-Host "Sauvegarde creee: $phpIniPath.backup"
