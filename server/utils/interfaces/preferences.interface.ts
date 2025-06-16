export interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
}

export interface UserPreferences {
  language?: string;
  notifications?: NotificationPreferences;
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

export interface UpdatePreferencesInput {
  language?: string;
  notifications?: Partial<NotificationPreferences>;
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}
