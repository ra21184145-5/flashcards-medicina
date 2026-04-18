import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { calcularProximaRevisao, cardsParaRevisar } from '../services/spacedRepetition';
import { colors, spacing } from '../theme/colors';
import { StackNav, StackRoute } from '../navigation/types';
import { Qualidade } from '../types';

const BOTOES: { q: Qualidade; label: string; cor: string; hint: string }[] = [
  { q: 1, label: 'Errei', cor: '#E53935', hint: 'Nao lembrei' },
  { q: 3, label: 'Dificil', cor: '#F2A516', hint: 'Com esforco' },
  { q: 4, label: 'Bom', cor: '#1F6FEB', hint: 'Lembrei' },
  { q: 5, label: 'Facil', cor: '#11B981', hint: 'Sem esforco' },
];

export function StudyScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'Study'>>();
  const { deckId } = route.params;
  const { decks, cardsDoDeck, atualizarCard } = useData();

  const deck = decks.find((d) => d.id === deckId);
  const cardsDeck = cardsDoDeck(deckId);
  const fila = useMemo(() => {
    const pendentes = cardsParaRevisar(cardsDeck);
    return pendentes.length > 0 ? pendentes : cardsDeck;
  }, [cardsDeck]);

  const [indice, setIndice] = useState(0);
  const [revelou, setRevelou] = useState(false);

  const atual = fila[indice];

  async function responder(qualidade: Qualidade) {
    if (!atual) return;
    const atualizado = calcularProximaRevisao(atual, qualidade);
    await atualizarCard(atualizado);
    if (indice + 1 >= fila.length) {
      // acabou - volta pro deck
      nav.goBack();
      return;
    }
    setIndice(indice + 1);
    setRevelou(false);
  }

  if (!deck) {
    return (
      <SafeAreaView style={styles.flex}>
        <EmptyState titulo="Baralho nao encontrado" icone="❓" />
      </SafeAreaView>
    );
  }

  if (!atual) {
    return (
      <SafeAreaView style={styles.flex}>
        <EmptyState
          titulo="Nada para revisar agora"
          descricao="Voce esta em dia com esse baralho. Volte mais tarde."
          icone="✅"
          acao={<Button title="Voltar" onPress={() => nav.goBack()} />}
        />
      </SafeAreaView>
    );
  }

  const progresso = ((indice) / fila.length) * 100;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Sair</Text>
        </Pressable>
        <Text style={styles.deckNome} numberOfLines={1}>{deck.nome}</Text>
        <Text style={styles.contador}>{indice + 1}/{fila.length}</Text>
      </View>

      <View style={styles.progressoWrap}>
        <View style={[styles.progresso, { width: `${progresso}%` }]} />
      </View>

      <View style={styles.cardArea}>
        <View style={styles.card}>
          <Text style={styles.labelSecao}>Pergunta</Text>
          <Text style={styles.frente}>{atual.frente}</Text>

          {revelou ? (
            <>
              <View style={styles.divisor} />
              <Text style={styles.labelSecao}>Resposta</Text>
              <Text style={styles.verso}>{atual.verso}</Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.rodape}>
        {!revelou ? (
          <Button title="Mostrar resposta" onPress={() => setRevelou(true)} />
        ) : (
          <View style={styles.botoes}>
            {BOTOES.map((b) => (
              <Pressable
                key={b.q}
                onPress={() => responder(b.q)}
                style={[styles.botaoQ, { backgroundColor: b.cor }]}
              >
                <Text style={styles.botaoTexto}>{b.label}</Text>
                <Text style={styles.botaoHint}>{b.hint}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  voltar: { padding: 6 },
  voltarTexto: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  deckNome: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.text, marginHorizontal: 8 },
  contador: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  progressoWrap: {
    height: 4,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progresso: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  cardArea: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    minHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  labelSecao: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  frente: { fontSize: 20, fontWeight: '600', color: colors.text, lineHeight: 28 },
  divisor: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  verso: { fontSize: 17, color: colors.text, lineHeight: 24 },
  rodape: { padding: spacing.lg, paddingBottom: spacing.xl },
  botoes: { flexDirection: 'row', gap: spacing.sm },
  botaoQ: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },
  botaoHint: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 2 },
});
