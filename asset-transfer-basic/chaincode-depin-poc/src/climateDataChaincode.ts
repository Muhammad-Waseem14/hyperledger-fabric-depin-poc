import { MD5 } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

import { Context, Contract } from 'fabric-contract-api';

import { serialize, deserialize } from './utils';
import {
    ClimateRecordInterface, 
    climateRecordDictionary, 
    VALID_EMISSION_UNITS, 
    VALID_TEMPERATURE_UNITS, 
    VALID_POLLUTION_LEVEL_UNITS
} from './constants';

export class ClimateDataContract extends Contract {
    async addClimateRecord(
        ctx: Context, 
        recordId: string, 
        deviceId: string, 
        sensorId: string, 
        amount: string, 
        unit: 'tCO2' | 'kgCO2' | 'gCO2',
        timestamp: string
    ) {
        
        const record: ClimateRecordInterface = {
            recordId,
            deviceId,
            emissions:  {
                sensorId,
                amount: parseFloat(amount),
                unit,
            },
            timestamp
        };
    
       this.validateClimateRecord(record);
    
        await ctx.stub.putState(recordId, serialize(record));
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


    validateClimateRecord(record: ClimateRecordInterface): void {
    // Validate Emissions
        if (record.emissions) {
            const { unit, amount } = record.emissions;
            
            if (!VALID_EMISSION_UNITS.includes(unit)) {
                throw new Error(`Invalid emission unit: ${unit}`);
            }

            const range = climateRecordDictionary.emissionUnits[unit];
            if (amount < range.min || amount > range.max) {
                throw new Error(`Emission amount out of range for unit ${unit}`);
            }
        }

        // Validate Temperature
        if (record.temperature) {
            const { unit, value } = record.temperature;

            if (!VALID_TEMPERATURE_UNITS.includes(unit)) {
                throw new Error(`Invalid temperature unit: ${unit}`);
            }

            const range = climateRecordDictionary.temperatureUnits[unit];
            if (value < range.min || value > range.max) {
                throw new Error(`Temperature value out of range for unit ${unit}`);
            }
        }

        // Validate Pollution
        if (record.pollution) {
            const { unit, level } = record.pollution;

            if (!VALID_POLLUTION_LEVEL_UNITS.includes(unit)) {
                throw new Error(`Invalid pollution level unit: ${unit}`);
            }

            const range = climateRecordDictionary.pollutionLevelUnits[unit];
            if (level < range.min || level > range.max) {
                throw new Error(`Pollution level out of range for unit ${unit}`);
            }
        }
    }
}

