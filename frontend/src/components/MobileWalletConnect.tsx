"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";

// Mobile-specific wallet connection enhancements
export function MobileWalletConnect() {
  useEffect(() => {
    // Add mobile-specific optimizations
    if (typeof window !== 'undefined') {
      // Detect if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Add viewport meta tag for better mobile experience
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Prevent zoom on input focus (common mobile issue)
        document.addEventListener('focusin', (e) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
              viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
          }
        });
      }
    }
  }, []);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-gradient-to-r from-red-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95"
                    style={{
                      // Mobile-optimized button styling
                      minHeight: '48px', // Minimum touch target size
                      fontSize: '16px', // Prevent zoom on iOS
                      WebkitTapHighlightColor: 'transparent', // Remove tap highlight
                    }}
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button 
                    onClick={openChainModal} 
                    type="button"
                    className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold"
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-full text-sm"
                    type="button"
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium"
                    style={{ minHeight: '48px', fontSize: '16px' }}
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
