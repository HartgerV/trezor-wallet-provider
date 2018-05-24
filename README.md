# trezor-wallet-provider
Trezor wallet provider for the Web3 ProviderEngine, based on [ledger-wallet-provider](https://github.com/Neufund/ledger-wallet-provider) by Neufund.

# Installation

```
npm install trezor-wallet-provider --save
```

# Usage 
In order to have a working provider you can pass to your web3, you will need these additional dependencies installed:
```
npm install web3-provider-engine --save
npm install web3 --save
```
In your project, the provider is added like this:
```
import Web3 from 'web3';
import ProviderEngine from 'web3-provider-engine';
import WebsocketSubProvider from 'web3-provider-engine/subproviders/websocket';
import TrezorWalletSubProviderFactory from './providers/TrezorWalletSubprovider';

const trezorWalletSubProvider = await TrezorWalletSubProviderFactory(getNetworkId, path);
const engine = new ProviderEngine();
const web3 = new Web3(engine);
engine.addProvider(trezorWalletSubProvider);
engine.addProvider(new WebsocketSubProvider({ rpcUrl: RPC_URL }));
engine.start();

web3.eth.getAccounts(console.log);
```
When starting the provider, the user will be promted to enter a pin using the TREZOR connect interface. Please ensure popups are not blocked.

This provider currently supports getAccounts and signTransaction. Please note that both these actions require confirmation on the trezor device.