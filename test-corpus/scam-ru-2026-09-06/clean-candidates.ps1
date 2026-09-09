$ErrorActionPreference = 'Continue'
$scratch = 'C:\Users\8523~1\AppData\Local\Temp\claude\C--Pantheon\4a3817d2-5c97-4582-85a1-4a4caa53be23\scratchpad'

$rows = Get-Content (Join-Path $scratch 'candidates-raw.jsonl') -Encoding UTF8 |
  Where-Object { $_.Trim() } | ForEach-Object { $_ | ConvertFrom-Json }

# ЖАНРОВАЯ чистка: убрать речь АВТОРА статьи о сообщениях, оставить сами сообщения.
# Признаки метатекста формальные, к манипулятивности отношения не имеют:
#   — сообщение от имени отправителя не называет происходящее мошенничеством;
#   — подписи к иллюстрациям и ссылки на источник;
#   — повествование о мошенниках в третьем лице.
$metaWords = @('мошенник','злоумышленник','жертв','фишинг','афер','обманщик','преступник',
               'скриншот','фото:','источник:','лайфхакер','эксперт','специалист','по данным',
               'схема','уловк','развод')
$metaStarts = @('чаще всего','обычно','как правило','например','кроме того','при этом',
                'также','нередко','иногда','часто','в результате','именно','всё это','это')

$kept = @(); $dropped = @()
foreach ($r in $rows) {
  $lc = $r.text.ToLower()
  $isMeta = $false
  foreach ($w in $metaWords)  { if ($lc.Contains($w)) { $isMeta = $true; break } }
  if (-not $isMeta) { foreach ($s in $metaStarts) { if ($lc.StartsWith($s)) { $isMeta = $true; break } } }
  if ($isMeta) { $dropped += $r } else { $kept += $r }
}

$kept | ForEach-Object { $_ | ConvertTo-Json -Compress } |
  Out-File (Join-Path $scratch 'candidates-clean.jsonl') -Encoding utf8

Write-Host "было: $($rows.Count) · осталось: $($kept.Count) · отсеяно как метатекст: $($dropped.Count)"
Write-Host ""
$kept | Group-Object source | Sort-Object Count -Descending | ForEach-Object { "  {0,-18} {1}" -f $_.Name, $_.Count }
Write-Host "`n=== ВСЕ оставшиеся кандидаты ===`n"
$i = 0
foreach ($r in $kept) {
  $i++
  "{0,3}. [{1}] {2}" -f $i, $r.source, $r.text
}
