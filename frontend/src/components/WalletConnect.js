"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { User, Wallet } from 'lucide-react';

export default function WalletConnect({ onConnect }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    // Auto-connect if permission already granted
    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(handleAccountsChanged)
                .catch(console.error);

            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        return () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        }
    }, []);

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            if (onConnect) onConnect(address);
            fetchBalance(address);
        } else {
            setWalletAddress(null);
            setBalance(null);
            if (onConnect) onConnect(null);
        }
    };

    const fetchBalance = async (address) => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const bal = await provider.getBalance(address);
                setBalance(ethers.formatEther(bal));
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    };

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                handleAccountsChanged(accounts);
            } catch (err) {
                console.warn("Wallet connection failed:", err);
                if (err.code === 4001) {
                    setError("Connection rejected");
                } else {
                    setError("Connection failed");
                }
            }
        } else {
            // Fallback for demo purposes if no wallet found
            console.log("MetaMask unavailable. Using Demo Wallet.");
            setTimeout(() => {
                const demoAddress = "0x71C...93F2";
                setWalletAddress(demoAddress);
                setBalance("1,000.00");
                if (onConnect) onConnect(demoAddress);
            }, 500);
        }
        setIsConnecting(false);
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        setBalance(null);
        if (onConnect) onConnect(null);
    };

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={walletAddress ? disconnectWallet : connectWallet}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${walletAddress
                    ? 'bg-slate-700 text-green-400 border border-green-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                    }`}
            >
                {walletAddress ? (
                    <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-mono">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4" />
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </>
                )}
            </button>
            {walletAddress && balance && (
                <div className="text-xs text-slate-400 mt-1 mr-1 font-mono">
                    {parseFloat(balance).toFixed(4)} QIE
                </div>
            )}
            {error && (
                <div className="text-xs text-red-400 mt-1 mr-1">
                    {error}
                </div>
            )}
        </div>
    );
}
