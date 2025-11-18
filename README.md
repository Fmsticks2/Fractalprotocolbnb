# 🪞 Fractal Protocol

### *Evolving Prediction Markets for a Dynamic World*

Fractal Protocol is an AI-enhanced **prediction market platform** where each event dynamically spawns new, conditional sub-markets based on its outcome — forming an evolving, tree-like network of interrelated predictions.

This repository now targets **BNB Chain (EVM)** for smart contracts, using Hardhat for development, deployment, and testing.

## 🎯 Key Features

- **Dynamic Market Creation**: Create prediction markets with automatic sub-market spawning
- **Cross-Chain Messaging**: Seamless communication between markets using Linera's stack
- **AI Integration**: AI agents act as Market Architects and Liquidity Providers
- **Interactive Visualization**: Beautiful tree-like visualization of market relationships
- **Instant Finality**: Fast, low-cost transactions with predictable outcomes

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Smart Contracts (BNB Chain / EVM)
    ├── Market Contract
    └── Market Factory
    ↓
Backend Services
    ├── AI Agent Layer
    └── Oracle System
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- A BSC RPC endpoint and a funded testnet wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fractal-protocol

# Install dependencies
npm install

# Build EVM smart contracts for BNB Chain
cd evm
npm install
npm run compile

# Deploy to BSC Testnet (optional)
# Ensure you set BSC_TESTNET_RPC and BSC_PRIVATE_KEY in evm/.env
npx hardhat run --network bscTestnet scripts/deploy.ts

# Start frontend dev server
cd ../frontend
npm run dev
```

## 📁 Project Structure

```
fractal-protocol/
├── evm/                # EVM smart contracts (BNB Chain)
│   ├── contracts/      # Solidity contracts (Market, MarketFactory)
│   ├── scripts/        # Deployment scripts
│   └── hardhat.config.ts
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API and blockchain services
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── backend/            # Optional backend services
│   ├── ai-agent/       # AI market architect
│   └── oracle/         # Oracle service
└── docs/               # Documentation
```

## 🧪 Development Waves

- **Wave 1**: Foundation - Single market prototype ✅
- **Wave 2**: Spawning Mechanism - Dynamic sub-market creation 🚧
- **Wave 3**: Functional Product - Multi-market demo
- **Wave 4**: Polished Experience - Graph visualization
- **Wave 5**: Intelligent Platform - AI agent integration
- **Wave 6**: Scalable Ecosystem - Mainnet readiness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](./docs/)
- [Project Roadmap](./docs/roadmap.md)