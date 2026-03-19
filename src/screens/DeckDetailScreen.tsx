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
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
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
        <Pressable onPress={() => nav.goBack()} hitSlop={8} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>Baralho · {deck.privacidade}</Text>
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
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statNumero, { color: colors.warning }]}>{pendentes}</Text>
                <Text style={styles.statLabel}>A revisar</Text>
              </View>
              <View style={styles.statDivider} />
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
                  title="Gerar com IA"
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

            <View style={styles.secaoWrap}>
              <Text style={styles.secao}>Flashcards</Text>
              <View style={styles.secaoRegua} />
            </View>
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
            <Text style={styles.labelFrente}>Pergunta</Text>
            <Text style={styles.frente}>{item.frente}</Text>
            <View style={styles.linha} />
            <Text style={styles.labelVerso}>Resposta</Text>
            <Text style={styles.verso} numberOfLines={3}>
              {item.verso}
            </Text>
            <View style={styles.cardRodape}>
              <Text style={styles.cardMeta}>
                Repetições: {item.repeticoes} · Facilidade: {item.facilidade.toFixed(2)}
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
  topo: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  voltar: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: spacing.md,
  },
  voltarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDeep,
    letterSpacing: 0.2,
  },
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.textSoft,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -0.6,
    flex: 1,
    lineHeight: 34,
  },
  descricao: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
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
  acoes: { marginTop: spacing.lg },
  linhaBotoes: { flexDirection: 'row' },
  botaoFlex: { flex: 1 },
  secaoWrap: { marginTop: spacing.xl, marginBottom: spacing.md },
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
  cardItem: { marginBottom: spacing.sm },
  labelFrente: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.textSoft,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  labelVerso: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.textSoft,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  frente: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  linha: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  verso: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  cardRodape: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flex: 1,
  },
  cardAcoes: { flexDirection: 'row', gap: spacing.sm },
  acaoBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  acaoBtnPressed: { opacity: 0.6 },
  acaoTextoEditar: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.primaryDeep,
  },
  acaoTextoExcluir: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.danger,
  },
});
