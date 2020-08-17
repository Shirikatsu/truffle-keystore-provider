const path = require("path")
const fs = require("fs")
const ProviderEngine = require("web3-provider-engine")
const FiltersSubprovider = require("web3-provider-engine/subproviders/filters.js")
const WalletSubprovider = require("web3-provider-engine/subproviders/wallet.js")
const ProviderSubprovider = require("web3-provider-engine/subproviders/provider.js")
const NonceSubprovider = require("web3-provider-engine/subproviders/nonce-tracker.js")
const Web3 = require("web3")
const ethereumjsWallet = require("ethereumjs-wallet")
const keythereum = require("keythereum")
const prompt = require("prompt-sync")()

function TruffleKeystoreProvider(dataDir, providerUrl) {
    console.log(`Using keystore file: ${dataDir}`)
    console.log(`Please unlock your account`)
    const password = prompt("Password: ", { echo: "" })
    const keyObj = JSON.parse(fs.readFileSync(dataDir))

    this.wallet = ethereumjsWallet.fromPrivateKey(keythereum.recover(password, keyObj))
    this.address = keyObj.address

    this.engine = new ProviderEngine()
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new NonceSubprovider())
    this.engine.addProvider(new WalletSubprovider(this.wallet, {}))
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
    this.engine.addProvider(new ProviderSubprovider(new Web3.providers.HttpProvider(providerUrl)))
    this.engine.start()
}

TruffleKeystoreProvider.prototype.sendAsync = function() {
    this.engine.sendAsync.apply(this.engine, arguments)
}

TruffleKeystoreProvider.prototype.send = function() {
    return this.engine.send.apply(this.engine, arguments)
}

module.exports = TruffleKeystoreProvider
