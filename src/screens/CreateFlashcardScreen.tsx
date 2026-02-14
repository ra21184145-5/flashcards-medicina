import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { StackNav, StackRoute } from '../navigation/types';

export function CreateFlashcardScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'CreateFlashcard'>>();
  const { deckId } = route.params;
  const { criarCard, decks } = useData();

  const deck = decks.find((d) => d.id === deckId);

  const [frente, setFrente] = useState('');
  const [verso, setVerso] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function salvar(novo: boolean) {
    if (!frente.trim() || !verso.trim()) {
      setErro('Preencha frente e verso.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await criarCard(deckId, frente.trim(), verso.trim());
      if (novo) {
        setFrente('');
        setVerso('');
      } else {
        nav.goBack();
      }
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.topo}>
        <Button title="← Voltar" variant="ghost" onPress={() => nav.goBack()} style={styles.voltar} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Novo flashcard</Text>
          <Text style={styles.subtitulo}>
            {deck ? `Em: ${deck.nome}` : 'Novo cartao'}
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Frente (pergunta)"
              placeholder="Ex.: Qual o mecanismo de acao do Losartan?"
              value={frente}
              onChangeText={setFrente}
              multiline
              numberOfLines={3}
              style={{ minHeight: 90, textAlignVertical: 'top' }}
            />
            <Input
              label="Verso (resposta)"
              placeholder="Ex.: Bloqueador do receptor AT1 da angiotensina II."
              value={verso}
              onChangeText={setVerso}
              multiline
              numberOfLines={4}
              style={{ minHeight: 110, textAlignVertical: 'top' }}
            />
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <Button title="Salvar e voltar" onPress={() => salvar(false)} loading={loading} />
            <View style={{ height: spacing.sm }} />
            <Button
              title="Salvar e adicionar outro"
              variant="outline"
              onPress={() => salvar(true)}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topo: { paddingHorizontal: spacing.sm, paddingTop: spacing.xs },
  voltar: { alignSelf: 'flex-start', paddingHorizontal: spacing.md },
  container: { padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: 120 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  erro: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});
