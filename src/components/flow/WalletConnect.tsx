import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, LogOut, Copy, ExternalLink, Coins, CheckCircle } from 'lucide-react';
import { useFlowWallet } from './FlowWalletProvider';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectProps {
  variant?: 'card' | 'inline' | 'button-only';
  showBalance?: boolean;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  variant = 'card',
  showBalance = true,
  onConnect,
  onDisconnect 
}) => {
  const { user, balance, connecting, connect, disconnect } = useFlowWallet();
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      if (user?.addr && onConnect) {
        onConnect(user.addr);
      }
      toast({
        title: "Wallet Connected!",
        description: "Successfully connected to Flow wallet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (onDisconnect) {
        onDisconnect();
      }
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
    }
  };

  const copyAddress = async () => {
    if (!user?.addr) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(user.addr);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to Copy",
        description: "Could not copy address to clipboard",
        variant: "destructive"
      });
    }
    setCopying(false);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openFlowScan = () => {
    if (user?.addr) {
      window.open(`https://testnet.flowscan.org/account/${user.addr}`, '_blank');
    }
  };

  // Button-only variant
  if (variant === 'button-only') {
    return user?.loggedIn ? (
      <Button variant="outline" onClick={handleDisconnect} className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        {formatAddress(user.addr || '')}
        <LogOut className="w-4 h-4" />
      </Button>
    ) : (
      <Button onClick={handleConnect} disabled={connecting} className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        {user?.loggedIn ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Connected
              </Badge>
              <span className="text-sm font-mono">{formatAddress(user.addr || '')}</span>
              {showBalance && (
                <span className="text-sm text-muted-foreground">
                  {balance} FLOW
                </span>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDisconnect}>
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={handleConnect} disabled={connecting}>
            <Wallet className="w-4 h-4 mr-2" />
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Flow Wallet
        </CardTitle>
        <CardDescription>
          Connect your Flow wallet to mint and manage your NFT rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.loggedIn ? (
          <>
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Wallet Connected Successfully</span>
                <Badge variant="secondary">Flow Testnet</Badge>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Address:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{formatAddress(user.addr || '')}</span>
                  <Button size="sm" variant="ghost" onClick={copyAddress} disabled={copying}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={openFlowScan}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {showBalance && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Balance:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-blue-500" />
                    <span className="font-mono text-sm">{balance} FLOW</span>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleDisconnect} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Connect your Flow wallet to start earning and redeeming NFT rewards. Your reading achievements will be minted as NFTs on the Flow blockchain.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleConnect} disabled={connecting} className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              {connecting ? 'Connecting to Flow Wallet...' : 'Connect Flow Wallet'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              New to Flow? <a href="https://wallet.flow.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Create a wallet</a>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};