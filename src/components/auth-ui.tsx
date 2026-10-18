import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthPage({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <SafeAreaView style={ui.page}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={ui.content}
        >
          <Text style={ui.brand}>strapper</Text>
          <View style={ui.body}>
            <Text accessibilityRole="header" style={ui.title}>
              {title}
            </Text>
            {subtitle && <Text style={ui.copy}>{subtitle}</Text>}
            {children}
          </View>
          <Text style={ui.footer}>Built for connection. Rooted in care.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Action({
  title,
  onPress,
  busy,
  disabled,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        secondary && ui.secondary,
        (disabled || busy || pressed) && { opacity: 0.6 },
      ]}
    >
      {busy ? (
        <ActivityIndicator
          color={secondary ? '#274C3D' : '#FFFFFF'}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text style={[ui.buttonText, secondary && { color: '#274C3D' }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#66736A"
        style={ui.input}
        {...props}
      />
    </View>
  );
}
export function ErrorNotice({ message }: { message: string | null }) {
  return message ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={ui.error}
    >
      {message}
    </Text>
  ) : null;
}
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7F3EB' },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 28,
  },
  brand: {
    color: '#274C3D',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  body: { flex: 1, justifyContent: 'center', gap: 20, paddingVertical: 40 },
  title: {
    color: '#274C3D',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  copy: { color: '#536257', fontSize: 17, lineHeight: 26 },
  label: { color: '#274C3D', fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#274C3D',
    borderColor: '#A1AE9B',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 17,
    minHeight: 54,
  },
  button: {
    backgroundColor: '#274C3D',
    borderRadius: 16,
    minHeight: 54,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: '#E7ECD9' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  error: { color: '#9D2B25', fontSize: 15, lineHeight: 22 },
  footer: {
    color: '#5C675E',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
