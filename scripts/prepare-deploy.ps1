param(
  [string]$Output = "hostinger-deploy.zip"
)

$ErrorActionPreference = 'Stop'

if (Test-Path $Output) {
  Remove-Item $Output -Force
}

$items = @(
  ".next",
  "app",
  "lib",
  "prisma",
  "public",
  "middleware.ts",
  "next.config.js",
  "package.json",
  "package-lock.json",
  "postcss.config.js",
  "tailwind.config.js",
  "tsconfig.json",
  ".env.production.example",
  "ecosystem.config.cjs",
  "DEPLOY_HOSTINGER.md",
  "scripts"
)

$existing = $items | Where-Object { Test-Path $_ }
if ($existing.Count -eq 0) {
  throw "Nothing found to package. Run npm run build first."
}

Compress-Archive -Path $existing -DestinationPath $Output -Force
Write-Output "Created deploy package: $Output"
