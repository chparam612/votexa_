import { getCached } from './cache';

const isNode =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export interface FeatureFlags {
  antigravity_mode_enabled: boolean;
  risk_threshold_high: number;
  risk_threshold_critical: number;
  polling_optimizer_distance_weight: number;
  polling_optimizer_crowd_weight: number;
  notification_cooldown_hours: number;
  ml_recommendation_weight: number;
  use_ml_recommendations: boolean;
  max_polling_stations_shown: number;
}

const DEFAULT_FLAGS: FeatureFlags = {
  antigravity_mode_enabled: false,
  risk_threshold_high: 60,
  risk_threshold_critical: 80,
  polling_optimizer_distance_weight: 0.4,
  polling_optimizer_crowd_weight: 0.35,
  notification_cooldown_hours: 24,
  ml_recommendation_weight: 0.5,
  use_ml_recommendations: false,
  max_polling_stations_shown: 3,
};

const fetchFlagsFromFirebaseAdmin = async (): Promise<FeatureFlags> => {
  if (isNode) {
    try {
      const admin = eval('require')('firebase-admin');
      const remoteConfig = admin.remoteConfig();
      const template = await remoteConfig.getTemplate();

      const flags = { ...DEFAULT_FLAGS };

      if (template.parameters) {
        for (const [key, paramEntry] of Object.entries(template.parameters)) {
          const param = paramEntry as any;
          if (param.defaultValue && 'value' in param.defaultValue) {
            const val = param.defaultValue.value;
            if (key in flags) {
              const typedKey = key as keyof FeatureFlags;
              if (typeof flags[typedKey] === 'boolean') {
                (flags as any)[typedKey] = val === 'true';
              } else if (typeof flags[typedKey] === 'number') {
                (flags as any)[typedKey] = Number(val);
              } else {
                (flags as any)[typedKey] = val;
              }
            }
          }
        }
      }
      return flags;
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
      return DEFAULT_FLAGS;
    }
  }
  return DEFAULT_FLAGS;
};

export const getFlags = async (): Promise<FeatureFlags> => {
  return getCached('flags', 60, fetchFlagsFromFirebaseAdmin);
};
