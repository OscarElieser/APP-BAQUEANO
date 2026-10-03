Add-Type -AssemblyName System.Drawing

function Optimize-PngImage($path, $maxWidth) {
    if (-not (Test-Path $path)) { return }
    $img = [System.Drawing.Image]::FromFile($path)
    $origW = $img.Width
    $origH = $img.Height
    $origSize = (Get-Item $path).Length

    $targetW = $origW
    $targetH = $origH

    if ($maxWidth -gt 0 -and $origW -gt $maxWidth) {
        $targetW = $maxWidth
        $targetH = [int]($origH * ($maxWidth / $origW))
    }

    $destBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.DrawImage($img, 0, 0, $targetW, $targetH)
    $img.Dispose()

    $tempPath = "$path.tmp.png"
    $destBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    $graphics.Dispose()

    $newSize = (Get-Item $tempPath).Length
    if ($newSize -lt $origSize) {
        Move-Item -Force $tempPath $path
        Write-Host "Optimized $path : $([Math]::Round($origSize/1024)) KB -> $([Math]::Round($newSize/1024)) KB ($targetW x $targetH)"
    } else {
        Remove-Item $tempPath
        Write-Host "Kept original $path (already optimal)"
    }
}

function Optimize-JpgImage($path, $maxWidth, $quality = 85) {
    if (-not (Test-Path $path)) { return }
    $img = [System.Drawing.Image]::FromFile($path)
    $origW = $img.Width
    $origH = $img.Height
    $origSize = (Get-Item $path).Length

    $targetW = $origW
    $targetH = $origH

    if ($maxWidth -gt 0 -and $origW -gt $maxWidth) {
        $targetW = $maxWidth
        $targetH = [int]($origH * ($maxWidth / $origW))
    }

    $destBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.DrawImage($img, 0, 0, $targetW, $targetH)
    $img.Dispose()

    # Encoder for JPEG quality
    $codecs = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
    $jpegCodec = $codecs | Where-Object { $_.FormatDescription -eq "JPEG" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

    $tempPath = "$path.tmp.jpg"
    $destBmp.Save($tempPath, $jpegCodec, $encoderParams)
    $destBmp.Dispose()
    $graphics.Dispose()

    $newSize = (Get-Item $tempPath).Length
    if ($newSize -lt $origSize) {
        Move-Item -Force $tempPath $path
        Write-Host "Optimized $path : $([Math]::Round($origSize/1024)) KB -> $([Math]::Round($newSize/1024)) KB ($targetW x $targetH)"
    } else {
        Remove-Item $tempPath
        Write-Host "Kept original $path (already optimal)"
    }
}

Write-Host "=== OPTIMIZANDO IMÁGENES PESADAS CLAVE ==="

# 1. Mascotas de BAQUI y Logo Principal
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\assistant\baqui.png" 300
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\assistant\baqui-bird.png" 300
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\logo.png" 600

# 2. Footers pesados
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\footer.png" 1200
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\footer1.png" 1200
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\footer2.png" 1200
Optimize-PngImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\footer3.png" 1200

# 3. Fotos pesadas de destinos
Optimize-JpgImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\destinos\isla_de_ometepe.jpg" 1600 82
Optimize-JpgImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\destinos\cascada_la_luna.jpg" 1600 82
Optimize-JpgImage "c:\Users\PC 1\APP BAQUEANO\website\assets\images\aliados\hotel_dario.jpg" 1400 82

Write-Host "Optimización de imágenes completada."
