import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';

export function ProfileScreen() {
  const { user, sair } = useAuth();
  const { decks, cards, grupos } = useData();

  const meusDecks = decks.filter((d) => d.donoId === user?.id).length;
  const meusGrupos = grupos.filter((g) => g.membros.includes(user?.id ?? '')).length;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Perfil</Text>
      </View>
      <View style={styles.conteudo}>
        <Card>
          <View style={styles.avatarLinha}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {(user?.nome ?? '?').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.nome}>{user?.nome}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.stats}>
          <Card style={styles.statBox}>
            <Text style={styles.statNumero}>{meusDecks}</Text>
            <Text style={styles.statLabel}>Baralhos</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statNumero}>{cards.length}</Text>
            <Text style={styles.statLabel}>Flashcards</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statNumero}>{meusGrupos}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </Card>
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Button title="Sair da conta" variant="outline" onPress={sair} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text },
  conteudo: { padding: spacing.lg },
  avatarLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: '#fff', fontSize: 22, fontWeight: '700' },
  nome: { fontSize: 17, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  stats: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumero: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
});
