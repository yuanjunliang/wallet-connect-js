import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Web3 from 'web3';

export default class WalletConnector {
  constructor() {
    this.connector = null;
    this.web3 = null;
    this.chainId = '0x1';
    this.selectedAddress = '';
  }

  login() {
    return new Promise((resolve, reject) => {
      const connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org', // Required
        qrcodeModal: QRCodeModal,
      });
      if (!connector.connected) {
        // create new session
        connector.createSession();
      }
      this.connector = connector;
      const { _accounts } = connector;
      if (_accounts && _accounts.length > 0) {
        const selectedAddress = _accounts[0];
        console.log('selectedAddress', selectedAddress);
        resolve(selectedAddress);
      }
      connector.on('connect', (error, payload) => {
        if (error) {
          reject(error);
          return;
        }
        const { accounts, chainId } = payload.params[0];
        const selectedAddress = accounts[0];
        this.selectedAddress = selectedAddress;
        this.chainId = chainId;
        resolve(selectedAddress);
      });

      const web3 = new Web3(Web3.getDefaultProvider);
      this.web3 = web3;
    });
  }

  logout() {
    localStorage.removeItem('walletconnect');
    this.connector = null;
    this.web3 = null;
  }
}
