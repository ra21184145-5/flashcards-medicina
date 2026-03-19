import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav, StackRoute } from '../navigation/types';

export function CreateFlashcardScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'CreateFlashcard'>>();
  const { deckId, editId } = route.params;
  const { criarCard, atualizarCard, decks, cards } = useData();

  const deck = decks.find((d) => d.id === deckId);
  const cardParaEditar = editId ? cards.find((c) => c.id === editId) : undefined;
  const modoEdicao = !!cardParaEditar;

  const [frente, setFrente] = useState('');
  const [verso, setVerso] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cardParaEditar) {
      setFrente(cardParaEditar.frente);
      setVerso(cardParaEditar.verso);
    }
  }, [cardParaEditar]);

  async function salvar(novo: boolean) {
    if (!frente.trim() || !verso.trim()) {
      setErro('Preencha frente e verso.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      if (modoEdicao && cardParaEditar) {
        await atualizarCard({
          ...cardParaEditar,
          frente: frente.trim(),
          verso: verso.trim(),
        });
        nav.goBack();
      } else {
        await criarCard(deckId, frente.trim(), verso.trim());
        if (novo) {
          setFrente('');
          setVerso('');
        } else {
          nav.goBack();
        }
      }
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar} hitSlop={8}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>
            {modoEdicao ? 'EDITAR FLASHCARD' : 'NOVO FLASHCARD'}
          </Text>
          <Text style={styles.titulo}>
            {modoEdicao ? 'Revisar cartão' : 'Criar cartão'}
          </Text>
          <Text style={styles.subtitulo}>
            {deck
              ? <>Em: <Text style={styles.subtituloDeck}>{deck.nome}</Text></>
              : modoEdicao
              ? 'Ajuste os textos abaixo.'
              : 'Um par de pergunta e resposta por vez.'}
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Frente (pergunta)"
              placeholder="Ex.: Qual o mecanismo de ação do Losartan?"
              value={frente}
              onChangeText={setFrente}
              multiline
              numberOfLines={3}
              style={{ minHeight: 96, textAlignVertical: 'top' }}
            />
            <Input
              label="Verso (resposta)"
              placeholder="Ex.: Bloqueador do receptor AT1 da angiotensina II."
              value={verso}
              onChangeText={setVerso}
              multiline
              numberOfLines={4}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <Button
              title={modoEdicao ? 'Salvar alterações' : 'Salvar e voltar'}
              onPress={() => salvar(false)}
              loading={loading}
            />
            {!modoEdicao ? (
              <>
                <View style={{ height: spacing.sm }} />
                <Button
                  title="Salvar e adicionar outro"
                  variant="outline"
                  onPress={() => salvar(true)}
                  loading={loading}
                />
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
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
  container: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
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
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 21,
  },
  subtituloDeck: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryDeep,
  },
  erro: {
    fontFamily: fonts.bodyMedium,
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
