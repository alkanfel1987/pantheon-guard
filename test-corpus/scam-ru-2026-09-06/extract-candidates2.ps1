$ErrorActionPreference = 'Continue'
$scratch = 'C:\Users\8523~1\AppData\Local\Temp\claude\C--Pantheon\4a3817d2-5c97-4582-85a1-4a4caa53be23\scratchpad'
$raw = Join-Path $scratch 'raw'

# Два механизма извлечения, оба СТРУКТУРНЫЕ (по форме документа), не смысловые:
#   1) фрагмент в кавычках;
#   2) абзацы после маркерного заголовка вида «Как может выглядеть сообщение»
#      и до следующего служебного заголовка.
# Признак манипуляции при отборе НЕ используется — иначе корпус станет предвзятым
# ещё до разметки.

$startMarkers = @(
  'как может выглядеть сообщение', 'что может говорить звонящий', 'как выглядит сообщение',
  'примеры сообщений', 'пример сообщения', 'что пишут мошенники', 'что говорят мошенники',
  'как выглядят такие сообщения', 'текст сообщения'
)
$stopMarkers = @(
  'как распознать', 'что делать', 'что предпринять', 'как защитить', 'как не стать',
  'признаки', 'совет', 'вывод', 'источник'
)

$out = @()
$seen = New-Object System.Collections.Generic.HashSet[string]

function Add-Candidate($text, $src, $method) {
  $t = ($text -replace '\s+', ' ').Trim(' ', '.', '—', '-', ':', '"', '«', '»')
  if ($t.Length -lt 25 -or $t.Length -gt 600) { return }
  if (($t -replace '[^а-яёА-ЯЁ]', '').Length -lt ($t.Length * 0.45)) { return }
  $key = $t.ToLower() -replace '[^а-яё]', ''
  if ($key.Length -lt 20) { return }
  if (-not $script:seen.Add($key)) { return }
  $script:out += [pscustomobject]@{ source = $src; method = $method; len = $t.Length; text = $t }
}

foreach ($f in Get-ChildItem $raw -Filter '*.md') {
  $txt = Get-Content $f.FullName -Raw -Encoding UTF8
  # разбиваем по тегам на строки-абзацы
  $lines = ([regex]::Replace($txt, '<[^>]+>', "`n")) -split "`n" |
    ForEach-Object { ($_ -replace '&nbsp;',' ' -replace '&laquo;','«' -replace '&raquo;','»' -replace '&quot;','"' -replace '\s+',' ').Trim() } |
    Where-Object { $_.Length -gt 0 }

  # механизм 2 — блоки после маркерных заголовков
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $lc = $lines[$i].ToLower()
    $isStart = $false
    foreach ($m in $startMarkers) { if ($lc -like "*$m*" -and $lines[$i].Length -lt 80) { $isStart = $true; break } }
    if (-not $isStart) { continue }
    for ($j = $i + 1; $j -lt [Math]::Min($i + 12, $lines.Count); $j++) {
      $cand = $lines[$j]
      $clc = $cand.ToLower()
      $stop = $false
      foreach ($m in $stopMarkers) { if ($clc -like "$m*" -and $cand.Length -lt 80) { $stop = $true; break } }
      if ($stop) { break }
      Add-Candidate $cand $f.BaseName 'блок-после-заголовка'
    }
  }

  # механизм 1 — кавычки
  $flat = ($lines -join ' ')
  foreach ($m in [regex]::Matches($flat, '«([^»]{25,600})»')) { Add-Candidate $m.Groups[1].Value $f.BaseName 'кавычки' }
  foreach ($m in [regex]::Matches($flat, '"([^"]{25,600})"'))  { Add-Candidate $m.Groups[1].Value $f.BaseName 'кавычки' }
}

$outFile = Join-Path $scratch 'candidates-raw.jsonl'
$out | ForEach-Object { $_ | ConvertTo-Json -Compress } | Out-File $outFile -Encoding utf8

Write-Host "кандидатов: $($out.Count)"
$out | Group-Object method | ForEach-Object { "  по механизму {0,-22} {1}" -f $_.Name, $_.Count }
Write-Host ""
$out | Group-Object source | Sort-Object Count -Descending | ForEach-Object { "  {0,-18} {1}" -f $_.Name, $_.Count }
Write-Host "`nдлины: мин $(($out | Measure-Object len -Minimum).Minimum) · макс $(($out | Measure-Object len -Maximum).Maximum)"
Write-Host "`n--- 8 примеров, отобранных механизмом блоков ---"
$out | Where-Object method -eq 'блок-после-заголовка' | Select-Object -First 8 |
  ForEach-Object { "  [{0}] {1}" -f $_.source, $_.text.Substring(0, [Math]::Min(110, $_.text.Length)) }
