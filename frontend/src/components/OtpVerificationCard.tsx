import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native-web';
import { colors, fonts } from '../theme';

type OtpVerificationCardProps = {
  email: string;
  onBack: () => void;
  onOtpChange: (value: string) => void;
  onSubmit: () => void;
  otpCode: string;
  subtitle?: string;
  title?: string;
};

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function OtpVerificationCard({
  email,
  onBack,
  onOtpChange,
  onSubmit,
  otpCode,
  subtitle,
  title = 'Verifikasi Email',
}: OtpVerificationCardProps) {
  const targetEmail = email.trim() || 'email Anda';
  const description =
    subtitle ||
    `Masukkan kode OTP yang dikirim ke ${targetEmail}. Untuk demo ini, kode apa pun diterima.`;

  return (
    <View style={styles.otpCard}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Kembali</Text>
      </Pressable>

      <View style={styles.otpIcon}>
        <Text style={styles.otpIconText}>@</Text>
      </View>
      <Text style={styles.otpTitle}>{title}</Text>
      <Text style={styles.otpSubtitle}>{description}</Text>
      <TextInput
        accessibilityLabel="Kode OTP"
        autoCapitalize="characters"
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={onOtpChange}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === 'Enter') {
            onSubmit();
          }
        }}
        placeholder="123456"
        placeholderTextColor={colors.outlineVariant}
        style={styles.otpInput}
        value={otpCode}
      />
      <Pressable
        accessibilityRole="button"
        disabled={!otpCode.trim()}
        onPress={onSubmit}
        style={[styles.confirmButton, !otpCode.trim() && styles.confirmButtonDisabled]}
      >
        <Text style={styles.confirmButtonText}>Konfirmasi OTP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  otpCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 18,
    ...cardShadow,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
  },
  backText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  otpIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 24,
  },
  otpIconText: {
    color: colors.primary,
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '700',
  },
  otpTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },
  otpSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  otpInput: {
    width: '100%',
    minHeight: 48,
    borderColor: colors.outline,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    letterSpacing: 4,
    lineHeight: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  confirmButton: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.62,
  },
  confirmButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
});
