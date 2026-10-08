import { Hospital } from '../engine/types';

export const DEMO_HOSPITAL: Hospital = {
  id: 'hosp_victoria_bmc',
  name: 'Victoria Hospital & Trauma Centre',
  location: {
    lat: 12.9612,
    lng: 77.5742,
  },
  emergencyDepartment: 'Level 1 Trauma ICU - Bay 04 Ready',
  availableTraumaBeds: 6,
  contactFreq: 'EMERG-NET 154.250 MHz',
};
