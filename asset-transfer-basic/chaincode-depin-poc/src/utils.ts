import {
    ClimateRecordInterface, 
    climateRecordDictionary, 
    VALID_EMISSION_UNITS, 
    VALID_TEMPERATURE_UNITS, 
    VALID_POLLUTION_LEVEL_UNITS
} from './constants';

/**
 * Serializes an object into a Uint8Array.
 * @param object - The object to serialize.
 * @returns A Uint8Array representation of the serialized object.
 */
export function serialize<T>(object: T): Uint8Array {
    return Buffer.from(JSON.stringify(object));
}

/**
 * Deserializes a Uint8Array into an object of type T.
 * @param buffer - The Uint8Array to deserialize.
 * @returns The deserialized object of type T.
 */
export function deserialize<T>(buffer: Uint8Array): T {
    return JSON.parse(buffer.toString()) as T;
}

export const validateClimateRecord = (record: ClimateRecordInterface): void => {
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
