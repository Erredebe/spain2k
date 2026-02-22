import records from './assets-licenses.json';
import type { AssetLicenseRecord } from '../types';

export const ASSET_LICENSES = records as AssetLicenseRecord[];

export const REQUIRED_ATTRIBUTIONS = Array.from(
  new Set(
    ASSET_LICENSES.filter((record) => record.attributionRequired).map(
      (record) => record.attributionText,
    ),
  ),
);
