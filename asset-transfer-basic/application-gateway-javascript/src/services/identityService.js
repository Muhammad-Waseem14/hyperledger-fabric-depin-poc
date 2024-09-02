const fs = require('fs/promises');
const config = require('../configs');
const { getFirstDirFileName } = require('../utils/fileUtils');

async function newIdentity() {
    const certPath = await getFirstDirFileName(config.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: config.mspId, credentials };
}

module.exports = { newIdentity };
