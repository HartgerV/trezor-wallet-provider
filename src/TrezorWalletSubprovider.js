import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import TrezorWallet from './TrezorWallet';

export default async function (
  getNetworkId,
  pathOverride,
) {
  const trezor = new TrezorWallet(
    getNetworkId,
    pathOverride,
  );

  return new HookedWalletSubprovider(trezor);
}
