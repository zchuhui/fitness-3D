# 生成 PWA 图标（192 / 512 / maskable 512），深色底 + 荧光绿描边 + "3D" 字样
Add-Type -AssemblyName System.Drawing

function Make-Icon([int]$size, [string]$path, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # 深色背景
  $bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 13, 16, 23))
  $g.FillRectangle($bg, 0, 0, $size, $size)

  # 荧光绿圆角边框（maskable 版留出安全区）
  $inset = if ($maskable) { [int]($size * 0.18) } else { [int]($size * 0.08) }
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 184, 241, 53), [int]($size / 40))
  $g.DrawRectangle($pen, $inset, $inset, $size - 2 * $inset, $size - 2 * $inset)

  # "3D" 文字
  $fontPct = if ($maskable) { 0.28 } else { 0.42 }
  $font = New-Object System.Drawing.Font('Segoe UI', [int]($size * $fontPct), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 184, 241, 53))
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, [float]($size * 0.04), $size, $size)
  $g.DrawString('3D', $font, $fg, $rect, $fmt)

  $g.Dispose()
  $dir = Split-Path $path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Make-Icon 512 (Join-Path $PSScriptRoot 'icons\icon-512.png') $false
Make-Icon 192 (Join-Path $PSScriptRoot 'icons\icon-192.png') $false
Make-Icon 512 (Join-Path $PSScriptRoot 'icons\maskable-512.png') $true

Get-ChildItem (Join-Path $PSScriptRoot 'icons') | Select-Object Name, Length
