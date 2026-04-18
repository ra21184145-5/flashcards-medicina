import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { cardsParaRevisar } from '../services/spacedRepetition';
import { colors, spacing } from '../theme/colors';
import { StackNav } from '../navigation/types';
import { Deck } from '../types';

export function HomeScreen() {
  const nav = useNavigation<StackNav>();
  const { user } = useAuth();
  const { decks, cards, semearDadosExemplo } = useData();

  const meusDecks = useMemo(
    () => decks.filter((d) => d.donoId === user?.id),
    [decks, user]
  );

  const totalParaRevisar = useMemo(() => cardsParaRevisar(cards).length, [cards]);

  function contarPendentes(deck: Deck) {
    const dos = cards.filter((c) => c.deckId === deck.id);
    return cardsParaRevisar(dos).length;
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.cumprimento}>Ola, {user?.nome ?? 'estudante'}</Text>
          <Text style={styles.titulo}>Meus baralhos</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeNumero}>{totalParaRevisar}</Text>
          <Text style={styles.badgeLabel}>a revisar</Text>
        </View>
      </View>

      <FlatList
        data={meusDecks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.acoes}>
            <Button title="+ Novo baralho" onPress={() => nav.navigate('CreateDeck')} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            titulo="Voce ainda nao tem baralhos"
            descricao="Crie seu primeiro baralho ou carregue alguns exemplos de medicina para comecar."
            icone="🗂️"
            acao={
              <>
                <Button title="+ Criar baralho" onPress={() => nav.navigate('CreateDeck')} />
                <View style={{ height: spacing.sm }} />
                <Button title="Carregar exemplos" variant="outline" onPress={semearDadosExemplo} />
              </>
            }
          />
        }
        renderItem={({ item }) => {
          const pendentes = contarPendentes(item);
          return (
            <Card
              onPress={() => nav.navigate('DeckDetail', { deckId: item.id })}
              style={{ marginBottom: spacing.md }}
            >
              <View style={styles.deckHeader}>
                <Text style={styles.deckNome}>{item.nome}</Text>
                <Chip privacidade={item.privacidade} />
              </View>
              {item.descricao ? (
                <Text style={styles.deckDescricao} numberOfLines={2}>
                  {item.descricao}
                </Text>
              ) : null}
              <View style={styles.deckRodape}>
                <Text style={styles.deckMeta}>
                  {item.totalCards} {item.totalCards === 1 ? 'card' : 'cards'}
                </Text>
                {pendentes > 0 ? (
                  <View style={styles.pill}>
                    <Text style={styles.pillTexto}>{pendentes} para revisar</Text>
                  </View>
                ) : (
                  <Text style={styles.deckMetaOk}>em dia</Text>
                )}
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cumprimento: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  badgeNumero: { color: '#fff', fontSize: 18, fontWeight: '800' },
  badgeLabel: { color: '#fff', fontSize: 10, letterSpacing: 0.5 },
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  acoes: { marginBottom: spacing.md },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  deckNome: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  deckDescricao: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  deckRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deckMeta: { fontSize: 12, color: colors.textMuted },
  deckMetaOk: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  pill: {
    backgroundColor: '#FEF2CF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillTexto: { fontSize: 11, color: '#8A5C00', fontWeight: '600' },
});
