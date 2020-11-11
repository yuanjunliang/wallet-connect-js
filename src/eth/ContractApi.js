const WalletType = {
    MetaMask: 'MetaMask',
    WalletConnect: 'WalletConnect'
}

export default class ContractApi {
    constructor(abi, contractAddress, wallet) {
        this.wallet = wallet;
        this.from = wallet.selectedAddress;
        this.contract = null;
        this.web3 = wallet.web3
        this.abi = abi;
        this.contractAddress = contractAddress;
        this.walletType = wallet.type

        this.newContract();
    }

    newContract() {
        this.contract = new this.wallet.web3.eth.Contract(this.abi, this.contractAddress);
    }

    /** public
     * 转账ETH
     * @param {*} to :收款账户
     * @param {*} value :转账金额，不需要处理精度
     */
    transfer (to,value) {
        if (this.walletType === WalletType.MetaMask) {
            return this.mmtransfer(to,value)
        } else if (this.walletType === WalletType.WalletConnect) {
            return this.wctransfer(to,value)
        } else {
            throw Error('Only MetaMask or WalletConnect wallets are supported')
        }
    }

    /** public
     * 调用合约的send方法
     * @param {*} method 合约方法名
     * @param {*} params 参数数组[]
     */
    sendTransaction (method,params) {
        if (this.walletType === WalletType.MetaMask) {
            return this.mmsendTransaction(method,params)
        } else if (this.walletType === WalletType.WalletConnect) {
            return this.wcsendTransaction(method,params)
        } else {
            throw Error('Only MetaMask or WalletConnect wallets are supported')
        }
    }

    // 调用合约的查询方法
    callTransaction (method,params) {
        return this.contract.methods[method](...params).call({from: this.selectedAddress})
    }

    // WalletConnect转账ETH
    wctransfer (to,value) {
        const tx = {
            from: this.from,
            to,
            value: BN(value).mul(1e18).toString(10)
        }
        return this.wallet.connector.sendTransaction(tx)
    }

    // MetaMask转账ETH
    mmtransfer (to,value) {
        const tx = {
            from: this.from,
            to,
            value: BN(value).mul(1e18).toString(10)
        }
        return this.wallet.web3.sendTransaction(tx)
    }

    /**
     * WalletConnect调用合约方法
     * @param {*} method 合约方法名
     * @param {*} params 参数数组[]
     */
    wcsendTransaction (method,params) {
        const data = this.contract.methods[method](...params).encodeABI()
        const tx = {
            from: this.selectedAddress, // Required
            to: this.contractAddress, // Required (for non contract deployments)
            data, // Required
        };
        return this.wallet.connector.sendTransaction(tx)
    }

    /**
     * WalletConnect调用合约方法
     * @param {*} method 合约方法名
     * @param {*} params 参数数组[]
     */
    mmsendTransaction (method,params) {
        return this.contract.methods[method](...params).send({from: this.selectedAddress})
    }
}