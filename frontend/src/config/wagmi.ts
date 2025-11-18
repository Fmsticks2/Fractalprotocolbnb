import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  bsc,
  bscTestnet,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Fractal Protocol',
  projectId: '9fa654a2da2a4bad48aea569aef06448', // Get this from https://cloud.walletconnect.com
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    // BNB Chain support
    bsc,
    ...(process.env.NODE_ENV === 'development' ? [bscTestnet, sepolia] : []),
  ],
  ssr: false, // If your dApp uses server side rendering (SSR)
});