import { MD5 } from 'crypto-js';

import { Context, Contract } from 'fabric-contract-api';

import { serialize, deserialize, validateClimateRecord } from './utils';
import { ClimateRecordInterface } from './constants';


export class ClimateDataContract extends Contract {
    async addClimateRecord(
        ctx: Context, 
        deviceId: string, 
        emissionSensorId: string, 
        emissionAmount: string, 
        emissionUnit: 'tCO2' | 'kgCO2' | 'gCO2',
        temperatureSensorId: string,
        temperatureValue: string,
        temperatureUnit: '°C' | '°F'| 'K',
        pollutionSensorId: string,
        pollutionLevel: string,
        pollutionUnit: 'µg/m³'| 'mg/m³',
        timestamp: string
    ) {
        try {
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
    
    async updateClimateRecord(
        ctx: Context,
        recordId: string,
        deviceId: string, 
        emissionSensorId: string, 
        emissionAmount: string, 
        emissionUnit: 'tCO2' | 'kgCO2' | 'gCO2',
        temperatureSensorId: string,
        temperatureValue: number,
        temperatureUnit: '°C' | '°F'| 'K',
        pollutionSensorId: string,
        pollutionLevel: number,
        pollutionUnit: 'µg/m³'| 'mg/m³',
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
            console.error(`Failed to update climate record: ${error}`);
            throw new Error(`Update operation failed: ${error}`);
        }
    }

    async recordExists(ctx: Context, recordId: string) {
        const recordJSON = await ctx.stub.getState(recordId);
        return recordJSON && recordJSON.length > 0;
    }

    async getClimateRecord(ctx: Context, recordId: string): Promise<ClimateRecordInterface | null> {
        const recordBuffer = await ctx.stub.getState(recordId);

        if (!recordBuffer || recordBuffer.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        const record = deserialize(recordBuffer) as ClimateRecordInterface;

        return record;
    }

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

