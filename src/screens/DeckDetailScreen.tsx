import React, { useMemo } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { cardsParaRevisar } from '../services/spacedRepetition';
import { colors, spacing } from '../theme/colors';
import { StackNav, StackRoute } from '../navigation/types';

function confirmar(titulo: string, mensagem: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(`${titulo}\n\n${mensagem}`)) onOk();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: onOk },
  ]);
}

export function DeckDetailScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'DeckDetail'>>();
  const { deckId } = route.params;
  const { decks, cardsDoDeck, removerDeck, removerCard } = useData();

  const deck = decks.find((d) => d.id === deckId);
  const cards = useMemo(() => cardsDoDeck(deckId), [cardsDoDeck, deckId]);
  const pendentes = useMemo(() => cardsParaRevisar(cards).length, [cards]);

  if (!deck) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <EmptyState titulo="Baralho nao encontrado" icone="❓" />
      </ScreenContainer>
    );
  }

  function excluirDeck() {
    confirmar(
      'Excluir baralho',
      `Tem certeza? "${deck!.nome}" e todos os ${cards.length} cartoes serao removidos.`,
      async () => {
        await removerDeck(deckId);
        nav.goBack();
      }
    );
  }

  function excluirCard(id: string, pergunta: string) {
    confirmar('Excluir cartao', `"${pergunta.slice(0, 60)}${pergunta.length > 60 ? '...' : ''}" sera removido.`, async () => {
      await removerCard(id);
    });
  }

  return (
    <ScreenContainer>
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
              <View style={styles.linhaBotoes}>
                <Button
                  title="+ Adicionar card"
                  variant="outline"
                  onPress={() => nav.navigate('CreateFlashcard', { deckId })}
                  style={styles.botaoFlex}
                />
                <View style={{ width: spacing.sm }} />
                <Button
                  title="✨ Gerar com IA"
                  variant="outline"
                  onPress={() => nav.navigate('AIGenerate', { deckId })}
                  style={styles.botaoFlex}
                />
              </View>
              <View style={{ height: spacing.sm }} />
              <View style={styles.linhaBotoes}>
                <Button
                  title="Editar baralho"
                  variant="ghost"
                  onPress={() => nav.navigate('CreateDeck', { editId: deckId })}
                  style={styles.botaoFlex}
                />
                <View style={{ width: spacing.sm }} />
                <Button
                  title="Excluir"
                  variant="danger"
                  onPress={excluirDeck}
                  style={styles.botaoFlex}
                />
              </View>
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
              <View style={styles.cardAcoes}>
                <Pressable
                  onPress={() => nav.navigate('CreateFlashcard', { deckId, editId: item.id })}
                  hitSlop={8}
                  style={({ pressed }) => [styles.acaoBtn, pressed && styles.acaoBtnPressed]}
                >
                  <Text style={styles.acaoTextoEditar}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => excluirCard(item.id, item.frente)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.acaoBtn, pressed && styles.acaoBtnPressed]}
                >
                  <Text style={styles.acaoTextoExcluir}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
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
  linhaBotoes: { flexDirection: 'row' },
  botaoFlex: { flex: 1 },
  secao: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  cardItem: { marginBottom: spacing.sm },
  frente: { fontSize: 15, color: colors.text, fontWeight: '600' },
  linha: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  verso: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  cardRodape: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardMeta: { fontSize: 11, color: colors.textSoft, flex: 1 },
  cardAcoes: { flexDirection: 'row', gap: spacing.sm },
  acaoBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  acaoBtnPressed: { opacity: 0.6 },
  acaoTextoEditar: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  acaoTextoExcluir: { fontSize: 12, color: colors.danger, fontWeight: '600' },
});
