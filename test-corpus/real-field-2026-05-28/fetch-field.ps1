# Real-field corpus fetcher — live RSS → JSON
# Reproducibility: pwsh -File fetch-field.ps1
# Output: corpus.json (array of {id, source, region, domain, title, desc})
$ProgressPreference = 'SilentlyContinue'

$feeds = @(
  @{ url='https://lenta.ru/rss/news';                                     source='lenta';        region='RU'; domain='general'   },
  @{ url='https://ria.ru/export/rss2/archive/index.xml';                  source='ria';          region='RU'; domain='general'   },
  @{ url='https://www.rbc.ru/v10/rss/rss-economics/rss.rbc.ru.xml';       source='rbc-econ';     region='RU'; domain='financial' },
  @{ url='https://www.finam.ru/analysis/conews/rsspoint/';                source='finam';        region='RU'; domain='financial' },
  @{ url='https://feeds.bbci.co.uk/news/rss.xml';                         source='bbc';          region='EN'; domain='general'   },
  @{ url='https://feeds.bbci.co.uk/news/business/rss.xml';                source='bbc-biz';      region='EN'; domain='financial' },
  @{ url='https://www.cnbc.com/id/100003114/device/rss/rss.html';         source='cnbc';         region='EN'; domain='financial' },
  @{ url='https://www.marketwatch.com/rss/topstories';                    source='marketwatch';  region='EN'; domain='financial' },
  @{ url='https://cointelegraph.com/rss';                                 source='cointelegraph';region='EN'; domain='crypto'    },
  @{ url='https://decrypt.co/feed';                                       source='decrypt';      region='EN'; domain='crypto'    }
)

function Get-Text($node) {
  if ($null -eq $node) { return '' }
  if ($node -is [string]) { return $node }
  if ($node.'#text') { return [string]$node.'#text' }
  if ($node.InnerText) { return [string]$node.InnerText }
  return [string]$node
}

$all = New-Object System.Collections.ArrayList
$perFeedCap = 30
foreach ($f in $feeds) {
  try {
    $r = Invoke-RestMethod -Uri $f.url -TimeoutSec 20 -Headers @{ 'User-Agent'='Mozilla/5.0 pantheon-guard-fieldprobe' }
    # Invoke-RestMethod flattens <item> elements into a top-level array
    $items = $r
    $n = 0
    foreach ($it in $items) {
      if ($n -ge $perFeedCap) { break }
      $title = (Get-Text $it.title).Trim()
      $desc  = (Get-Text $it.description).Trim()
      if ($desc.Length -gt 400) { $desc = $desc.Substring(0,400) }
      if ([string]::IsNullOrWhiteSpace($title)) { continue }
      [void]$all.Add([pscustomobject]@{
        id     = "$($f.source):$n"
        source = $f.source
        region = $f.region
        domain = $f.domain
        title  = $title
        desc   = $desc
      })
      $n++
    }
    Write-Host "OK   $($f.source)  +$n"
  } catch {
    Write-Host "FAIL $($f.source)  $($_.Exception.Message)"
  }
}

Write-Host "TOTAL $($all.Count)"
$json = $all | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText("$PSScriptRoot\corpus.json", $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "WROTE $PSScriptRoot\corpus.json"
