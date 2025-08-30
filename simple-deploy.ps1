# Simple BookVerse Contract Deployment
Write-Host "🚀 Deploying BookVerse NFT Contract..." -ForegroundColor Green

# Load environment variables
$envFile = Get-Content ".env.local"
foreach ($line in $envFile) {
    if ($line -match '^([^#][^=]*)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

$address = $env:FLOW_ADMIN_ADDRESS
$privateKey = $env:FLOW_ADMIN_PRIVATE_KEY

Write-Host "📍 Account: $address" -ForegroundColor Yellow

# Check Flow CLI
try {
    flow version | Out-Null
    Write-Host "✅ Flow CLI ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Flow CLI not found" -ForegroundColor Red
    exit
}

# Update flow.json
$flowJson = @"
{
  "accounts": {
    "admin": {
      "address": "$address",
      "key": "$privateKey"
    }
  },
  "networks": {
    "testnet": "access.devnet.nodes.onflow.org:9000"
  }
}
"@

$flowJson | Out-File "flow.json" -Encoding UTF8
Write-Host "📄 Flow config created" -ForegroundColor Green

# Process contract
$contract = Get-Content "flow\contracts\BookVerseNFT.cdc" -Raw
$contract = $contract.Replace('from "./standards/NonFungibleToken.cdc"', 'from 0x631e88ae7f1d7c20')
$contract = $contract.Replace('from "./standards/ViewResolver.cdc"', 'from 0x631e88ae7f1d7c20')
$contract = $contract.Replace('from "./standards/MetadataViews.cdc"', 'from 0x631e88ae7f1d7c20')

$contract | Out-File "BookVerseNFT.cdc" -Encoding UTF8
Write-Host "📝 Contract processed" -ForegroundColor Green

# Create deploy transaction
$deployTx = @'
transaction(contractCode: String) {
    prepare(signer: AuthAccount) {
        signer.contracts.add(name: "BookVerseNFT", code: contractCode.utf8)
    }
}
'@

$deployTx | Out-File "deploy.cdc" -Encoding UTF8

# Deploy
Write-Host "⏳ Deploying..." -ForegroundColor Yellow
$contractEscaped = $contract.Replace('"', '\"')
flow transactions send deploy.cdc --arg "String:$contractEscaped" --network testnet --signer admin

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployed successfully!" -ForegroundColor Green
    
    # Update .env.local
    $envContent = Get-Content ".env.local" -Raw
    $envContent = $envContent.Replace('VITE_BOOKVERSE_CONTRACT_ADDRESS=0x0000000000000000', "VITE_BOOKVERSE_CONTRACT_ADDRESS=$address")
    $envContent | Out-File ".env.local" -Encoding UTF8 -NoNewline
    
    Write-Host "🎉 Contract at: $address" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
}

# Clean up
Remove-Item "BookVerseNFT.cdc" -ErrorAction SilentlyContinue
Remove-Item "deploy.cdc" -ErrorAction SilentlyContinue