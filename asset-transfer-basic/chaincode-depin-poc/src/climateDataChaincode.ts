import { MD5 } from 'crypto-js';

import { Context, Contract } from 'fabric-contract-api';

import { serialize, deserialize, validateClimateRecord } from './utils';
import { ClimateRecordInterface } from './constants';


export class ClimateDataContract extends Contract {
    async addClimateRecord(
        ctx: Context, 
        deviceId: string, 
        sensorId: string, 
        amount: string, 
        unit: 'tCO2' | 'kgCO2' | 'gCO2',
        timestamp: string
    ) {
        try {
           const recordId = MD5(deviceId + timestamp).toString();
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
        
           validateClimateRecord(record);
        
            await ctx.stub.putState(recordId, serialize(record));
          } catch (error: any) {
            console.error('Error generating recordId:', error);
            throw new Error(error);
          }
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

