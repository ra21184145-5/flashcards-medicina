import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
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
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.topo}>
        <Button title="← Voltar" variant="ghost" onPress={() => nav.goBack()} style={styles.voltar} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Novo grupo</Text>
          <Text style={styles.subtitulo}>Reuna colegas para compartilhar baralhos de estudo.</Text>

          <View style={{ marginTop: spacing.lg }}>
            <Input
              label="Nome"
              placeholder="Ex.: Medicina UFSM - Turma 2024"
              value={nome}
              onChangeText={setNome}
            />
            <Input
              label="Descricao"
              placeholder="Sobre o que sera esse grupo"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <Pressable
              onPress={() => setRequerAprovacao((v) => !v)}
              style={[styles.toggle, requerAprovacao && styles.toggleAtivo]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitulo}>Requer aprovacao</Text>
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
  toggle: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  toggleAtivo: {
    borderColor: colors.primary,
    backgroundColor: '#EEF4FE',
  },
  toggleTitulo: { fontSize: 14, fontWeight: '600', color: colors.text },
  toggleDescricao: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchAtivo: { backgroundColor: colors.primary },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  knobAtivo: {
    transform: [{ translateX: 18 }],
  },
  erro: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
});
