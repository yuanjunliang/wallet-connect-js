import Web3 from 'web3';

export default class Wallet {
  constructor(chainId) {
    this.ethereum = null;
    this.selectedAddress = '';
    this.chainId = chainId || '0x1'; // default MainNet
    this.contract = {};
    this.web3 = {};
    this.type = 'MetaMask'
  }

  login() {
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
      ethereum.on('accountsChanged', this.accountsChanged.bind(this));
      ethereum.on('chainChanged', this.chainChanged.bind(this));
      ethereum.on('disconnect', this.disconnect.bind(this));

      ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          if (ethereum.chainId !== this.chainId) {
            reject(Error(`Please select the ${config.networkName[this.chainId]}`));
            return;
          }
          if (accounts.length > 0) {
            const selectedAddress = accounts[0];
            this.selectedAddress = selectedAddress;
            this.ethereum = ethereum;
            this.web3 = new Web3(this.ethereum);
            resolve(selectedAddress);
          } else {
            reject(Error('Please import your account to Metamask'));
          }
        }).catch(reject);
    });
  }

  accountsChanged(accounts) {
    this.selectedAddress = accounts.length ? accounts[0] : '';
    if (this.onAccountChanged) {
      this.onAccountChanged(this.selectedAddress);
    }
  }

  chainChanged(chainId) {
    this.chainId = chainId;
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

  /** public
   * 转账ETH
   * @param {*} to :收款账户
   * @param {*} value :转账金额，不需要处理精度
   */
  transfer (to,value) {
    const tx = {
      from: this.selectedAddress,
      to,
      value: BN(value).mul(1e18).toString(10)
    }
    return this.web3.sendTransaction(tx)
  }

  newContract(abi, contractAddress) {
    this.contract = new this.web3.eth.Contract(abi, contractAddress);
    return this.contract;
  }
}
