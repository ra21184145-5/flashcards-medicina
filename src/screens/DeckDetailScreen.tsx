import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { cardsParaRevisar } from '../services/spacedRepetition';
import { colors, spacing } from '../theme/colors';
import { StackNav, StackRoute } from '../navigation/types';

export function DeckDetailScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'DeckDetail'>>();
  const { deckId } = route.params;
  const { decks, cardsDoDeck, removerDeck } = useData();

  const deck = decks.find((d) => d.id === deckId);
  const cards = useMemo(() => cardsDoDeck(deckId), [cardsDoDeck, deckId]);
  const pendentes = useMemo(() => cardsParaRevisar(cards).length, [cards]);

  if (!deck) {
    return (
      <SafeAreaView style={styles.flex}>
        <EmptyState titulo="Baralho nao encontrado" icone="❓" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.topo}>
        <Button title="← Voltar" variant="ghost" onPress={() => nav.goBack()} style={styles.voltar} />
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <View style={styles.cabecalho}>
              <Text style={styles.titulo}>{deck.nome}</Text>
              <Chip privacidade={deck.privacidade} />
            </View>
            {deck.descricao ? <Text style={styles.descricao}>{deck.descricao}</Text> : null}

            <View style={styles.stats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumero}>{cards.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumero, { color: colors.warning }]}>{pendentes}</Text>
                <Text style={styles.statLabel}>A revisar</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumero, { color: colors.accent }]}>
                  {cards.length - pendentes}
                </Text>
                <Text style={styles.statLabel}>Em dia</Text>
              </View>
            </View>

            <View style={styles.acoes}>
              <Button
                title={pendentes > 0 ? `Estudar (${pendentes})` : 'Revisar todos'}
                onPress={() => nav.navigate('Study', { deckId })}
                disabled={cards.length === 0}
              />
              <View style={{ height: spacing.sm }} />
              <Button
                title="+ Adicionar card"
                variant="outline"
                onPress={() => nav.navigate('CreateFlashcard', { deckId })}
              />
            </View>

            <Text style={styles.secao}>Flashcards</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            titulo="Sem flashcards ainda"
            descricao="Adicione sua primeira pergunta e resposta para comecar a estudar."
            icone="➕"
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.cardItem}>
            <Text style={styles.frente}>{item.frente}</Text>
            <View style={styles.linha} />
            <Text style={styles.verso} numberOfLines={3}>
              {item.verso}
            </Text>
            <View style={styles.cardRodape}>
              <Text style={styles.cardMeta}>
                Repeticoes: {item.repeticoes} • Facilidade: {item.facilidade.toFixed(2)}
              </Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topo: { paddingHorizontal: spacing.sm, paddingTop: spacing.xs },
  voltar: { alignSelf: 'flex-start', paddingHorizontal: spacing.md },
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, flex: 1 },
  descricao: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumero: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  acoes: { marginTop: spacing.lg },
  secao: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  cardItem: { marginBottom: spacing.sm },
  frente: { fontSize: 15, color: colors.text, fontWeight: '600' },
  linha: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  verso: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  cardRodape: { marginTop: spacing.sm },
  cardMeta: { fontSize: 11, color: colors.textSoft },
});
