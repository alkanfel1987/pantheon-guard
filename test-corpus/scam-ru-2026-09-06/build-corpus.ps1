$ErrorActionPreference = 'Continue'
# рабочая папка задаётся снаружи: $env:SCAM_SCRATCH, иначе временная папка текущего пользователя
$scratch = if ($env:SCAM_SCRATCH) { $env:SCAM_SCRATCH } else { Join-Path $env:TEMP 'scam-ru-corpus' }

$rows = Get-Content (Join-Path $scratch 'candidates-clean.jsonl') -Encoding UTF8 |
  Where-Object { $_.Trim() } | ForEach-Object { $_ | ConvertFrom-Json }

# Последний ЖАНРОВЫЙ фильтр: текст обращён к адресату или побуждает к действию.
# Отсекает вырванные словосочетания и посторонние заголовки с сайтов-источников.
$address = @('вы ','вы,','ваш','вам','вас','тебе','твой','твоя','твоё','тебя','ты ','здравствуйте','привет','уважаем')
$imperative = '\b(перейдит|подтвердит|введит|укажит|отправьт|продиктуйт|переведит|снимит|установит|активируйт|пройдит|нажмит|позвонит|перезвонит|оплатит|поддержи|проверь|посмотри|напиши|сообщит|назовит|поставьт|сделайт|войдит|скачайт|запишит|не\s+рассказывайт|никому\s+не)'

$kept = @()
foreach ($r in $rows) {
  $lc = $r.text.ToLower()
  $hasAddr = $false
  foreach ($a in $address) { if ($lc.Contains($a)) { $hasAddr = $true; break } }
  $hasImp = $lc -match $imperative
  if (-not ($hasAddr -or $hasImp)) { continue }

  # класс жанра: полное сообщение или реплика из скрипта звонка
  $genre = if ($r.text.Length -ge 60) { 'сообщение' } else { 'реплика-звонка' }
  $kept += [pscustomobject]@{
    id       = ''
    text     = $r.text
    source   = $r.source
    genre    = $genre
    method   = $r.method
    len      = $r.text.Length
    collected= '2026-09-06'
    label    = ''   # ПУСТО: метка ставится teacher-labeler, не при сборе
  }
}

# устойчивые идентификаторы
$i = 0
foreach ($r in $kept) { $i++; $r.id = 'pos-{0:d3}' -f $i }

$outFile = Join-Path $scratch 'corpus-positive.jsonl'
# UTF-8 БЕЗ BOM: Out-File -Encoding utf8 в PS 5.1 ставит BOM, и JSON.parse в label.mjs
# падает на первой строке (замер 2026-09-07, поймано всевидением на стыке).
$lines = $kept | ForEach-Object { $_ | ConvertTo-Json -Compress }
[System.IO.File]::WriteAllLines($outFile, $lines, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "отобрано в корпус: $($kept.Count)"
$kept | Group-Object genre | ForEach-Object { "  {0,-16} {1}" -f $_.Name, $_.Count }
Write-Host ""
$kept | Group-Object source | Sort-Object Count -Descending | ForEach-Object { "  {0,-18} {1}" -f $_.Name, $_.Count }

# хеш собранного (фиксация состояния на момент сбора)
$sha = (Get-FileHash $outFile -Algorithm SHA256).Hash
Write-Host "`nSHA-256 позитивной части: $sha"
Write-Host "файл: $outFile"
