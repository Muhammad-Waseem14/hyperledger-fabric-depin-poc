const fs = require('fs/promises');
const crypto = require('crypto');
const { signers } = require('@hyperledger/fabric-gateway');
const config = require('../config');
const { getFirstDirFileName } = require('../utils/fileUtils');

async function newSigner() {
    const keyPath = await getFirstDirFileName(config.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

module.exports = { newSigner };
