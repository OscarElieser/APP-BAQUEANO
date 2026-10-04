# ============================================================================
# 🧭 BAQUEANO — SCRIPT DE AUDITORÍA INTEGRAL DE REPOSITORIO (FASE 1)
# ============================================================================
param (
    [string]$Root = "d:\Desktop\APP BAQUEANO"
)

Set-Location $Root

Write-Host "=================================================================="
Write-Host "1. TEMPORALES, BACKUPS, BASURA Y ARCHIVOS DEL SISTEMA"
Write-Host "=================================================================="

$junkPatterns = @("*.tmp", "*.bak", "*.old", "*copia*", "*copy*", "*backup*", "thumbs.db", "desktop.ini", ".DS_Store", "*.crdownload", "*~", "*.swp")
$junkFiles = Get-ChildItem -Path . -Recurse -Force -Include $junkPatterns -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\node_modules\\' }

if ($junkFiles.Count -eq 0) {
    Write-Host "No se encontraron archivos temporales comunes."
} else {
    $junkFiles | Select-Object @{Name="Path";Expression={$_.FullName.Replace($Root, "")}}, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB, 2)}}, LastWriteTime | Format-Table -AutoSize
}

Write-Host "`n=================================================================="
Write-Host "2. DIRECTORIOS DE BUILD, CACHÉ Y DEPENDENCIAS GENERADAS"
Write-Host "=================================================================="

$cacheDirs = Get-ChildItem -Path . -Recurse -Force -Directory -ErrorAction SilentlyContinue |
    Where-Object { 
        ($_.Name -match '^(node_modules|build|\.dart_tool|\.gradle|\.firebase|dist|dist-hostinger|DerivedData|\.pnpm-store)$') -and
        ($_.FullName -notmatch '\\\.git\\')
    }

$cacheDirs | Select-Object @{Name="Dir";Expression={$_.FullName.Replace($Root, "")}} | Format-Table -AutoSize

Write-Host "`n=================================================================="
Write-Host "3. ARCHIVOS GRANDES (> 10 MB)"
Write-Host "=================================================================="

$largeFiles = Get-ChildItem -Path . -Recurse -Force -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 10MB -and $_.FullName -notmatch '\\\.git\\' } |
    Sort-Object Length -Descending

if ($largeFiles.Count -eq 0) {
    Write-Host "No se encontraron archivos > 10MB."
} else {
    $largeFiles | Select-Object @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}, @{Name="Path";Expression={$_.FullName.Replace($Root, "")}} | Format-Table -AutoSize
}

Write-Host "`n=================================================================="
Write-Host "4. SECRETOS O ARCHIVOS POTENCIALMENTE SENSIBLES"
Write-Host "=================================================================="

$sensitivePatterns = @("*.env", "*.pem", "*.key", "*id_rsa*", "*credentials*.json", "*serviceAccount*.json", "*service-account*.json", "*upload-keystore*")
$sensitiveFiles = Get-ChildItem -Path . -Recurse -Force -Include $sensitivePatterns -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\' }

$sensitiveFiles | Select-Object @{Name="File";Expression={$_.FullName.Replace($Root, "")}}, Length | Format-Table -AutoSize

Write-Host "`n=================================================================="
Write-Host "5. POSIBLES DUPLICADOS DE ARCHIVOS (POR NOMBRE Y TAMAÑO)"
Write-Host "=================================================================="

$allFiles = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { 
        $_.FullName -notmatch '\\\.git\\' -and 
        $_.FullName -notmatch '\\node_modules\\' -and 
        $_.FullName -notmatch '\\build\\' -and 
        $_.FullName -notmatch '\\\.dart_tool\\' 
    }

$grouped = $allFiles | Group-Object Name | Where-Object { $_.Count -gt 1 }
foreach ($g in $grouped) {
    $subgroups = $g.Group | Group-Object Length | Where-Object { $_.Count -gt 1 }
    foreach ($sg in $subgroups) {
        Write-Host "Duplicado exacto en nombre y tamaño: $($g.Name) ($($sg.Name) bytes)"
        foreach ($item in $sg.Group) {
            Write-Host "   -> $($item.FullName.Replace($Root, ''))"
        }
    }
}

Write-Host "=================================================================="
Write-Host "6. REVISION DE .gitignore"
Write-Host "=================================================================="

if (Test-Path .gitignore) {
    Write-Host ".gitignore encontrado."
}

