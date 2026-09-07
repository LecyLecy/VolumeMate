import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native-web';
import { BrandMark } from '../components/BrandMark';
import { api } from '../services/api';
import { colors, fonts } from '../theme';

type LoginScreenProps = {
  onAdminLogin?: () => void;
  onKoperasiLogin?: () => void;
  onRegisterPress?: () => void;
  onSupplierLogin?: () => void;
};

type DemoRole = 'koperasi' | 'supplier' | 'admin';

const cardShadow = {
  boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
} as unknown as ViewStyle;

export function LoginScreen({
  onAdminLogin,
  onKoperasiLogin,
  onSupplierLogin,
}: LoginScreenProps) {
  const { height } = useWindowDimensions();
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);
  const [notice, setNotice] = useState('');

  const openDemo = async (role: DemoRole) => {
    if (loadingRole) return;

    setLoadingRole(role);
    setNotice('');

    try {
      if (role === 'koperasi') {
        const response = await api.demoLogin('koperasi');
        seedPortfolioProposal(response.user?.koperasi?.name);
        onKoperasiLogin?.();
        return;
      }

      if (role === 'supplier') {
        await api.demoLogin('supplier');
        onSupplierLogin?.();
        return;
      }

      localStorage.setItem('volumemate_token', 'admin_session_token');
      localStorage.setItem(
        'volumemate_user',
        JSON.stringify({
          name: 'Admin Platform',
          email: 'admin@platform.com',
          role: 'ADMIN',
        }),
      );
      onAdminLogin?.();
    } catch (err: unknown) {
      setNotice(getErrorMessage(err, 'Demo tidak dapat dibuka. Pastikan backend dan database aktif.'));
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { minHeight: height }]}>
      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <BrandMark size={46} />
            <Text style={styles.title}>Jelajahi Demo VolumeMate</Text>
            <Text style={styles.subtitle}>
              Pilih peran untuk membuka halaman portfolio tanpa memasukkan email atau password.
            </Text>
          </View>

          <View style={styles.roleList}>
            <RoleButton
              description="Dashboard koperasi, pembelian kolektif, transaksi, dan audit log"
              isLoading={loadingRole === 'koperasi'}
              label="Admin Koperasi"
              onPress={() => openDemo('koperasi')}
            />
            <RoleButton
              description="Kelola proposal penawaran dan aktivitas pemasok"
              isLoading={loadingRole === 'supplier'}
              label="Supplier"
              onPress={() => openDemo('supplier')}
            />
            <RoleButton
              description="Tinjau halaman approval akun platform"
              isLoading={loadingRole === 'admin'}
              label="Admin"
              onPress={() => openDemo('admin')}
            />
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Text style={styles.demoNote}>Portfolio demo • Data akun demo disiapkan secara lokal</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function RoleButton({
  description,
  isLoading,
  label,
  onPress,
}: {
  description: string;
  isLoading: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Buka demo sebagai ${label}`}
      accessibilityRole="button"
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => [styles.roleButton, pressed && styles.roleButtonPressed]}
    >
      <View style={styles.roleCopy}>
        <Text style={styles.roleLabel}>{isLoading ? 'Membuka...' : label}</Text>
        <Text style={styles.roleDescription}>{description}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function seedPortfolioProposal(cooperativeName?: string) {
  const cooperative = cooperativeName || 'Koperasi Sumber Makmur';
  const demoProposal = {
    cooperative,
    dateSubmitted: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    location: 'Kab. Jember, Jawa Timur',
    notes: 'Pengadaan pupuk untuk kebutuhan musim tanam berikutnya.',
    pdfName: 'proposal_pengadaan_npk.pdf',
    product: 'Pupuk NPK Phonska',
    status: 'PENDING',
    supplierEmail: 'supplier@petrokimia.com',
    target: '10.000 Kg',
    value: 'Rp 85.000.000',
    volumeKg: 10000,
  };

  try {
    const saved = localStorage.getItem('volumemate_proposals');
    const proposals = saved ? (JSON.parse(saved) as Array<typeof demoProposal>) : [];
    const alreadyExists = proposals.some(
      (proposal) =>
        proposal.cooperative === demoProposal.cooperative &&
        proposal.product === demoProposal.product &&
        proposal.status === 'PENDING',
    );

    if (!alreadyExists) {
      localStorage.setItem('volumemate_proposals', JSON.stringify([demoProposal, ...proposals]));
    }
  } catch {
    localStorage.setItem('volumemate_proposals', JSON.stringify([demoProposal]));
  }
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
    borderRadius: 16,
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
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 32,
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
    textAlign: 'center',
  },
  roleList: {
    gap: 12,
  },
  roleButton: {
    minHeight: 82,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  roleButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  roleCopy: {
    flex: 1,
    gap: 3,
  },
  roleLabel: {
    color: colors.onPrimary,
    fontFamily: fonts.heading,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
  },
  roleDescription: {
    color: colors.onPrimary,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.82,
  },
  arrow: {
    color: colors.onPrimary,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '600',
  },
  notice: {
    color: colors.errorRed,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  demoNote: {
    color: colors.outline,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
