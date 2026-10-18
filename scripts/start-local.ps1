param(
  # For a physical phone, use this computer's Wi-Fi IPv4 address.
  [string]$ApiHost = '127.0.0.1',
  [switch]$Web,
  [int]$Port = 8082
)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$localStatus = & npx.cmd supabase status -o json
if ($LASTEXITCODE -ne 0) {
  throw 'Local Supabase is unavailable. Start Docker Desktop, then run npx supabase start.'
}
$localConfig = ($localStatus -join "`n") | ConvertFrom-Json
if (-not $localConfig.ANON_KEY) { throw 'Local Supabase did not return a public anon key.' }
$localUri = [UriBuilder]::new($localConfig.API_URL)
$localUri.Host = $ApiHost
$savedUrl = $env:EXPO_PUBLIC_SUPABASE_URL
$savedKey = $env:EXPO_PUBLIC_SUPABASE_ANON_KEY
try {
  $env:EXPO_PUBLIC_SUPABASE_URL = $localUri.Uri.AbsoluteUri.TrimEnd('/')
  $env:EXPO_PUBLIC_SUPABASE_ANON_KEY = $localConfig.ANON_KEY
  Write-Host "Using local Supabase at $env:EXPO_PUBLIC_SUPABASE_URL"
  Write-Host 'Read test email codes at http://127.0.0.1:54324 on this computer.'
  if ($Web) { & npx.cmd expo start --go --clear --web --port $Port }
  else { & npx.cmd expo start --go --clear --port $Port }
} finally {
  $env:EXPO_PUBLIC_SUPABASE_URL = $savedUrl
  $env:EXPO_PUBLIC_SUPABASE_ANON_KEY = $savedKey
}
