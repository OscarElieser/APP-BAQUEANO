Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\PC 1\APP BAQUEANO\website\assets\images\LOGOS\baqueano_icono_500x386-blanco.png"
if (-not (Test-Path $srcPath)) {
    $srcPath = "c:\Users\PC 1\APP BAQUEANO\website\assets\images\logo.png"
}

$srcBmp = [System.Drawing.Image]::FromFile($srcPath)
$size = 64
$destBmp = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($destBmp)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$ratio = [Math]::Min($size / $srcBmp.Width, $size / $srcBmp.Height)
$w = [int]($srcBmp.Width * $ratio)
$h = [int]($srcBmp.Height * $ratio)
$x = [int](($size - $w) / 2)
$y = [int](($size - $h) / 2)

$graphics.DrawImage($srcBmp, $x, $y, $w, $h)

$pngPath = "c:\Users\PC 1\APP BAQUEANO\website\favicon.png"
$destBmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $destBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoPath = "c:\Users\PC 1\APP BAQUEANO\website\favicon.ico"
$icoFile = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$icon.Save($icoFile)
$icoFile.Close()

$srcBmp.Dispose()
$destBmp.Dispose()
$graphics.Dispose()

Write-Host "Optimized Favicons created successfully!"
Get-Item "c:\Users\PC 1\APP BAQUEANO\website\favicon.*" | Select-Object Name, Length
