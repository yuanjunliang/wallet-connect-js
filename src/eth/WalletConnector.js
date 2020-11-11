import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Web3 from 'web3';
import ethers from 'ethers';
import BN from 'bignumber.js-ext';

const defaultParams = {
  infuraId: '',
};

// Ethers Network
const EthersNetwork = {
  1: 'homestead', // 0x1
  3: 'ropsten', // 0x3
  4: 'rinkeby', // 0x4
  5: 'goerli', // 0x5
  42: 'kovan', // 0x2a
};

export default class WalletConnector {
  constructor() {
    this.connector = null;
    this.web3 = null;
    this.chainId = '0x1';
    this.selectedAddress = '';
    this.type = 'WalletConnect';
  }

  login(params = defaultParams) {
    const { infuraId } = params;
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
      const { _accounts, _chainId } = connector;
      const cid = _chainId;

      // init web3
      if (infuraId) {
        this.web3 = new Web3(`https://kovan.infura.io/v3/${infuraId}`);
      } else {
        const provider = ethers.getDefaultProvider(EthersNetwork[cid]);
        const web3 = new Web3(provider.providerConfigs[0].provider.connection.url);
        this.web3 = web3;
      }

      if (_accounts && _accounts.length > 0) {
        const selectedAddress = _accounts[0];
        this.selectedAddress = selectedAddress;
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
    });
  }

  logout() {
    localStorage.removeItem('walletconnect');
    this.connector = null;
    this.web3 = null;
  }

  // 实例化合约
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
    return this.connector.sendTransaction(tx);
  }
}
