# BookVerse Contract Deployment Script (PowerShell)
# Run with: .\deploy.ps1

Write-Host "🚀 Starting BookVerse NFT contract deployment..." -ForegroundColor Green

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    exit 1
}

$ADMIN_ADDRESS = $env:FLOW_ADMIN_ADDRESS
$ADMIN_PRIVATE_KEY = $env:FLOW_ADMIN_PRIVATE_KEY

if (-not $ADMIN_ADDRESS -or -not $ADMIN_PRIVATE_KEY) {
    Write-Host "❌ Missing FLOW_ADMIN_PRIVATE_KEY or FLOW_ADMIN_ADDRESS in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "📍 Deploying to account: $ADMIN_ADDRESS" -ForegroundColor Yellow

# Check if Flow CLI is installed
try {
    $null = flow version
    Write-Host "✅ Flow CLI is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Flow CLI not found. Please install Flow CLI first." -ForegroundColor Red
    Write-Host "Visit: https://developers.flow.com/tools/flow-cli/install" -ForegroundColor Yellow
    exit 1
}

# Read contract code
$contractPath = "flow\contracts\BookVerseNFT.cdc"
if (-not (Test-Path $contractPath)) {
    Write-Host "❌ Contract file not found: $contractPath" -ForegroundColor Red
    exit 1
}

$contractCode = Get-Content $contractPath -Raw
Write-Host "📝 Contract code loaded" -ForegroundColor Green

# Replace import paths with testnet addresses
$contractCode = $contractCode -replace 'from "\.\/standards\/NonFungibleToken\.cdc"', 'from 0x631e88ae7f1d7c20'
$contractCode = $contractCode -replace 'from "\.\/standards\/ViewResolver\.cdc"', 'from 0x631e88ae7f1d7c20'
$contractCode = $contractCode -replace 'from "\.\/standards\/MetadataViews\.cdc"', 'from 0x631e88ae7f1d7c20'

# Write processed contract
$contractCode | Out-File -FilePath "temp_contract.cdc" -Encoding UTF8 -NoNewline
Write-Host "📝 Contract processed for testnet" -ForegroundColor Green

# Create deployment transaction
$deployTx = @"
transaction(contractCode: String) {
    prepare(signer: AuthAccount) {
        signer.contracts.add(name: "BookVerseNFT", code: contractCode.utf8)
    }
}
"@

$deployTx | Out-File -FilePath "deploy.cdc" -Encoding UTF8 -NoNewline

# Create flow.json
$flowConfig = @{
    accounts = @{
        "admin" = @{
            address = $ADMIN_ADDRESS
            key = $ADMIN_PRIVATE_KEY
        }
    }
    networks = @{
        testnet = "access.devnet.nodes.onflow.org:9000"
    }
} | ConvertTo-Json -Depth 3

$flowConfig | Out-File -FilePath "flow.json" -Encoding UTF8
Write-Host "📄 Flow configuration created" -ForegroundColor Green

Write-Host "⏳ Deploying contract..." -ForegroundColor Yellow

# Deploy the contract
try {
    $contractCodeArg = $contractCode -replace '"', '\"'
    $result = flow transactions send deploy.cdc --arg "String:$contractCodeArg" --network testnet --signer admin
    
    Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
    Write-Host "Transaction: $result" -ForegroundColor Cyan
    
    # Update .env.local with contract address
    $envContent = Get-Content ".env.local" -Raw
    $envContent = $envContent -replace 'VITE_BOOKVERSE_CONTRACT_ADDRESS=0x0000000000000000', "VITE_BOOKVERSE_CONTRACT_ADDRESS=$ADMIN_ADDRESS"
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline
    
    Write-Host "🔧 Environment updated with contract address" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 BookVerse NFT contract deployed!" -ForegroundColor Green
    Write-Host "📍 Contract Address: $ADMIN_ADDRESS" -ForegroundColor Yellow
    Write-Host "🔗 View on Testnet: https://testnet.flowscan.org/account/$ADMIN_ADDRESS" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. npm run dev" -ForegroundColor White
    Write-Host "2. Connect your Flow wallet" -ForegroundColor White
    Write-Host "3. Set up NFT collection" -ForegroundColor White

} catch {
    Write-Host "💥 Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check that your account has sufficient FLOW tokens" -ForegroundColor Yellow
} finally {
    # Clean up
    Remove-Item "temp_contract.cdc" -ErrorAction SilentlyContinue
    Remove-Item "deploy.cdc" -ErrorAction SilentlyContinue
}