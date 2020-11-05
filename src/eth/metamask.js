import Web3 from 'web3';

export default class Wallet {
  constructor(chainId) {
    this.web3Provider = null;
    this.selectedAddress = '';
    this.chainId = chainId || '0x1'; // default MainNet
    this.contract = {};
    this.web3 = {};
    this.networkVersion = chainId;
  }

  login() {
    const self = this;
    return new Promise((resolve, reject) => {
      if (typeof window.ethereum === 'undefined') {
        reject(Error('please install metamask'));
        return;
      }
      if (!window.ethereum.isMetaMask) {
        reject(Error('please install metamask'));
        return;
      }
      const { ethereum } = window;
      ethereum.on('accountsChanged', self.accountsChanged.bind(self));
      ethereum.on('chainChanged', self.chainChanged.bind(self));
      ethereum.on('disconnect', self.disconnect.bind(self));

      ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          if (ethereum.chainId !== chainId) {
            reject(Error(`Please select the ${config.networkName[chainId]}`));
            return;
          }
          if (accounts.length > 0) {
            const selectedAddress = accounts[0];
            self.selectedAddress = selectedAddress;
            self.web3Provider = ethereum;
            self.web3 = new Web3(this.web3Provider);
            resolve(selectedAddress);
          } else {
            reject(Error('Please import your account to Metamask'));
          }
        });
    });
  }

  accountsChanged(accounts) {
    this.selectedAddress = accounts.length ? accounts[0] : '';
    if (this.onAccountChanged) {
      this.onAccountChanged(this.selectedAddress);
    }
  }

  chainChanged(chainId) {
    this.networkVersion = chainId;
    if (this.onNetworkChanged) {
      this.onNetworkChanged(chainId);
    }
  }

  disconnect() {
    if (this.disconnect) {
      this.disconnect();
    }
  }

  logout() {
    this.selectedAddress = '';
    this.web3 = {};
    this.contract = {};
  }

  newContract(abi, contractAddress) {
    this.contract = new this.web3.eth.Contract(abi, contractAddress);
    return this.contract;
  }
}
