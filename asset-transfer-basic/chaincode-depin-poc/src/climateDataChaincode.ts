import { MD5 } from 'crypto-js';

import { Context, Contract } from 'fabric-contract-api';

import { serialize, deserialize, validateClimateRecord } from './utils';
import { ClimateRecordInterface, EmissionsUnits, TemperatureUnits, PollutionUnits } from './constants';


export class ClimateDataContract extends Contract {
    /**
     * Adds a new climate record to the ledger.
     * @param ctx - The transaction context.
     * @param deviceId - The ID of the device.
     * @param emissionSensorId - The ID of the emission sensor.
     * @param emissionAmount - The amount of emissions.
     * @param emissionUnit - The unit of measurement for emissions.
     * @param temperatureSensorId - The ID of the temperature sensor.
     * @param temperatureValue - The temperature value.
     * @param temperatureUnit - The unit of measurement for temperature.
     * @param pollutionSensorId - The ID of the pollution sensor.
     * @param pollutionLevel - The pollution level.
     * @param pollutionUnit - The unit of measurement for pollution.
     * @param timestamp - The timestamp of the record.
     */
    async addClimateRecord(
        ctx: Context, 
        deviceId: string, 
        emissionSensorId: string, 
        emissionAmount: string, 
        emissionUnit: EmissionsUnits,
        temperatureSensorId: string,
        temperatureValue: string,
        temperatureUnit: TemperatureUnits,
        pollutionSensorId: string,
        pollutionLevel: string,
        pollutionUnit: PollutionUnits,
        timestamp: string
    ) {
        try {

            /* An example of writing access logic
                const clientIdentity = ctx.clientIdentity;
                const clientOrg = clientIdentity.getMSPID();

                if (clientOrg !== 'Org1MSP') {
                    throw new Error('Only Org1MSP members are authorized to add climate records.');
                }
            */
        

            // Generate a unique record ID
            const recordId = MD5(deviceId + timestamp).toString();
    
            const record: ClimateRecordInterface = {
                recordId,
                deviceId,
                emissions: {
                    sensorId:emissionSensorId,
                    amount: parseFloat(emissionAmount),
                    unit: emissionUnit,
                },
                temperature : {
                    sensorId: temperatureSensorId,
                    value: parseFloat(temperatureValue),
                    unit: temperatureUnit
                },
                pollution: {
                    sensorId: pollutionSensorId,
                    level: parseFloat(pollutionLevel),
                    unit: pollutionUnit
                },
                timestamp
            };
    
            // Validate the record before saving
            validateClimateRecord(record);
    
            await ctx.stub.putState(recordId, serialize(record));
    
        } catch (error) {
            console.error(`Error in addClimateRecord: ${error}`);
            throw new Error(`Failed to add climate record: ${error}`);
        }
    }
    
      /**
     * Updates an existing climate record in the ledger.
     * @param ctx - The transaction context.
     * @param recordId: The unique ID of the climate record to update.
     * @param deviceId - The ID of the device.
     * @param emissionSensorId - The ID of the emission sensor.
     * @param emissionAmount - The amount of emissions.
     * @param emissionUnit - The unit of measurement for emissions.
     * @param temperatureSensorId - The ID of the temperature sensor.
     * @param temperatureValue - The temperature value.
     * @param temperatureUnit - The unit of measurement for temperature.
     * @param pollutionSensorId - The ID of the pollution sensor.
     * @param pollutionLevel - The pollution level.
     * @param pollutionUnit - The unit of measurement for pollution.
     * @param timestamp - The timestamp of the record.
     */
    async updateClimateRecord(
        ctx: Context,
        recordId: string,
        deviceId: string, 
        emissionSensorId: string, 
        emissionAmount: string, 
        emissionUnit: EmissionsUnits,
        temperatureSensorId: string,
        temperatureValue: number,
        temperatureUnit: TemperatureUnits,
        pollutionSensorId: string,
        pollutionLevel: number,
        pollutionUnit: PollutionUnits,
        timestamp: string
    ) {
        try {
            // Check if the record exists
            const exists = await this.recordExists(ctx, recordId);
            if (!exists) {
                throw new Error(`The record ${recordId} does not exist`);
            }

            const record: ClimateRecordInterface = {
                recordId,
                deviceId,
                emissions: {
                    sensorId:emissionSensorId,
                    amount: parseFloat(emissionAmount),
                    unit: emissionUnit,
                },
                temperature : {
                    sensorId: temperatureSensorId,
                    value: temperatureValue,
                    unit: temperatureUnit
                },
                pollution: {
                    sensorId: pollutionSensorId,
                    level: pollutionLevel,
                    unit: pollutionUnit
                },
                timestamp
            };
    
            // Validate the record before saving
            validateClimateRecord(record);
    
            await ctx.stub.putState(recordId, serialize(record));
    
        } catch (error) {
            console.error(`Error in updateClimateRecord: ${error}`);
            throw new Error(`Failed to update climate record: ${error}`);
        }
    }

    /**
     * Checks whether a climate record exists in the ledger by its unique ID.
     * @param ctx - The transaction context.
     * @param recordId - The unique ID of the climate record to check.
     * @returns A boolean indicating whether the record exists (`true`) or not (`false`).
     */
    async recordExists(ctx: Context, recordId: string) {
        const recordJSON = await ctx.stub.getState(recordId);
        return recordJSON && recordJSON.length > 0;
    }

    /**
     * Retrieves a climate record from the ledger by its unique ID.
     * @param ctx - The transaction context.
     * @param recordId - The unique ID of the climate record to retrieve.
     * @returns The climate record associated with the given ID.
     * @throws Error if the record does not exist.
     */
    async getClimateRecord(ctx: Context, recordId: string): Promise<ClimateRecordInterface | null> {
        const recordBuffer = await ctx.stub.getState(recordId);

        if (!recordBuffer || recordBuffer.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        const record = deserialize(recordBuffer) as ClimateRecordInterface;

        return record;
    }

    /**
     * Retrieves all climate records from the ledger.
     * @param ctx - The transaction context.
     * @returns A JSON string containing an array of all climate records.
     */
    async getAllClimateRecords(ctx: Context): Promise<string> {
        const allResults = [];
        
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as any;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

