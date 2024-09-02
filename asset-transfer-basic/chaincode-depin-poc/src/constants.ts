export const VALID_EMISSION_UNITS = ['tCO2', 'kgCO2', 'gCO2'];
export const VALID_TEMPERATURE_UNITS = ['°C', '°F', 'K'];
export const VALID_POLLUTION_LEVEL_UNITS = ['µg/m³', 'mg/m³'];

export type EmissionsUnits = 'tCO2' | 'kgCO2' | 'gCO2';
export type TemperatureUnits = '°C' | '°F'| 'K';
export type PollutionUnits = 'µg/m³'| 'mg/m³';


export type EmissionRecord = {
    sensorId: string;
    amount: number;
    unit: EmissionsUnits;
};
  
export type TemperatureRecord = {
    sensorId: string;
    value: number;
    unit: TemperatureUnits;
};
  
export type PollutionRecord = {
    sensorId: string;
    level: number;
    unit: PollutionUnits;
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
      '°C': { min: -273.15, max: 1000 }, // '°C'
      '°F': { min: -459.67, max: 1800 }, // '°F'
      'K': { min: 0, max: 1500 } // k
    },

    pollutionLevelUnits: {
      'µg/m³': { min: 0, max: 10000 }, //MicrogramsPerCubicMeter 'µg/m³'
      'mg/m³': { min: 0, max: 1000 } //PartsPerMillion ppm
    }
};