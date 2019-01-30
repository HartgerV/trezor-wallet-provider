import HookedWalletSubprovider from './hooked-wallet';
import TrezorWallet from './TrezorWallet';

export default async function (
  networkId,
  accountsOffset,
  accountsQuantity,
  eventEmitter
) {
  if(networkId == null) {
    networkId = 1; //default to mainnet network id
  }
  const trezor = new TrezorWallet(
    networkId,
    accountsOffset,
    accountsQuantity,
    eventEmitter,
  );

  return new HookedWalletSubprovider(trezor);
}
