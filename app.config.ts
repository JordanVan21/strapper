import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT || 'development';
  const production = variant === 'production';
  const identifier =
    process.env.APP_BUNDLE_IDENTIFIER || 'com.example.strapper';
  const sentryProject = process.env.SENTRY_PROJECT;
  const sentryOrganization = process.env.SENTRY_ORG;
  const plugins: ExpoConfig['plugins'] = [...(config.plugins || [])];
  if (sentryProject && sentryOrganization) {
    plugins.push([
      '@sentry/react-native/expo',
      { organization: sentryOrganization, project: sentryProject },
    ]);
  }
  return {
    ...config,
    name: production
      ? 'Strapper'
      : variant === 'preview'
        ? 'Strapper Preview'
        : 'Strapper Dev',
    slug: 'strapper',
    scheme: production ? 'strapper' : `strapper-${variant}`,
    ios: {
      ...config.ios,
      bundleIdentifier: `${identifier}${production ? '' : variant === 'preview' ? '.preview' : '.dev'}`,
    },
    android: {
      ...config.android,
      package: `${identifier}${production ? '' : variant === 'preview' ? '.preview' : '.dev'}`,
    },
    plugins,
  };
};
