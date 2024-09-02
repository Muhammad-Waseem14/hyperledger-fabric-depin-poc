const { TextDecoder } = require('util');
const { connect } = require('@hyperledger/fabric-gateway');
const { newGrpcConnection, newIdentity, newSigner } = require('../services/climateService');
const config = require('../configs');

const utf8Decoder = new TextDecoder();

async function getGateway() {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });
    return gateway;
}

async function addClimateRecord(req, res) {
    const {
        deviceId,
        emissionSensorId,
        emissionAmount,
        emissionUnit,
        temperatureSensorId,
        temperatureValue,
        temperatureUnit,
        pollutionSensorId,
        pollutionLevel,
        pollutionUnit,
        timestamp,
    } = req.body;

    try {
        const gateway = await getGateway();
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);
        await contract.submitTransaction(
            'addClimateRecord',
            deviceId,
            emissionSensorId,
            emissionAmount,
            emissionUnit,
            temperatureSensorId,
            temperatureValue,
            temperatureUnit,
            pollutionSensorId,
            pollutionLevel,
            pollutionUnit,
            timestamp
        );

        gateway.close();
        res.status(200).send('Climate record added successfully');
    } catch (error) {
        console.error('Error in addClimateRecord:', error);
        res.status(500).send(error.message);
    }
}

async function updateClimateRecord(req, res) {
    const { recordId } = req.params;
    const {
        deviceId,
        emissionSensorId,
        emissionAmount,
        emissionUnit,
        temperatureSensorId,
        temperatureValue,
        temperatureUnit,
        pollutionSensorId,
        pollutionLevel,
        pollutionUnit,
        timestamp,
    } = req.body;

    try {
        const gateway = await getGateway();
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);
        await contract.submitTransaction(
            'updateClimateRecord',
            recordId,
            deviceId,
            emissionSensorId,
            emissionAmount,
            emissionUnit,
            temperatureSensorId,
            temperatureValue,
            temperatureUnit,
            pollutionSensorId,
            pollutionLevel,
            pollutionUnit,
            timestamp
        );

        gateway.close();
        res.status(200).send('Climate record updated successfully');
    } catch (error) {
        console.error('Error in updateClimateRecord:', error);
        res.status(500).send(error.message);
    }
}

async function getClimateRecord(req, res) {
    const { recordId } = req.params;

    try {
        const gateway = await getGateway();
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        const resultBytes = await contract.evaluateTransaction(
            'getClimateRecord',
            recordId
        );
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        gateway.close();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getClimateRecord:', error);
        res.status(500).send(error.message);
    }
}

async function getAllClimateRecords(req, res) {
    try {
        const gateway = await getGateway();
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);

        const resultBytes = await contract.evaluateTransaction(
            'getAllClimateRecords'
        );
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        gateway.close();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getAllClimateRecords:', error);
        res.status(500).send(error.message);
    }
}

module.exports = {
    addClimateRecord,
    updateClimateRecord,
    getClimateRecord,
    getAllClimateRecords,
};
