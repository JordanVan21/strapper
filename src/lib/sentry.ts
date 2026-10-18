import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

let initialized = false;
export const sentryEnabled = Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN);

export function initializeSentry() {
  if (initialized) return;
  initialized = true;
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enabled: sentryEnabled,
    enableNative: Constants.executionEnvironment !== 'storeClient',
    sendDefaultPii: false,
    attachScreenshot: false,
    attachViewHierarchy: false,
    enableAutoSessionTracking: false,
    enableAutoPerformanceTracing: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment: __DEV__
      ? 'development'
      : process.env.EXPO_PUBLIC_APP_ENV || 'preview',
    // Allowlist diagnostics: no email, DOB, auth tokens, request bodies,
    // console breadcrumbs, user context, or raw exception messages.
    beforeSend(event) {
      return {
        type: event.type,
        event_id: event.event_id,
        timestamp: event.timestamp,
        platform: event.platform,
        level: event.level,
        environment: event.environment,
        release: event.release,
        dist: event.dist,
        exception: {
          values: event.exception?.values?.map((value) => ({
            type: value.type,
            value: 'Application error (details omitted for privacy)',
            stacktrace: {
              frames: value.stacktrace?.frames?.map((frame) => ({
                filename: frame.filename?.split('?')[0],
                function: frame.function,
                lineno: frame.lineno,
                colno: frame.colno,
                in_app: frame.in_app,
              })),
            },
          })),
        },
      };
    },
  });
}
export { Sentry };
