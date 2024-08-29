import { type Contract } from 'fabric-contract-api';
import { ClimateDataContract } from './climateDataChaincode';

export const contracts: (typeof Contract)[] = [ClimateDataContract];
