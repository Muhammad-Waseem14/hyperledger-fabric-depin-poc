const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

// Path to user private key directory.
const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

// Path to user certificate directory.
const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

// Path to peer tls certificate.
const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    cors({
        origin: 'http://localhost:3000',
    })
);

function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

async function newSigner() {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

async function getGateway() {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });
    return gateway;
}

app.get('/getAllClimateRecords', async (req, res) => {
    try {
        const gateway = await getGateway();
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        const resultBytes = await contract.evaluateTransaction(
            'getAllClimateRecords'
        );

        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        gateway.close();
        res.status(200).json(result);
    } catch (error) {
        // Check if the error has a 'details' property from the Fabric SDK
        if (error.details && error.details.length > 0) {
            const fabricError = error.details[0].message;
            res.status(500).send(fabricError);
        } else {
            // Fallback to the generic error message
            res.status(500).send(error.message || 'An unknown error occurred');
        }
    }
});

app.post('/recordClimateData', async (req, res) => {
    const { deviceId, emissions, temperature, pollution } = req.body;
    console.log('req.body', req.body);
    const {
        sensorId: emissionSensorId,
        amount: emissionAmount,
        unit: emissionUnit,
    } = emissions || {};
    const {
        sensorId: temperatureSensorId,
        value: temperatureValue,
        unit: temperatureUnit,
    } = temperature || {};
    const {
        sensorId: pollutionSensorId,
        level: pollutionLevel,
        unit: pollutionUnit,
    } = pollution || {};
    const timestamp = new Date().toISOString();

    try {
        const gateway = await getGateway();
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        await contract.submitTransaction(
            'addClimateRecord',
            deviceId,
            emissionSensorId,
            emissionAmount.toString(),
            emissionUnit,
            temperatureSensorId,
            temperatureValue.toString(),
            temperatureUnit,
            pollutionSensorId,
            pollutionLevel.toString(),
            pollutionUnit,
            timestamp
        );

        gateway.close();
        res.status(200).send('Transaction committed successfully');
    } catch (error) {
        console.error('Error in creating record:', error);

        // Check if the error has a 'details' property from the Fabric SDK
        if (error.details && error.details.length > 0) {
            const fabricError = error.details[0].message;
            res.status(500).send(fabricError);
        } else {
            // Fallback to the generic error message
            res.status(500).send(error.message || 'An unknown error occurred');
        }
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
