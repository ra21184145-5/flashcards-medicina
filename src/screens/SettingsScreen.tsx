import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { StackNav } from '../navigation/types';

const MODELOS_SUGERIDOS = [
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
];

export function SettingsScreen() {
  const nav = useNavigation<StackNav>();
  const { config, atualizarConfig } = useData();
  const [chave, setChave] = useState(config.geminiApiKey);
  const [modelo, setModelo] = useState(config.geminiModelo);
  const [salvou, setSalvou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    try {
      setErro(null);
      await atualizarConfig({
        geminiApiKey: chave.trim(),
        geminiModelo: modelo.trim() || 'gemini-3.1-pro-preview',
      });
      setSalvou(true);
      setTimeout(() => setSalvou(false), 2200);
    } catch (e: any) {
      setErro(e?.message || 'Nao foi possivel salvar.');
    }
  }

  function abrirLinkAPI() {
    Linking.openURL('https://aistudio.google.com/app/apikey').catch(() => {
      // silencioso: o usuario pode estar em ambiente sem navegador.
    });
  }

  const mascarada = chave ? chave.slice(0, 6) + '•'.repeat(Math.max(0, chave.length - 10)) + chave.slice(-4) : '';

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Configuracoes</Text>
        <Text style={styles.subtitulo}>
          Gerencie sua chave de API para a geracao automatica de flashcards.
        </Text>

        <Card style={styles.secaoCard}>
          <Text style={styles.secaoTitulo}>Google Gemini</Text>
          <Text style={styles.secaoTexto}>
            Este aplicativo usa a API do Google Gemini para gerar flashcards a partir de material de estudo. A chave e salva apenas no seu dispositivo.
          </Text>

          <Pressable onPress={abrirLinkAPI} style={styles.linkBox}>
            <Text style={styles.linkTexto}>Obtenha sua chave em aistudio.google.com</Text>
            <Text style={styles.linkSeta}>↗</Text>
          </Pressable>

          <Input
            label="Chave de API"
            placeholder="AIza..."
            value={chave}
            onChangeText={setChave}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          {chave ? (
            <Text style={styles.previewChave}>Atual: {mascarada}</Text>
          ) : (
            <Text style={styles.avisoChave}>Nenhuma chave configurada.</Text>
          )}

          <View style={{ height: spacing.md }} />

          <Input
            label="Modelo"
            placeholder="gemini-3.1-pro-preview"
            value={modelo}
            onChangeText={setModelo}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.modelos}>
            {MODELOS_SUGERIDOS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setModelo(m)}
                style={[styles.chipModelo, modelo === m && styles.chipModeloAtivo]}
              >
                <Text style={[styles.chipModeloTexto, modelo === m && styles.chipModeloTextoAtivo]}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ height: spacing.md }} />

          <Button title={salvou ? 'Salvo ✓' : 'Salvar configuracoes'} onPress={salvar} />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        </Card>

        <Card style={styles.secaoCard}>
          <Text style={styles.secaoTitulo}>Sobre</Text>
          <Text style={styles.secaoTexto}>
            Flashcards Medicina e um aplicativo de estudo com revisao espacada (SM-2 simplificado) voltado a estudantes e profissionais de medicina. Desenvolvido como Trabalho de Conclusao de Curso em Engenharia de Software.
          </Text>
          <Text style={styles.versao}>versao 1.1.0</Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  voltar: { paddingVertical: 6, alignSelf: 'flex-start' },
  voltarTexto: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  titulo: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  secaoCard: { marginBottom: spacing.md },
  secaoTitulo: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  secaoTexto: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.md },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F0F6FF',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  linkTexto: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  linkSeta: { color: colors.primary, fontSize: 14 },
  previewChave: { fontSize: 12, color: colors.textMuted, marginTop: -4 },
  avisoChave: { fontSize: 12, color: colors.warning, marginTop: -4 },
  modelos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chipModelo: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipModeloAtivo: {
    borderColor: colors.primary,
    backgroundColor: '#E6EFFB',
  },
  chipModeloTexto: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  chipModeloTextoAtivo: { color: colors.primary },
  erro: { color: colors.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },
  versao: { fontSize: 11, color: colors.textSoft, marginTop: -spacing.sm },
});
