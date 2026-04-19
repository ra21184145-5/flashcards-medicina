import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { calcularProximaRevisao, cardsParaRevisar } from '../services/spacedRepetition';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav, StackRoute } from '../navigation/types';
import { Qualidade } from '../types';

const BOTOES: { q: Qualidade; label: string; cor: string; hint: string }[] = [
  { q: 1, label: 'Errei', cor: '#B4382E', hint: 'não lembrei' },
  { q: 3, label: 'Difícil', cor: '#C68A16', hint: 'com esforço' },
  { q: 4, label: 'Bom', cor: '#1F6FEB', hint: 'lembrei' },
  { q: 5, label: 'Fácil', cor: '#0A8055', hint: 'sem esforço' },
];

export function StudyScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'Study'>>();
  const { deckId } = route.params;
  const { decks, cardsDoDeck, atualizarCard, registrarRevisao } = useData();

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
    await registrarRevisao(atualizado, qualidade);
    if (indice + 1 >= fila.length) {
      nav.goBack();
      return;
    }
    setIndice(indice + 1);
    setRevelou(false);
  }

  if (!deck) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <EmptyState titulo="Baralho nao encontrado" icone="❓" />
      </ScreenContainer>
    );
  }

  if (!atual) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <EmptyState
          titulo="Nada para revisar agora"
          descricao="Voce esta em dia com esse baralho. Volte mais tarde."
          icone="✅"
          acao={<Button title="Voltar" onPress={() => nav.goBack()} />}
        />
      </ScreenContainer>
    );
  }

  const progresso = ((indice) / fila.length) * 100;

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} hitSlop={8} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Sair</Text>
        </Pressable>
        <View style={styles.topoMeio}>
          <Text style={styles.topoLabel}>Sessão</Text>
          <Text style={styles.deckNome} numberOfLines={1}>{deck.nome}</Text>
        </View>
        <Text style={styles.contador}>
          <Text style={styles.contadorAtual}>{indice + 1}</Text>
          <Text style={styles.contadorBarra}> / </Text>
          <Text>{fila.length}</Text>
        </Text>
      </View>

      <View style={styles.progressoWrap}>
        <View style={[styles.progresso, { width: `${progresso}%` }]} />
      </View>

      <View style={styles.cardArea}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.labelSecao}>Pergunta</Text>
            <Text style={styles.cardNumero}>{String(indice + 1).padStart(2, '0')}</Text>
          </View>
          <Text style={styles.frente}>{atual.frente}</Text>

          {revelou ? (
            <>
              <View style={styles.divisor} />
              <Text style={styles.labelSecao}>Resposta</Text>
              <Text style={styles.verso}>{atual.verso}</Text>
            </>
          ) : (
            <View style={styles.ocultoHint}>
              <Text style={styles.ocultoTexto}>
                Pense na resposta antes de revelar — a recordação ativa fortalece a memória.
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rodape}>
        {!revelou ? (
          <Button title="Mostrar resposta" onPress={() => setRevelou(true)} />
        ) : (
          <>
            <Text style={styles.rodapeLabel}>Como você se saiu?</Text>
            <View style={styles.botoes}>
              {BOTOES.map((b) => (
                <Pressable
                  key={b.q}
                  onPress={() => responder(b.q)}
                  style={({ pressed }) => [
                    styles.botaoQ,
                    { backgroundColor: b.cor },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.botaoTexto}>{b.label}</Text>
                  <Text style={styles.botaoHint}>{b.hint}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  voltar: { paddingVertical: 6 },
  voltarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDeep,
  },
  topoMeio: {
    flex: 1,
    alignItems: 'center',
  },
  topoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.textSoft,
    textTransform: 'uppercase',
  },
  deckNome: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.2,
  },
  contador: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.textMuted,
  },
  contadorAtual: {
    fontFamily: fonts.display,
    color: colors.primaryDeep,
  },
  contadorBarra: {
    color: colors.textSoft,
  },
  progressoWrap: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progresso: {
    height: '100%',
    backgroundColor: colors.primaryDeep,
  },
  cardArea: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    minHeight: 260,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardNumero: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.amber,
    letterSpacing: 0.5,
  },
  labelSecao: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textSoft,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  frente: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  divisor: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  verso: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  ocultoHint: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ocultoTexto: {
    fontFamily: fonts.displayItalic,
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 20,
  },
  rodape: { padding: spacing.lg, paddingBottom: spacing.xl },
  rodapeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textSoft,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  botoes: { flexDirection: 'row', gap: spacing.sm },
  botaoQ: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  botaoTexto: {
    fontFamily: fonts.bodyBold,
    color: '#fff',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  botaoHint: {
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
