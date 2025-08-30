import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as fcl from '@onflow/fcl';
import { initializeFlow } from '@/lib/flow/config';

interface FlowUser {
  addr?: string;
  cid?: string;
  loggedIn?: boolean;
  services?: any[];
}

interface FlowWalletContextType {
  user: FlowUser | null;
  balance: string;
  loading: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (cadence: string, args?: any[], gasLimit?: number) => Promise<string>;
  executeScript: (cadence: string, args?: any[]) => Promise<any>;
}

const FlowWalletContext = createContext<FlowWalletContextType | undefined>(undefined);

export const useFlowWallet = () => {
  const context = useContext(FlowWalletContext);
  if (!context) {
    throw new Error('useFlowWallet must be used within FlowWalletProvider');
  }
  return context;
};

interface FlowWalletProviderProps {
  children: ReactNode;
}

export const FlowWalletProvider: React.FC<FlowWalletProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FlowUser | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Initialize Flow configuration
    initializeFlow();

    // Subscribe to authentication state changes
    const unsubscribe = fcl.currentUser.subscribe((user: FlowUser) => {
      setUser(user.loggedIn ? user : null);
      setLoading(false);
      
      if (user.loggedIn && user.addr) {
        fetchBalance(user.addr);
      } else {
        setBalance('0.00');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchBalance = async (address: string) => {
    try {
      const script = `
        import FlowToken from 0xFlowToken

        access(all) fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vaultRef = account.capabilities.borrow<&FlowToken.Vault>(/public/flowTokenBalance)
            ?? panic("Could not borrow Balance reference to the Vault")
          return vaultRef.balance
        }
      `;

      const balance = await fcl.query({
        cadence: script,
        args: [fcl.arg(address, fcl.t.Address)]
      });

      setBalance((parseFloat(balance) / 100000000).toFixed(2));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('0.00');
    }
  };

  const connect = async () => {
    try {
      setConnecting(true);
      await fcl.authenticate();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const sendTransaction = async (
    cadence: string, 
    args: any[] = [], 
    gasLimit: number = 1000
  ): Promise<string> => {
    if (!user?.addr) {
      throw new Error('No wallet connected');
    }

    try {
      const transactionId = await fcl.mutate({
        cadence,
        args,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: gasLimit
      });

      // Wait for transaction to be sealed
      const transaction = await fcl.tx(transactionId).onceSealed();
      
      if (transaction.status === 4) {
        // Refresh balance after successful transaction
        await fetchBalance(user.addr);
        return transactionId;
      } else {
        throw new Error(`Transaction failed: ${transaction.errorMessage}`);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const executeScript = async (cadence: string, args: any[] = []): Promise<any> => {
    try {
      const result = await fcl.query({
        cadence,
        args
      });
      return result;
    } catch (error) {
      console.error('Script execution failed:', error);
      throw error;
    }
  };

  const value: FlowWalletContextType = {
    user,
    balance,
    loading,
    connecting,
    connect,
    disconnect,
    sendTransaction,
    executeScript,
  };

  return (
    <FlowWalletContext.Provider value={value}>
      {children}
    </FlowWalletContext.Provider>
  );
};