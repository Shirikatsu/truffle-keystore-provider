# truffle-keystore-provider

Local keystore compatible Web3 provider to be used with Truffle. Used to unlock an account stored in a local keystore to be used for signing transactions. You will be prompted for a password
to unlock the account.

## Install

```
$ npm install --save truffle-keystore-provider
```

## Usage

In your `truffle.js` file:

```
const KeystoreProvider = require("truffle-keystore-provider")

module.exports = {
    rinkeby: {
        provider: KeystoreProvider("https://rinkeby.infura.io", PATH_TO_KEYSTORE_FILE, OPTIONAL_PASSWORD),
        network_id: 4
    }
}
```
