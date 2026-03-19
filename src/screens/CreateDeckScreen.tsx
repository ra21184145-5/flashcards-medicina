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
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav, StackRoute } from '../navigation/types';
import { Privacy } from '../types';

const OPCOES_PRIVACIDADE: { valor: Privacy; titulo: string; descricao: string }[] = [
  { valor: 'privado', titulo: 'Privado', descricao: 'Apenas você acessa.' },
  { valor: 'grupo', titulo: 'Grupo', descricao: 'Compartilhado com um grupo de estudo.' },
  { valor: 'publico', titulo: 'Público', descricao: 'Qualquer usuário pode visualizar.' },
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
      setErro('Dá um nome para o baralho.');
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
            {modoEdicao ? 'EDITAR BARALHO' : 'NOVO BARALHO'}
          </Text>
          <Text style={styles.titulo}>
            {modoEdicao ? 'Ajustes do baralho' : 'Criar baralho'}
          </Text>
          <Text style={styles.subtitulo}>
            {modoEdicao
              ? 'Atualize as informações abaixo.'
              : 'Organize seus flashcards por tema ou disciplina.'}
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Nome"
              placeholder="Ex.: Cardiologia — Farmacologia"
              value={nome}
              onChangeText={setNome}
            />
            <Input
              label="Descrição (opcional)"
              placeholder="Breve descrição do conteúdo"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <View style={styles.secaoWrap}>
              <Text style={styles.secao}>Privacidade</Text>
              <View style={styles.secaoRegua} />
            </View>
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
                <View style={styles.secaoWrap}>
                  <Text style={styles.secao}>Selecione o grupo</Text>
                  <View style={styles.secaoRegua} />
                </View>
                {grupos.length === 0 ? (
                  <Text style={styles.aviso}>Você ainda não está em nenhum grupo.</Text>
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
                title={modoEdicao ? 'Salvar alterações' : 'Criar baralho'}
                onPress={handleSalvar}
                loading={loading}
              />
            </View>
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
  secaoWrap: { marginTop: spacing.md, marginBottom: spacing.sm },
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
  opcao: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  opcaoAtiva: {
    borderColor: colors.primaryDeep,
    backgroundColor: colors.primarySoft,
  },
  opcaoTexto: { flex: 1, paddingRight: spacing.md },
  opcaoTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.1,
  },
  opcaoDescricao: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
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
    borderColor: colors.primaryDeep,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryDeep,
  },
  aviso: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  erro: {
    fontFamily: fonts.bodyMedium,
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.md,
  },
});
