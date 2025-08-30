# BookVerse Contract Deployment Script (PowerShell)
# Run with: .\deploy-contract.ps1

Write-Host "🚀 Starting BookVerse NFT contract deployment..." -ForegroundColor Green

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Environment variables loaded from .env.local" -ForegroundColor Green
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
    $flowVersion = flow version 2>$null
    Write-Host "✅ Flow CLI is available: $flowVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Flow CLI not found. Please install Flow CLI first:" -ForegroundColor Red
    Write-Host "   Visit: https://developers.flow.com/tools/flow-cli/install" -ForegroundColor Yellow
    exit 1
}

# Read and process contract code
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

# Write processed contract to temp file
$tempContractPath = "temp_contract.cdc"
$contractCode | Out-File -FilePath $tempContractPath -Encoding UTF8
Write-Host "📝 Contract code processed for testnet deployment" -ForegroundColor Green

# Create flow.json configuration
$flowConfig = @{
    accounts = @{
        "testnet-account" = @{
            address = $ADMIN_ADDRESS
            key = $ADMIN_PRIVATE_KEY
        }
    }
    contracts = @{
        "BookVerseNFT" = @{
            source = "./temp_contract.cdc"
            aliases = @{
                testnet = $ADMIN_ADDRESS
            }
        }
    }
    networks = @{
        testnet = "access.devnet.nodes.onflow.org:9000"
    }
    deployments = @{
        testnet = @{
            "testnet-account" = @("BookVerseNFT")
        }
    }
} | ConvertTo-Json -Depth 10

$flowConfig | Out-File -FilePath "flow.json" -Encoding UTF8
Write-Host "📄 Flow configuration updated" -ForegroundColor Green

# Deploy using Flow CLI
Write-Host "⏳ Deploying contract to Flow testnet..." -ForegroundColor Yellow

try {
    # Deploy the contract
    $deployResult = flow project deploy --network testnet 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contract deployment successful!" -ForegroundColor Green
        Write-Host "📋 Deployment result: $deployResult" -ForegroundColor Cyan
        
        # Update environment file with contract address
        $envContent = Get-Content ".env.local" -Raw
        $envContent = $envContent -replace 'VITE_BOOKVERSE_CONTRACT_ADDRESS=0x0000000000000000', "VITE_BOOKVERSE_CONTRACT_ADDRESS=$ADMIN_ADDRESS"
        $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
        
        Write-Host "🔧 Environment file updated with contract address" -ForegroundColor Green
        
        # Clean up temp file
        Remove-Item $tempContractPath -ErrorAction SilentlyContinue
        
        Write-Host "`n🎉 BookVerse NFT contract deployed successfully!" -ForegroundColor Green
        Write-Host "📍 Contract Address: $ADMIN_ADDRESS" -ForegroundColor Yellow
        Write-Host "🔗 View on Flow Testnet: https://testnet.flowscan.org/account/$ADMIN_ADDRESS" -ForegroundColor Cyan
        
        Write-Host "`n🎊 Deployment Complete! Next steps:" -ForegroundColor Green
        Write-Host "1. Start your development server: npm run dev" -ForegroundColor White
        Write-Host "2. Connect your Flow wallet in the app" -ForegroundColor White
        Write-Host "3. Set up your NFT collection" -ForegroundColor White
        Write-Host "4. Test achievement NFT minting" -ForegroundColor White
        
    } else {
        Write-Host "⚠️ Flow CLI deployment failed, trying alternative method..." -ForegroundColor Yellow
        Write-Host "Error: $deployResult" -ForegroundColor Red
        
        # Alternative: Manual transaction approach
        Write-Host "📝 Creating deployment transaction..." -ForegroundColor Yellow
        
        $deployTransaction = @"
transaction(contractCode: String) {
    prepare(signer: AuthAccount) {
        signer.contracts.add(name: "BookVerseNFT", code: contractCode.utf8)
    }
}
"@
        
        $deployTransaction | Out-File -FilePath "deploy-transaction.cdc" -Encoding UTF8
        
        # Escape quotes in contract code for command line
        $escapedContractCode = $contractCode -replace '"', '\"'
        
        # Try to deploy using transaction
        $txResult = flow transactions send deploy-transaction.cdc --arg "String:$escapedContractCode" --network testnet --signer testnet-account 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Contract deployed via transaction!" -ForegroundColor Green
            Write-Host "📋 Transaction result: $txResult" -ForegroundColor Cyan
            
            # Update environment file
            $envContent = Get-Content ".env.local" -Raw
            $envContent = $envContent -replace 'VITE_BOOKVERSE_CONTRACT_ADDRESS=0x0000000000000000', "VITE_BOOKVERSE_CONTRACT_ADDRESS=$ADMIN_ADDRESS"
            $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
            
            Write-Host "🎉 Deployment successful via transaction method!" -ForegroundColor Green
        } else {
            Write-Host "💥 Transaction deployment also failed: $txResult" -ForegroundColor Red
            throw "Both deployment methods failed"
        }
        
        # Clean up
        Remove-Item "deploy-transaction.cdc" -ErrorAction SilentlyContinue
    }
    
} catch {
    Write-Host "💥 Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔍 Check your Flow account has sufficient FLOW tokens for deployment" -ForegroundColor Yellow
    Write-Host "🔍 Verify your private key and address are correct in .env.local" -ForegroundColor Yellow
    exit 1
} finally {
    # Clean up temp files
    Remove-Item $tempContractPath -ErrorAction SilentlyContinue
}

Write-Host "`n🚀 Ready to launch BookVerse!" -ForegroundColor Green