const path = require("path")
const fs = require("fs")
const ProviderEngine = require("web3-provider-engine")
const FiltersSubprovider = require("web3-provider-engine/subproviders/filters.js")
const WalletSubprovider = require("web3-provider-engine/subproviders/wallet.js")
const ProviderSubprovider = require("web3-provider-engine/subproviders/provider.js")
const NonceSubprovider = require("web3-provider-engine/subproviders/nonce-tracker.js")
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc');
const Web3 = require("web3")
const ethereumjsWallet = require("ethereumjs-wallet")
const keythereum = require("keythereum")
const prompt = require("prompt-sync")()

function truffleKeystoreProvider(providerUrl, dataDir, password) {
    console.log(`Using keystore file: ${dataDir}`)
    let pass = password
    if (typeof password == 'undefined' && !password) {
        console.log(`Please unlock your account`)
        pass = prompt("Password: ", { echo: "" })
    }
    
    const keyObj = JSON.parse(fs.readFileSync(dataDir))

    this.wallet = ethereumjsWallet.fromPrivateKey(keythereum.recover(pass, keyObj))
    this.address = keyObj.address

    this.engine = new ProviderEngine()
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new NonceSubprovider())
    this.engine.addProvider(new WalletSubprovider(this.wallet, {}))
    this.engine.addProvider(new RpcSubprovider({ rpcUrl: providerUrl }));
    // Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    // this.engine.addProvider(new ProviderSubprovider(new Web3.providers.HttpProvider(providerUrl)))
    this.engine.start()
}

truffleKeystoreProvider.prototype.sendAsync = function() {
    this.engine.sendAsync.apply(this.engine, arguments)
}

truffleKeystoreProvider.prototype.send = function() {
    return this.engine.sendAsync.apply(this.engine, arguments)
}

const memoizeKeystoreProviderCreator = () => {
  let providers = {}

  return (providerUrl, dataDir, password) => {
    if (providerUrl in providers) {
      return providers[providerUrl]
    } else {
      const provider = new truffleKeystoreProvider(providerUrl, dataDir, password)
      providers[providerUrl] = provider
      return provider
    }
  }
}

const CreateKeystoreProvider = memoizeKeystoreProviderCreator()

module.exports = CreateKeystoreProvider
