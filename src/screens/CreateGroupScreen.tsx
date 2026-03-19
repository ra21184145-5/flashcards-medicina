import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';

export function CreateGroupScreen() {
  const nav = useNavigation<StackNav>();
  const { criarGrupo } = useData();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [requerAprovacao, setRequerAprovacao] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCriar() {
    if (!nome.trim()) {
      setErro('Informe o nome do grupo.');
      return;
    }
    setErro('');
    setLoading(true);
    try {
      await criarGrupo({
        nome: nome.trim(),
        descricao: descricao.trim(),
        requerAprovacao,
      });
      nav.goBack();
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao criar grupo.');
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
          <Text style={styles.eyebrow}>NOVO GRUPO</Text>
          <Text style={styles.titulo}>Criar grupo de estudo</Text>
          <Text style={styles.subtitulo}>
            Reúna colegas para compartilhar baralhos e revisar juntos.
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Nome"
              placeholder="Ex.: Medicina UFSM — Turma 2024"
              value={nome}
              onChangeText={setNome}
            />
            <Input
              label="Descrição"
              placeholder="Sobre o que será esse grupo"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <View style={styles.secaoWrap}>
              <Text style={styles.secao}>Acesso</Text>
              <View style={styles.secaoRegua} />
            </View>

            <Pressable
              onPress={() => setRequerAprovacao((v) => !v)}
              style={[styles.toggle, requerAprovacao && styles.toggleAtivo]}
            >
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={styles.toggleTitulo}>Requer aprovação</Text>
                <Text style={styles.toggleDescricao}>
                  Novos membros precisam ser aprovados por um administrador.
                </Text>
              </View>
              <View style={[styles.switch, requerAprovacao && styles.switchAtivo]}>
                <View style={[styles.knob, requerAprovacao && styles.knobAtivo]} />
              </View>
            </Pressable>

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <View style={{ marginTop: spacing.lg }}>
              <Button title="Criar grupo" onPress={handleCriar} loading={loading} />
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
  toggle: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  toggleAtivo: {
    borderColor: colors.primaryDeep,
    backgroundColor: colors.primarySoft,
  },
  toggleTitulo: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.1,
  },
  toggleDescricao: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchAtivo: { backgroundColor: colors.primaryDeep },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  knobAtivo: {
    transform: [{ translateX: 18 }],
  },
  erro: {
    fontFamily: fonts.bodyMedium,
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.md,
  },
});
