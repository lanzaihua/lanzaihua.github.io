$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path 'D:\dsh-tmp' | Out-Null
Copy-Item 'D:\学习\大一\错题本网页\debug\export-verify.docx' 'D:\dsh-tmp\export-verify.docx' -Force
$docx = 'D:\dsh-tmp\export-verify.docx'
$pdf  = 'D:\dsh-tmp\export-verify-word.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($docx, $false, $true)
$pages = $doc.ComputeStatistics(2)
$words = $doc.ComputeStatistics(0)
$doc.SaveAs([ref]$pdf, [ref]17)
$doc.Close([ref]$false)
$word.Quit()
Write-Output "WORD_OK pages=$pages words=$words"
