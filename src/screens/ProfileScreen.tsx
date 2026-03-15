import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { StackNav } from '../navigation/types';

export function ProfileScreen() {
  const nav = useNavigation<StackNav>();
  const { user, sair } = useAuth();
  const { decks, cards, grupos } = useData();

  const meusDecks = decks.filter((d) => d.donoId === user?.id).length;
  const meusGrupos = grupos.filter((g) => g.membros.includes(user?.id ?? '')).length;

  return (
    <ScreenContainer>
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

        <Text style={styles.secao}>Mais</Text>
        <Card style={styles.menu}>
          <MenuItem icone="📊" titulo="Estatisticas" descricao="Streak, acertos e historico" onPress={() => nav.navigate('Stats')} />
          <View style={styles.divisor} />
          <MenuItem icone="⚙️" titulo="Configuracoes" descricao="Chave da API Gemini e modelo" onPress={() => nav.navigate('Settings')} />
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <Button title="Sair da conta" variant="outline" onPress={sair} />
        </View>
      </View>
    </ScreenContainer>
  );
}

function MenuItem({ icone, titulo, descricao, onPress }: { icone: string; titulo: string; descricao: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
      <Text style={styles.itemIcone}>{icone}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>{titulo}</Text>
        <Text style={styles.itemDescricao}>{descricao}</Text>
      </View>
      <Text style={styles.seta}>›</Text>
    </Pressable>
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
  secao: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menu: { padding: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  itemPressed: { backgroundColor: colors.background },
  itemIcone: { fontSize: 22 },
  itemTitulo: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemDescricao: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  seta: { fontSize: 22, color: colors.textMuted },
  divisor: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
