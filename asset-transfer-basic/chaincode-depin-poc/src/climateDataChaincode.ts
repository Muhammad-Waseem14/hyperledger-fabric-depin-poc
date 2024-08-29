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
    async addClimateRecord(ctx: Context,  record: ClimateRecordInterface) {

       this.validateClimateRecord(record);

       //record.timestamp = new Date().toISOString();
       const recordId = MD5(uuidv4()).toString();

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

    async getAllClimateRecords(ctx: Context): Promise<ClimateRecordInterface[]> {
        const allResults: ClimateRecordInterface[] = [];

        const iterator = await ctx.stub.getStateByRange('', '');

        let result = await iterator.next();

        while (!result.done) {
            const recordBytes = result.value.value.toString();
            const record = JSON.parse(recordBytes) as ClimateRecordInterface;
            allResults.push(record);

            result = await iterator.next();
        }

        await iterator.close();
        return allResults;
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

