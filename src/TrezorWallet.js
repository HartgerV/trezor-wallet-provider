import EthereumTx from 'ethereumjs-tx';
import TrezorConnect from 'trezor-connect';

export default class TrezorWallet {
  constructor(networkId, path) {
    this.networkId = networkId; // Function which should return networkId
    this.getAccounts = this.getAccounts.bind(this);
    this.signTransaction = this.signTransaction.bind(this);
    this.setDerivationPath = this.setDerivationPath.bind(this);
    this.setDerivationPath(path);
  }

  setDerivationPath(path) {
    const newPath = path || "44'/60'/0'/0"; // default path for trezor

    this.path = newPath;
  }

  static obtainPathComponentsFromDerivationPath(derivationPath) {
    // check if derivation path follows 44'/60'/x'/n pattern
    const regExp = /^(44'\/6[0|1]'\/\d+'?\/)(\d+)$/;
    const matchResult = regExp.exec(derivationPath);
    if (matchResult === null) {
      throw new Error(
        "To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ",
      );
    }

    return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
  }

  async signTransactionAsync(txData) {
    return new Promise((resolve, reject) => {
      //// Uncomment for debugging purposes:
      // TrezorConnect.closeAfterFailure(false);
      // TrezorConnect.closeAfterSuccess(false);

      // Set the EIP155 bits
      const tx = new EthereumTx(txData);
      tx.raw[6] = Buffer.from([this.networkId]); // v
      tx.raw[7] = Buffer.from([]); // r
      tx.raw[8] = Buffer.from([]); // s

      TrezorConnect.ethereumSignTx(
        this.path,
        TrezorWallet.makeHexEven(txData.nonce),
        TrezorWallet.makeHexEven(txData.gasPrice),
        TrezorWallet.makeHexEven(txData.gas),
        TrezorWallet.makeHexEven(txData.to),
        TrezorWallet.makeHexEven(txData.value),
        TrezorWallet.makeHexEven(txData.data),
        this.networkId,
        (r) => {
          console.log(r);
          if (r.success) {
            console.log(typeof r.v);
            tx.v = Buffer.from(r.v.toString(16), 'hex');
            tx.r = Buffer.from(r.r, 'hex');
            tx.s = Buffer.from(r.s, 'hex');
          } else {
            reject(r.error); // error message
          }
          console.log(`0x${tx.serialize().toString('hex')}`);
          // return signed transaction
          resolve(`0x${tx.serialize().toString('hex')}`);
        });
    });
  }

  // Prepend 0 in case of uneven hex char count
  static makeHexEven(input) {
    console.log(input);
    let output;
    if (input.length % 2 !== 0) {
      output = `0${input.slice(2)}`;
    } else {
      output = input.slice(2);
    }
    console.log(output);
    return output;
  }

  /**
     * Gets a list of accounts from a device - currently it's returning just
     * first one according to derivation path
     * @param {failableCallback} callback
     */
  getAccounts(callback) {
    TrezorConnect.ethereumGetAddress(this.path, (result) => {
      if (result.success) {
        callback(null, [`0x${result.address}`]);
      } else {
        callback(new Error('failed to get address from trezor'), null);
      }
    });
  }

  /**
     * Signs txData in a format that ethereumjs-tx accepts
     * @param {object} txData - transaction to sign
     * @param {failableCallback} callback - callback
     */
  signTransaction(txData, callback) {
    this.signTransactionAsync(txData)
      .then(res => callback(null, res))
      .catch(err => callback(err, null));
  }

  // signMessage(txData, callback) {
  //     this.signMessageAsync(txData)
  //         .then(res => callback(null, res))
  //         .catch(err => callback(err, null));
  // }
}
