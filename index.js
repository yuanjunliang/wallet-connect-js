import MetaMask from './src/eth/MetaMask'
import WalletConnector from './src/eth/WalletConnector'
import EOSWallet from 'eos-wallet-js'

// ETH chainIds
export const ChainIds = {
    MainNet: '0x1', // Ethereum Main Network (MainNet)
    Ropsten: '0x3', // Ropsten Test Network
    Rinkeby: '0x4', // Rinkeby Test Network
    Goerli: '0x5', // Goerli Test Network
    Kovan: '0x2a', // Kovan Test Network
}

export default {
    eth: {
        MetaMask,
        WalletConnector
    },
    eos: {
        EOSWallet
    }
}