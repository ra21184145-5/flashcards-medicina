import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { StackNav, StackRoute } from '../navigation/types';
import { Privacy } from '../types';

const OPCOES_PRIVACIDADE: { valor: Privacy; titulo: string; descricao: string }[] = [
  { valor: 'privado', titulo: 'Privado', descricao: 'Apenas voce acessa.' },
  { valor: 'grupo', titulo: 'Grupo', descricao: 'Compartilhado com um grupo de estudo.' },
  { valor: 'publico', titulo: 'Publico', descricao: 'Qualquer usuario pode visualizar.' },
];

export function CreateDeckScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'CreateDeck'>>();
  const editId = route.params?.editId;
  const { criarDeck, atualizarDeck, grupos, decks } = useData();
  const deckParaEditar = editId ? decks.find((d) => d.id === editId) : undefined;
  const modoEdicao = !!deckParaEditar;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [privacidade, setPrivacidade] = useState<Privacy>('privado');
  const [grupoId, setGrupoId] = useState<string | undefined>(undefined);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deckParaEditar) {
      setNome(deckParaEditar.nome);
      setDescricao(deckParaEditar.descricao);
      setPrivacidade(deckParaEditar.privacidade);
      setGrupoId(deckParaEditar.grupoId);
    }
  }, [deckParaEditar]);

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('Da um nome para o baralho.');
      return;
    }
    if (privacidade === 'grupo' && !grupoId) {
      setErro('Selecione o grupo de compartilhamento.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      if (modoEdicao && deckParaEditar) {
        await atualizarDeck({
          ...deckParaEditar,
          nome: nome.trim(),
          descricao: descricao.trim(),
          privacidade,
          grupoId,
        });
        nav.goBack();
      } else {
        const novo = await criarDeck({
          nome: nome.trim(),
          descricao: descricao.trim(),
          privacidade,
          grupoId,
        });
        nav.replace('DeckDetail', { deckId: novo.id });
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
          <Text style={styles.titulo}>{modoEdicao ? 'Editar baralho' : 'Novo baralho'}</Text>
          <Text style={styles.subtitulo}>
            {modoEdicao ? 'Atualize as informacoes abaixo.' : 'Organize seus flashcards por tema ou disciplina.'}
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Nome"
              placeholder="Ex.: Cardiologia - Farmacologia"
              value={nome}
              onChangeText={setNome}
            />
            <Input
              label="Descricao (opcional)"
              placeholder="Breve descricao do conteudo"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <Text style={styles.secao}>Privacidade</Text>
            {OPCOES_PRIVACIDADE.map((op) => {
              const ativo = privacidade === op.valor;
              return (
                <Pressable
                  key={op.valor}
                  onPress={() => setPrivacidade(op.valor)}
                  style={[styles.opcao, ativo && styles.opcaoAtiva]}
                >
                  <View style={styles.opcaoTexto}>
                    <Text style={styles.opcaoTitulo}>{op.titulo}</Text>
                    <Text style={styles.opcaoDescricao}>{op.descricao}</Text>
                  </View>
                  <View style={[styles.radio, ativo && styles.radioAtivo]}>
                    {ativo ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}

            {privacidade === 'grupo' ? (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.secao}>Selecione o grupo</Text>
                {grupos.length === 0 ? (
                  <Text style={styles.aviso}>Voce ainda nao esta em nenhum grupo.</Text>
                ) : (
                  grupos.map((g) => {
                    const ativo = grupoId === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => setGrupoId(g.id)}
                        style={[styles.opcao, ativo && styles.opcaoAtiva]}
                      >
                        <Text style={styles.opcaoTitulo}>{g.nome}</Text>
                        <View style={[styles.radio, ativo && styles.radioAtivo]}>
                          {ativo ? <View style={styles.radioDot} /> : null}
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </View>
            ) : null}

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title={modoEdicao ? 'Salvar alteracoes' : 'Criar baralho'}
                onPress={handleSalvar}
                loading={loading}
              />
            </View>
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
  secao: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  opcao: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  opcaoAtiva: {
    borderColor: colors.primary,
    backgroundColor: '#EEF4FE',
  },
  opcaoTexto: { flex: 1, paddingRight: spacing.md },
  opcaoTitulo: { fontSize: 15, fontWeight: '600', color: colors.text },
  opcaoDescricao: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAtivo: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  aviso: { fontSize: 13, color: colors.textMuted },
  erro: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
});
