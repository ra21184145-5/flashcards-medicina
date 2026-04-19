import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
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
        <Text style={styles.eyebrow}>PERFIL</Text>
        <Text style={styles.titulo}>Sua conta</Text>
      </View>
      <View style={styles.conteudo}>
        <Card>
          <View style={styles.avatarLinha}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {(user?.nome ?? '?').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{user?.nome}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.painelStats}>
          <View style={styles.statCol}>
            <Text style={styles.statNumero}>{meusDecks}</Text>
            <Text style={styles.statLabel}>Baralhos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumero, { color: colors.accent }]}>{cards.length}</Text>
            <Text style={styles.statLabel}>Flashcards</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumero, { color: colors.amber }]}>{meusGrupos}</Text>
            <Text style={styles.statLabel}>Grupos</Text>
          </View>
        </View>

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Mais</Text>
          <View style={styles.secaoRegua} />
        </View>
        <Card style={styles.menu}>
          <MenuItem
            titulo="Estatísticas"
            descricao="Streak, acertos e histórico"
            onPress={() => nav.navigate('Stats')}
          />
          <View style={styles.divisor} />
          <MenuItem
            titulo="Configurações"
            descricao="Chave da API Gemini e modelo"
            onPress={() => nav.navigate('Settings')}
          />
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <Button title="Sair da conta" variant="outline" onPress={sair} />
        </View>
      </View>
    </ScreenContainer>
  );
}

function MenuItem({
  titulo,
  descricao,
  onPress,
}: {
  titulo: string;
  descricao: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.textSoft,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  conteudo: { padding: spacing.lg, paddingTop: spacing.sm },
  avatarLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontFamily: fonts.display,
    color: '#fff',
    fontSize: 24,
    letterSpacing: -0.2,
  },
  nome: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  painelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  statNumero: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.primaryDeep,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  secaoWrap: { marginTop: spacing.xl, marginBottom: spacing.sm },
  secao: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  secaoRegua: {
    width: 32,
    height: 2,
    backgroundColor: colors.amber,
  },
  menu: { padding: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  itemPressed: { backgroundColor: colors.surfaceMuted },
  itemTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.1,
  },
  itemDescricao: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  seta: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textSoft,
  },
  divisor: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
