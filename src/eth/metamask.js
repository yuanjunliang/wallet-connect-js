import Web3 from 'web3';
import BN from 'bignumber.js-ext';

const NetworkName = {
  '0x1': 'MainNetwork', // Ethereum Main Network (MainNet)
  '0x3': 'RopstenNetwork', // Ropsten Test Network
  '0x4': 'RinkebyNetwork', // Rinkeby Test Network
  '0x5': 'GoerliNetwork', // Goerli Test Network
  '0x2a': 'KovanNetwork', // Kovan Test Network
  '0x1691': 'LocalhostNetword', // Localhost Test Network
};

const defaultConfig = {
  chainId: '0x1',
  networkName: NetworkName,
};

export default class Wallet {
  constructor(config = defaultConfig) {
    this.ethereum = null;
    this.selectedAddress = '';
    this.chainId = config.chainId; // default MainNet
    this.networkName = config.networkName;
    this.contract = {};
    this.web3 = {};
    this.type = 'MetaMask';
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
            reject(Error(`Please select the ${this.networkName[this.chainId]}`));
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

  newContract(abi, contractAddress) {
    this.contract = new this.web3.eth.Contract(abi, contractAddress);
    return this.contract;
  }

  /** public
   * 转账ETH
   * @param {*} to :收款账户
   * @param {*} value :转账金额，不需要处理精度
   */
  transfer(to, value) {
    const tx = {
      from: this.selectedAddress,
      to,
      value: BN(value).mul(1e18).toString(10),
    };
    return this.web3.eth.sendTransaction(tx);
  }
}
