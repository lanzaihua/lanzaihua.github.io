$ErrorActionPreference = 'Stop'
$docx = 'D:\dsh-tmp\export-verify.docx'
$pdf  = 'D:\dsh-tmp\export-verify-wps.pdf'
$wps = New-Object -ComObject KWps.Application
$wps.Visible = $false
$doc = $wps.Documents.Open($docx, $false, $true)
$pages = $doc.ComputeStatistics(2)
$words = $doc.ComputeStatistics(0)
$doc.ExportAsFixedFormat($pdf, 17)
$doc.Close($false)
$wps.Quit()
Write-Output "WPS_OK pages=$pages words=$words"
