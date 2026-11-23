$root = "c:\projects\qfs"
$files = Get-ChildItem -Path $root -Recurse -File -Include *.tsx,*.ts | Where-Object { $_.FullName -notmatch '[\\/](node_modules|\.next|\.git)[\\/]' }
$dead = @()
foreach ($f in $files) {
  $text = Get-Content $f.FullName -Raw -Encoding UTF8
  $matches = [regex]::Matches($text, '<button\b[^>]*>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  foreach ($m in $matches) {
    $tag = $m.Value
    if ($tag -notmatch 'onClick' -and $tag -notmatch 'disabled') {
      $before = $text.Substring(0, $m.Index)
      $lineNo = ($before -split "`n").Count
      $dead += "$($f.FullName):$lineNo"
    }
  }
}
Write-Host "Dead buttons (no onClick, not disabled): $($dead.Count)"
$dead | ForEach-Object { Write-Host $_ }
