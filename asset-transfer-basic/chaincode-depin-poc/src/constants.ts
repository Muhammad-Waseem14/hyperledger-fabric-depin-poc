export const VALID_EMISSION_UNITS = ['tCO2', 'kgCO2', 'gCO2'];
export const VALID_TEMPERATURE_UNITS = ['celsius', 'fahrenheit', 'kelvin'];
export const VALID_POLLUTION_LEVEL_UNITS = ['mgpq', 'ppm'];


export type EmissionRecord = {
    sensorId: string;
    amount: number;
    unit: 'tCO2' | 'kgCO2' | 'gCO2';
    };
  
export type TemperatureRecord = {
    sensorId: string;
    value: number;
    unit: 'celsius' | 'fahrenheit' | 'kelvin'
    };
  
export type PollutionRecord = {
    sensorId: string;
    level: number;
    unit: 'mgpq' | 'ppm'
    };

export interface ClimateRecordInterface {
    recordId?: string;
    deviceId: string;
    timestamp?: string;
    emissions?: EmissionRecord;
    temperature?: TemperatureRecord;
    pollution?: PollutionRecord;
  }

export const climateRecordDictionary = {
    emissionUnits: {
      tCO2: { min: 0, max: 1000000000 },
      kgCO2: { min: 0.01, max: 10000000 },
      gCO2: { min: 0.001, max: 10000000 }
    },

    temperatureUnits: {
      celsius: { min: -273.15, max: 1000 }, // '°C'
      fahrenheit: { min: -459.67, max: 1800 }, // '°F'
      kelvin: { min: 0, max: 1500 } // k
    },

    pollutionLevelUnits: {
      mgpq: { min: 0, max: 10000 }, //MicrogramsPerCubicMeter 'µg/m³'
      ppm: { min: 0, max: 1000 } //PartsPerMillion ppm
    }
};