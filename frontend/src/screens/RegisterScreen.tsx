import { Fragment, type ChangeEvent, type CSSProperties, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../theme';
import { api } from '../services/api';

type RegisterScreenProps = {
  onBackPress?: () => void;
  onLoginPress?: () => void;
};

type Role = 'koperasi' | 'supplier';
type RegisterPhase = 'account' | 'otp' | 'organization' | 'document';

const stepOrder: RegisterPhase[] = ['account', 'organization', 'document'];
const stepLabels: Record<RegisterPhase, string> = {
  account: 'Akun',
  otp: 'Akun',
  organization: 'Organisasi',
  document: 'Dokumen',
};

export function RegisterScreen({ onBackPress, onLoginPress }: RegisterScreenProps) {
  const { height } = useWindowDimensions();
  const [phase, setPhase] = useState<RegisterPhase>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('koperasi');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationContact, setOrganizationContact] = useState('');
  const [ktpFileName, setKtpFileName] = useState('');
  const [legalDocumentFileName, setLegalDocumentFileName] = useState('');
  const [notice, setNotice] = useState('');

  const canContinue = name.trim().length > 0 && email.trim().length > 0 && password.trim().length >= 8 && acceptedTerms;
  const activeStep = phase === 'otp' ? 'account' : phase;
  const activeStepIndex = stepOrder.indexOf(activeStep);

  const handleAccountContinue = () => {
    if (!canContinue) {
      setNotice('Lengkapi nama, email, kata sandi minimal 8 karakter, dan setujui syarat layanan.');
      return;
    }

    setNotice('');
    setOtpCode('');
    setPhase('otp');
  };

  const handleOtpContinue = () => {
    if (!otpCode.trim()) {
      setNotice('Masukkan kode OTP terlebih dahulu.');
      return;
    }

    setNotice('');
    setPhase('organization');
  };

  const handleSubmitRegister = async () => {
    try {
      setNotice('Mendaftarkan akun...');
      await api.register({
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: role,
      });
      setNotice('Registrasi berhasil! Silakan masuk dengan akun Anda.');
      setTimeout(() => {
        onLoginPress?.();
      }, 1500);
    } catch (err: unknown) {
      setNotice(getErrorMessage(err, 'Registrasi gagal. Email mungkin sudah terdaftar.'));
    }
  };

  const handleBack = () => {
    setNotice('');

    if (phase === 'otp') {
      setPhase('account');
      return;
    }

    if (phase === 'organization') {
      setOtpCode('');
      setPhase('account');
      return;
    }

    if (phase === 'document') {
      setPhase('organization');
      return;
    }

    onBackPress?.();
  };

  const getPrimaryAction = () => {
    if (phase === 'account') {
      return {
        disabled: !canContinue,
        label: 'Lanjutkan',
        onPress: handleAccountContinue,
      };
    }

    if (phase === 'otp') {
      return {
        disabled: !otpCode.trim(),
        label: 'Verifikasi Email',
        onPress: handleOtpContinue,
      };
    }

    if (phase === 'organization') {
      return {
        disabled: false,
        label: 'Lanjut ke Dokumen',
        onPress: () => {
          setNotice('');
          setPhase('document');
        },
      };
    }

    return {
      disabled: false,
      label: 'Selesaikan Pendaftaran',
      onPress: handleSubmitRegister,
    };
  };

  const primaryAction = getPrimaryAction();

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>{'<'}</Text>
            <Text style={styles.backText}>Kembali</Text>
          </Pressable>
          <BrandMark size={28} />
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Buat Akun Baru</Text>
            <Text style={styles.subtitle}>
              {getPhaseSubtitle(phase, email)}
            </Text>
          </View>

          <View style={styles.progress}>
            {stepOrder.map((step, index) => {
              const isActive = activeStep === step;
              const isCompleted = activeStepIndex > index;

              return (
                <Fragment key={step}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, (isActive || isCompleted) && styles.stepCircleActive]}>
                      <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.stepNumberActive]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.stepLabel, (isActive || isCompleted) && styles.stepLabelActive]}>
                      {stepLabels[step]}
                    </Text>
                  </View>
                  {index < stepOrder.length - 1 ? (
                    <View style={[styles.stepConnector, activeStepIndex > index && styles.stepConnectorActive]} />
                  ) : null}
                </Fragment>
              );
            })}
          </View>

          <View style={styles.form}>
            {phase === 'account' ? (
              <AccountFields
                acceptedTerms={acceptedTerms}
                email={email}
                name={name}
                onAcceptedTermsChange={setAcceptedTerms}
                onEmailChange={setEmail}
                onNameChange={setName}
                onPasswordChange={setPassword}
                onRoleChange={setRole}
                password={password}
                role={role}
              />
            ) : null}

            {phase === 'otp' ? (
              <View style={styles.otpCard}>
                <View style={styles.otpIcon}>
                  <Text style={styles.otpIconText}>@</Text>
                </View>
                <Text style={styles.otpTitle}>Verifikasi Email</Text>
                <Text style={styles.otpSubtitle}>
                  Masukkan kode OTP yang dikirim ke {email.trim() || 'email Anda'}. Untuk demo ini, kode apa pun diterima.
                </Text>
                <TextInput
                  accessibilityLabel="Kode OTP"
                  autoCapitalize="characters"
                  inputMode="numeric"
                  keyboardType="number-pad"
                  onChangeText={setOtpCode}
                  onKeyPress={(event) => {
                    if (event.nativeEvent.key === 'Enter') {
                      handleOtpContinue();
                    }
                  }}
                  placeholder="123456"
                  placeholderTextColor={colors.outlineVariant}
                  style={[styles.input, styles.otpInput]}
                  value={otpCode}
                />
              </View>
            ) : null}

            {phase === 'organization' ? (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderTitle}>Data Organisasi</Text>
                <Text style={styles.placeholderCopy}>
                  Data ini belum dikirim ke backend. Untuk sekarang digunakan sebagai placeholder alur verifikasi.
                </Text>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nama Organisasi</Text>
                  <TextInput
                    accessibilityLabel="Nama Organisasi"
                    onChangeText={setOrganizationName}
                    placeholder={role === 'supplier' ? 'PT Agro Sejahtera' : 'Koperasi Tani Makmur'}
                    placeholderTextColor={colors.outlineVariant}
                    style={styles.input}
                    value={organizationName}
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Kontak Penanggung Jawab</Text>
                  <TextInput
                    accessibilityLabel="Kontak Penanggung Jawab"
                    onChangeText={setOrganizationContact}
                    placeholder="081234567890"
                    placeholderTextColor={colors.outlineVariant}
                    style={styles.input}
                    value={organizationContact}
                  />
                </View>
              </View>
            ) : null}

            {phase === 'document' ? (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderTitle}>Dokumen Verifikasi</Text>
                <Text style={styles.placeholderCopy}>
                  Upload asli akan dihubungkan nanti. Untuk demo ini, pilih file agar nama dokumen tersimpan di browser saja.
                </Text>
                <FileUploadField
                  accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
                  fileName={ktpFileName}
                  label="Foto KTP Penanggung Jawab"
                  onFileChange={setKtpFileName}
                  placeholder="Pilih file KTP: JPG, PNG, WEBP, atau PDF"
                />
                <FileUploadField
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  fileName={legalDocumentFileName}
                  label="Dokumen Legal Organisasi"
                  onFileChange={setLegalDocumentFileName}
                  placeholder="Pilih dokumen legal: PDF, DOC, atau DOCX"
                />
                <View style={styles.reviewBox}>
                  <Text style={styles.reviewLabel}>Ringkasan Pendaftaran</Text>
                  <Text style={styles.reviewText}>{name.trim() || '-'} - {email.trim() || '-'}</Text>
                  <Text style={styles.reviewText}>
                    {role === 'supplier' ? 'Pemasok' : 'Manajer Koperasi'} - {organizationName.trim() || 'Organisasi belum diisi'}
                  </Text>
                </View>
              </View>
            ) : null}

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          </View>

          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              disabled={primaryAction.disabled}
              onPress={primaryAction.onPress}
              style={[styles.primaryButton, primaryAction.disabled && styles.primaryButtonDisabled]}
            >
              <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
            </Pressable>
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <Pressable accessibilityRole="link" onPress={onLoginPress}>
                <Text style={styles.loginLink}>Masuk</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getPhaseSubtitle(phase: RegisterPhase, email: string) {
  if (phase === 'otp') {
    return `Kode verifikasi dikirim ke ${email.trim() || 'email yang Anda masukkan'}.`;
  }

  if (phase === 'organization') {
    return 'Lengkapi data organisasi sebagai bagian dari verifikasi awal.';
  }

  if (phase === 'document') {
    return 'Siapkan dokumen verifikasi. Tahap ini masih placeholder untuk demo.';
  }

  return 'Lengkapi informasi akun untuk mendaftar sebagai Koperasi atau Pemasok.';
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

type AccountFieldsProps = {
  acceptedTerms: boolean;
  email: string;
  name: string;
  onAcceptedTermsChange: (value: boolean | ((current: boolean) => boolean)) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (role: Role) => void;
  password: string;
  role: Role;
};

function AccountFields({
  acceptedTerms,
  email,
  name,
  onAcceptedTermsChange,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onRoleChange,
  password,
  role,
}: AccountFieldsProps) {
  return (
    <>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          accessibilityLabel="Nama Lengkap"
          autoCapitalize="words"
          onChangeText={onNameChange}
          placeholder="Budi Santoso"
          placeholderTextColor={colors.outlineVariant}
          style={styles.input}
          value={name}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Alamat Email (Gmail)</Text>
        <TextInput
          accessibilityLabel="Alamat Email Gmail"
          autoCapitalize="none"
          inputMode="email"
          keyboardType="email-address"
          onChangeText={onEmailChange}
          placeholder="contoh@gmail.com"
          placeholderTextColor={colors.outlineVariant}
          style={styles.input}
          value={email}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Kata Sandi</Text>
        <TextInput
          accessibilityLabel="Kata Sandi"
          onChangeText={onPasswordChange}
          placeholder="Minimal 8 karakter"
          placeholderTextColor={colors.outlineVariant}
          secureTextEntry
          style={styles.input}
          value={password}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Peran Anda</Text>
        <View style={styles.roleGrid}>
          <RoleOption
            description="Kelola pembelian dan pool bersama"
            isSelected={role === 'koperasi'}
            label="Manajer Koperasi"
            onPress={() => onRoleChange('koperasi')}
          />
          <RoleOption
            description="Terima proposal pembelian"
            isSelected={role === 'supplier'}
            label="Pemasok"
            onPress={() => onRoleChange('supplier')}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
        onPress={() => onAcceptedTermsChange((current) => !current)}
        style={styles.termsRow}
      >
        <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
          <Text style={styles.checkboxText}>{acceptedTerms ? 'v' : ''}</Text>
        </View>
        <Text style={styles.termsText}>Saya menyetujui Syarat Layanan VolumeMate.</Text>
      </Pressable>
    </>
  );
}

type RoleOptionProps = {
  description: string;
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

function RoleOption({ description, isSelected, label, onPress }: RoleOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
    >
      <Text style={styles.roleLabel}>{label}</Text>
      <Text style={styles.roleDescription}>{description}</Text>
    </Pressable>
  );
}

type FileUploadFieldProps = {
  accept: string;
  fileName: string;
  label: string;
  onFileChange: (fileName: string) => void;
  placeholder: string;
};

const hiddenInputStyle: CSSProperties = {
  display: 'none',
};

function FileUploadField({ accept, fileName, label, onFileChange, placeholder }: FileUploadFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileChange(file?.name || '');
  };

  return (
    <View style={styles.fileFieldGroup}>
      <Text style={styles.mockUploadLabel}>{label}</Text>
      <label style={fileUploadButtonStyle}>
        <input accept={accept} onChange={handleChange} style={hiddenInputStyle} type="file" />
        <span style={fileUploadTextStyle}>{fileName || placeholder}</span>
      </label>
    </View>
  );
}

const fileUploadButtonStyle: CSSProperties = {
  alignItems: 'center',
  backgroundColor: colors.background,
  border: `1px dashed ${colors.primary}`,
  borderRadius: 10,
  boxSizing: 'border-box',
  cursor: 'pointer',
  display: 'flex',
  minHeight: 52,
  padding: '12px 14px',
  width: '100%',
};

const fileUploadTextStyle: CSSProperties = {
  color: colors.primary,
  fontFamily: fonts.body,
  fontSize: 12,
  fontWeight: 700,
  lineHeight: '16px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    maxWidth: 430,
    minHeight: 64,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    minWidth: 82,
    minHeight: 44,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  backIcon: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
  },
  backText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  topSpacer: {
    width: 82,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  progress: {
    minHeight: 56,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    width: 64,
  },
  stepConnector: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceVariant,
    height: 2,
    marginHorizontal: 2,
    marginTop: 16,
    width: 92,
  },
  stepConnectorActive: {
    backgroundColor: colors.primary,
  },
  stepCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  stepNumberActive: {
    color: colors.onPrimary,
  },
  stepLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: colors.primary,
  },
  form: {
    gap: 16,
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
  input: {
    minHeight: 48,
    borderColor: colors.outline,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    gap: 7,
    padding: 12,
  },
  roleOptionSelected: {
    backgroundColor: 'rgba(174, 238, 203, 0.2)',
    borderColor: colors.primary,
  },
  roleLabel: {
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  roleDescription: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.outline,
    borderRadius: 6,
    borderWidth: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  notice: {
    color: colors.primaryContainer,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  otpCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 18,
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
  },
  otpSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  otpInput: {
    letterSpacing: 4,
    textAlign: 'center',
    width: '100%',
  },
  placeholderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  placeholderTitle: {
    color: colors.onSurface,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  placeholderCopy: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  fileFieldGroup: {
    gap: 10,
  },
  mockUploadLabel: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  reviewBox: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: 10,
    gap: 4,
    padding: 12,
  },
  reviewLabel: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  reviewText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  footerActions: {
    gap: 14,
    marginTop: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.62,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  loginLink: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
