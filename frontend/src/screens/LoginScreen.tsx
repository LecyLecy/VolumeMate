import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { OtpVerificationCard } from '../components/OtpVerificationCard';
import { colors, fonts } from '../theme';
import { api } from '../services/api';

type LoginScreenProps = {
  onAdminLogin?: () => void;
  onKoperasiLogin?: () => void;
  onRegisterPress?: () => void;
  onSupplierLogin?: () => void;
};

type LoginPhase = 'login' | 'forgot-form' | 'forgot-otp';

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;


export function LoginScreen({
  onAdminLogin,
  onKoperasiLogin,
  onRegisterPress,
  onSupplierLogin,
}: LoginScreenProps) {
  const { height } = useWindowDimensions();
  const [phase, setPhase] = useState<LoginPhase>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [notice, setNotice] = useState('');

  const showLoginNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  const goToForgotForm = () => {
    setNotice('');
    setForgotOtpCode('');
    setPhase('forgot-form');
  };

  const goToLogin = () => {
    setNotice('');
    setPhase('login');
  };

  const handleForgotFormSubmit = () => {
    if (!forgotEmail.trim()) {
      setNotice('Email wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      setNotice('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setNotice('Konfirmasi password belum sama.');
      return;
    }

    setNotice('');
    setForgotOtpCode('');
    setPhase('forgot-otp');
  };

  const handleForgotOtpSubmit = () => {
    if (!forgotOtpCode.trim()) {
      setNotice('Masukkan kode OTP terlebih dahulu.');
      return;
    }

    setForgotEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotOtpCode('');
    setPhase('login');
    showLoginNotice('Password berhasil diubah untuk demo. Silakan masuk kembali.');
  };

  const handleLogin = async () => {
    const loginCode = email.trim();

    // Shortcut '1': Login as Koperasi with real backend credentials
    if (loginCode === '1') {
      try {
        setNotice('Sedang masuk sebagai Koperasi...');
        await api.login('admin@koperasi.com', 'password123');
        setNotice('');
        onKoperasiLogin?.();
      } catch (err: unknown) {
        setNotice(getErrorMessage(err, 'Login gagal. Pastikan backend aktif.'));
      }
      return;
    }

    // Shortcut '2': Login as second Koperasi user
    if (loginCode === '2') {
      try {
        setNotice('Sedang masuk sebagai Koperasi 2...');
        await api.login('joko@koperasi.com', 'password123');
        setNotice('');
        onKoperasiLogin?.();
      } catch (err: unknown) {
        setNotice(getErrorMessage(err, 'Login gagal. Pastikan backend aktif.'));
      }
      return;
    }

    // Shortcut '3': Admin role (bypass for local admin console testing)
    if (loginCode === '3') {
      localStorage.setItem('volumemate_token', 'admin_session_token');
      localStorage.setItem('volumemate_user', JSON.stringify({ name: 'Admin Platform', email: 'admin@platform.com', role: 'ADMIN' }));
      onAdminLogin?.();
      return;
    }

    // Shortcut '4': Login as Supplier with real backend credentials
    if (loginCode === '4') {
      try {
        setNotice('Sedang masuk sebagai Supplier...');
        await api.login('supplier@petrokimia.com', 'password123');
        setNotice('');
        onSupplierLogin?.();
      } catch (err: unknown) {
        setNotice(getErrorMessage(err, 'Login gagal. Pastikan backend aktif.'));
      }
      return;
    }

    if (!email || !password) {
      setNotice('Email dan Password wajib diisi.');
      return;
    }

    try {
      setNotice('Sedang masuk...');
      const response = await api.login(email, password);
      setNotice('');

      const role = response.user?.role;
      if (role === 'SUPPLIER') {
        onSupplierLogin?.();
      } else if (role === 'ADMIN_KOPERASI' || role === 'ANGGOTA') {
        onKoperasiLogin?.();
      } else if (role === 'SUPPLIER') {
        onSupplierLogin?.();
      } else {
        onKoperasiLogin?.();
      }
    } catch (err: unknown) {
      setNotice(getErrorMessage(err, 'Login gagal. Periksa kembali email dan password.'));
    }
  };

  if (phase === 'forgot-form') {
    return (
      <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
        <View style={styles.page}>
          <View style={styles.card}>
            <Pressable accessibilityRole="button" onPress={goToLogin} style={styles.backButton}>
              <Text style={styles.backText}>Kembali</Text>
            </Pressable>

            <View style={styles.header}>
              <BrandMark size={38} />
              <Text style={styles.title}>Lupa Password</Text>
              <Text style={styles.subtitle}>Masukkan email dan password baru, lalu verifikasi lewat OTP.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email atau Gmail</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    accessibilityLabel="Email reset password"
                    autoCapitalize="none"
                    inputMode="email"
                    keyboardType="email-address"
                    onChangeText={setForgotEmail}
                    placeholder="masukkan@email.anda"
                    placeholderTextColor={colors.outline}
                    style={styles.input}
                    value={forgotEmail}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password Baru</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>#</Text>
                  <TextInput
                    accessibilityLabel="Password Baru"
                    onChangeText={setNewPassword}
                    placeholder="Minimal 8 karakter"
                    placeholderTextColor={colors.outline}
                    secureTextEntry
                    style={styles.input}
                    value={newPassword}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Konfirmasi Password Baru</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>#</Text>
                  <TextInput
                    accessibilityLabel="Konfirmasi Password Baru"
                    onChangeText={setConfirmNewPassword}
                    onKeyPress={(event) => {
                      if (event.nativeEvent.key === 'Enter') {
                        handleForgotFormSubmit();
                      }
                    }}
                    placeholder="Ulangi password baru"
                    placeholderTextColor={colors.outline}
                    secureTextEntry
                    style={styles.input}
                    value={confirmNewPassword}
                  />
                </View>
              </View>

              <Pressable accessibilityRole="button" onPress={handleForgotFormSubmit} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Kirim OTP</Text>
              </Pressable>
            </View>

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'forgot-otp') {
    return (
      <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
        <View style={styles.page}>
          <View style={styles.card}>
            <OtpVerificationCard
              email={forgotEmail}
              onBack={() => {
                setNotice('');
                setPhase('forgot-form');
              }}
              onOtpChange={setForgotOtpCode}
              onSubmit={handleForgotOtpSubmit}
              otpCode={forgotOtpCode}
              subtitle={`Masukkan kode OTP yang dikirim ke ${forgotEmail.trim() || 'email Anda'}. Untuk demo ini, kode apa pun diterima.`}
              title="Verifikasi Reset Password"
            />

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <BrandMark size={42} />
            <Text style={styles.subtitle}>Solusi Pengadaan Agrikultur Modern</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email atau Gmail</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  accessibilityLabel="Email atau Gmail"
                  autoCapitalize="none"
                  inputMode="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="masukkan@email.anda"
                  placeholderTextColor={colors.outline}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>#</Text>
                <TextInput
                  accessibilityLabel="Password"
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!isPasswordVisible}
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={isPasswordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
                  accessibilityRole="button"
                  onPress={() => setIsPasswordVisible((current) => !current)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{isPasswordVisible ? 'Tutup' : 'Lihat'}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="link"
              onPress={goToForgotForm}
              style={styles.forgotLink}
            >
              <Text style={styles.linkText}>Lupa Password?</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleLogin} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Masuk</Text>
            </Pressable>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <Pressable accessibilityRole="link" onPress={onRegisterPress}>
              <Text style={styles.registerLink}>Daftar sekarang</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  page: {
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 24,
    gap: 24,
    ...cardShadow,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  inputWrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 12,
  },
  inputIcon: {
    width: 22,
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 0,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  eyeText: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
  },
  forgotLink: {
    alignSelf: 'flex-end',
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
  linkText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  notice: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  registerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: -8,
  },
  registerText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  registerLink: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
