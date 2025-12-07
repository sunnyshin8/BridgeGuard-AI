# 🌉 BridgeGuard AI

**AI x Blockchain Hackathon Submission**

Real-time anomaly detection for cross-chain bridges using machine learning and smart contracts.

## 🎯 What is BridgeGuard AI?

An intelligent system that monitors cross-chain bridge transactions in real-time, detecting exploits and anomalies using advanced ML models, with automated smart contract responses powered by QIE V3 validators.

## 🚀 Features

- ✅ Real-time transaction monitoring
- ✅ AI-powered anomaly detection (95%+ accuracy)
- ✅ Smart contract automation
- ✅ QIE V3 validator integration
- ✅ Live dashboard monitoring

## 🛠️ Tech Stack

- **Backend:** Python, Flask, Web3.py
- **ML:** scikit-learn (Isolation Forest)
- **Blockchain:** Solidity, Hardhat, QIE V3
- **Frontend:** HTML, CSS, JavaScript, TailwindCSS

## 🔗 Useful Links

### QIE Documentation
- [QIE Install Node](https://docs.qie.digital/how-to-become-a-validator-on-qie-v3/2.-install-qie-node) - Complete guide for installing QIE node
- [QIE Validator Guide](https://docs.qie.digital/how-to-become-a-validator-on-qie-v3) - How to become a validator on QIE V3
- [QIE Docs](https://docs.qie.digital) - Official QIE documentation
- [QIEDex](https://dex.qie.digital) - QIE decentralized exchange

### Development Resources
- [Hardhat](https://hardhat.org/docs) - Ethereum development environment
- [Web3.py](https://web3py.readthedocs.io) - Python library for interacting with Ethereum

## 📋 Getting Started with QIE Node

For setting up and managing a QIE blockchain validator node, see:
- **[QIE Node Setup Guide](./docs/QIE_NODE_SETUP.md)** - Complete setup instructions
- **[QIE Quick Reference](./docs/QIE_QUICK_REFERENCE.md)** - Commands and configuration
- **[QIE Implementation Summary](./docs/QIE_IMPLEMENTATION_SUMMARY.md)** - Technical details

### Quick QIE Setup
```bash
# Verify system requirements
bash scripts/verify_qie_setup.sh

# Complete setup (install + init + configure)
bash scripts/setup_qie_validator.sh

# Start the node
qied start --home ~/.qieMainnetNode

# Test Python manager module
python backend/test_qie_node_manager.py
```

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone