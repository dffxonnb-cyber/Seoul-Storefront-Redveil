Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function New-Color([string]$hex) {
    return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-RoundedRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-RoundedCard($g, $x, $y, $w, $h, $radius, $fill, $border, $shadow) {
    $shadowPath = New-RoundedRectPath ($x + 8) ($y + 12) $w $h $radius
    $shadowBrush = New-Object System.Drawing.SolidBrush $shadow
    $g.FillPath($shadowBrush, $shadowPath)
    $shadowBrush.Dispose()
    $shadowPath.Dispose()

    $cardPath = New-RoundedRectPath $x $y $w $h $radius
    $fillBrush = New-Object System.Drawing.SolidBrush $fill
    $borderPen = New-Object System.Drawing.Pen $border, 2
    $g.FillPath($fillBrush, $cardPath)
    $g.DrawPath($borderPen, $cardPath)
    $fillBrush.Dispose()
    $borderPen.Dispose()
    return $cardPath
}

function Draw-CoverImage($g, [string]$imagePath, [float]$x, [float]$y, [float]$w, [float]$h, [float]$radius) {
    $img = [System.Drawing.Image]::FromFile($imagePath)
    $imgRatio = $img.Width / $img.Height
    $targetRatio = $w / $h

    if ($imgRatio -gt $targetRatio) {
        $srcH = $img.Height
        $srcW = [int]($srcH * $targetRatio)
        $srcX = [int](($img.Width - $srcW) / 2)
        $srcY = 0
    } else {
        $srcW = $img.Width
        $srcH = [int]($srcW / $targetRatio)
        $srcX = 0
        $srcY = [int](($img.Height - $srcH) / 2)
    }

    $clipPath = New-RoundedRectPath $x $y $w $h $radius
    $state = $g.Save()
    $g.SetClip($clipPath)
    $destRect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
    $srcRect = New-Object System.Drawing.RectangleF($srcX, $srcY, $srcW, $srcH)
    $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Restore($state)
    $clipPath.Dispose()
    $img.Dispose()
}

function Draw-FitImage($g, [string]$imagePath, [float]$x, [float]$y, [float]$w, [float]$h, [float]$radius, $backColor) {
    $img = [System.Drawing.Image]::FromFile($imagePath)
    $imgRatio = $img.Width / $img.Height
    $targetRatio = $w / $h

    if ($imgRatio -gt $targetRatio) {
        $drawW = $w
        $drawH = $w / $imgRatio
        $drawX = $x
        $drawY = $y + (($h - $drawH) / 2)
    } else {
        $drawH = $h
        $drawW = $h * $imgRatio
        $drawY = $y
        $drawX = $x + (($w - $drawW) / 2)
    }

    $clipPath = New-RoundedRectPath $x $y $w $h $radius
    $state = $g.Save()
    $g.SetClip($clipPath)
    $backBrush = New-Object System.Drawing.SolidBrush $backColor
    $g.FillRectangle($backBrush, $x, $y, $w, $h)
    $backBrush.Dispose()
    $g.DrawImage($img, $drawX, $drawY, $drawW, $drawH)
    $g.Restore($state)
    $clipPath.Dispose()
    $img.Dispose()
}

function Draw-Badge($g, [string]$label, [string]$value, [float]$x, [float]$y, [float]$w, $accent, $text, $muted) {
    $fill = New-Color "#fffaf5"
    $border = New-Color "#e7d8ca"
    $shadow = [System.Drawing.Color]::FromArgb(18, 65, 33, 10)
    $path = Draw-RoundedCard $g $x $y $w 112 24 $fill $border $shadow
    $path.Dispose()

    $dotBrush = New-Object System.Drawing.SolidBrush $accent
    $g.FillEllipse($dotBrush, $x + 22, $y + 24, 18, 18)
    $dotBrush.Dispose()

    $labelFont = New-Object System.Drawing.Font("Segoe UI Semibold", 15, [System.Drawing.FontStyle]::Regular)
    $valueFont = New-Object System.Drawing.Font("Segoe UI Semibold", 28, [System.Drawing.FontStyle]::Regular)
    $smallBrush = New-Object System.Drawing.SolidBrush $muted
    $textBrush = New-Object System.Drawing.SolidBrush $text

    $g.DrawString($label, $labelFont, $smallBrush, $x + 54, $y + 20)
    $g.DrawString($value, $valueFont, $textBrush, $x + 22, $y + 46)

    $labelFont.Dispose()
    $valueFont.Dispose()
    $smallBrush.Dispose()
    $textBrush.Dispose()
}

function Save-Canvas($bitmap, [string]$path) {
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

$bg = New-Color "#f5efe6"
$card = New-Color "#fffaf5"
$border = New-Color "#ddcdbd"
$text = New-Color "#1e2530"
$muted = New-Color "#6f7680"
$accent = New-Color "#d05a2d"
$teal = New-Color "#1f5b6b"
$gold = New-Color "#c99724"
$shadow = [System.Drawing.Color]::FromArgb(18, 42, 24, 7)

$overview = Join-Path $root "01_overview.png"
$review = Join-Path $root "02_district_risk_review.png"
$caseStudy = Join-Path $root "03_case_study.png"
$fragility = Join-Path $root "04_demand_fragility.png"
$saturation = Join-Path $root "05_admin_dong_saturation.png"

# Hero image
$hero = New-Object System.Drawing.Bitmap 1600, 980
$g = [System.Drawing.Graphics]::FromImage($hero)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear($bg)

$titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 34, [System.Drawing.FontStyle]::Regular)
$subtitleFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$titleBrush = New-Object System.Drawing.SolidBrush $text
$mutedBrush = New-Object System.Drawing.SolidBrush $muted

$g.DrawString("Redveil", $titleFont, $titleBrush, 64, 50)
$g.DrawString("Acquisition objections before commitment", $subtitleFont, $mutedBrush, 66, 105)

Draw-Badge $g "Transactions" "12,074" 64 150 350 $accent $text $muted
Draw-Badge $g "Districts" "25" 436 150 300 $teal $text $muted
Draw-Badge $g "Admin-dongs" "428" 758 150 300 $gold $text $muted
Draw-Badge $g "Trade areas" "1,570" 1080 150 340 (New-Color "#8b4f81") $text $muted

$path = Draw-RoundedCard $g 64 300 930 600 30 $card $border $shadow
$path.Dispose()
Draw-FitImage $g $overview 82 318 894 564 22 $card

$path = Draw-RoundedCard $g 1030 300 506 280 28 $card $border $shadow
$path.Dispose()
Draw-FitImage $g $review 1048 318 470 244 20 $card

$path = Draw-RoundedCard $g 1030 620 506 280 28 $card $border $shadow
$path.Dispose()
Draw-FitImage $g $caseStudy 1048 638 470 244 20 $card

$tagFont = New-Object System.Drawing.Font("Segoe UI Semibold", 16, [System.Drawing.FontStyle]::Regular)
$g.DrawString("Main overview", $tagFont, $titleBrush, 84, 888)
$g.DrawString("District memo", $tagFont, $titleBrush, 1050, 570)
$g.DrawString("Case study", $tagFont, $titleBrush, 1050, 890)

$titleFont.Dispose()
$subtitleFont.Dispose()
$tagFont.Dispose()
$titleBrush.Dispose()
$mutedBrush.Dispose()
$g.Dispose()
Save-Canvas $hero (Join-Path $root "README_HERO.png")

# Evidence image
$evidence = New-Object System.Drawing.Bitmap 1600, 900
$g = [System.Drawing.Graphics]::FromImage($evidence)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.Clear($bg)

$titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 32, [System.Drawing.FontStyle]::Regular)
$subtitleFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$smallFont = New-Object System.Drawing.Font("Segoe UI Semibold", 15, [System.Drawing.FontStyle]::Regular)
$bodyFont = New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Regular)
$titleBrush = New-Object System.Drawing.SolidBrush $text
$mutedBrush = New-Object System.Drawing.SolidBrush $muted
$accentBrush = New-Object System.Drawing.SolidBrush $accent

$g.DrawString("Why the score happened", $titleFont, $titleBrush, 64, 50)
$g.DrawString("README-ready evidence boards that make the scoring logic visible at a glance", $subtitleFont, $mutedBrush, 66, 100)

$badgePath = Draw-RoundedCard $g 64 142 220 58 20 (New-Color "#fff4ef") (New-Color "#f0c7b4") $shadow
$badgePath.Dispose()
$g.DrawString("Price burden", $smallFont, $accentBrush, 92, 158)
$badgePath = Draw-RoundedCard $g 300 142 220 58 20 (New-Color "#eef8fa") (New-Color "#bfdae1") $shadow
$badgePath.Dispose()
$g.DrawString("Liquidity", $smallFont, (New-Object System.Drawing.SolidBrush $teal), 338, 158)
$badgePath = Draw-RoundedCard $g 536 142 220 58 20 (New-Color "#fff8ea") (New-Color "#e8d3a1") $shadow
$badgePath.Dispose()
$g.DrawString("Competition", $smallFont, (New-Object System.Drawing.SolidBrush $gold), 566, 158)
$badgePath = Draw-RoundedCard $g 772 142 250 58 20 (New-Color "#f8eef6") (New-Color "#d9bfd3") $shadow
$badgePath.Dispose()
$g.DrawString("Demand fragility", $smallFont, (New-Object System.Drawing.SolidBrush (New-Color "#8b4f81")), 808, 158)

$path = Draw-RoundedCard $g 64 240 710 560 30 $card $border $shadow
$path.Dispose()
Draw-FitImage $g $fragility 84 260 670 520 22 $card

$path = Draw-RoundedCard $g 826 240 710 560 30 $card $border $shadow
$path.Dispose()
Draw-FitImage $g $saturation 846 260 670 520 22 $card

$footerPath = Draw-RoundedCard $g 64 820 1472 52 18 (New-Color "#fff7f0") (New-Color "#ead7c7") $shadow
$footerPath.Dispose()
$g.DrawString("Transaction slowdown, merchant saturation, and fragile demand signals are separated first, then linked back to a district-level review flow.", $bodyFont, $titleBrush, 92, 834)

$titleFont.Dispose()
$subtitleFont.Dispose()
$smallFont.Dispose()
$bodyFont.Dispose()
$titleBrush.Dispose()
$mutedBrush.Dispose()
$accentBrush.Dispose()
$g.Dispose()
Save-Canvas $evidence (Join-Path $root "README_EVIDENCE.png")

$testFile = Join-Path $root "_test_render.png"
if (Test-Path $testFile) {
    Remove-Item -LiteralPath $testFile -Force
}
