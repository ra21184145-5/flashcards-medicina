import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useData } from '../context/DataContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
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

  const mascarada = chave
    ? chave.slice(0, 6) + '•'.repeat(Math.max(0, chave.length - 10)) + chave.slice(-4)
    : '';

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>CONFIGURAÇÕES</Text>
        <Text style={styles.titulo}>Preferências</Text>
        <Text style={styles.subtitulo}>
          Gerencie sua chave de API para a geração automática de flashcards.
        </Text>

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Google Gemini</Text>
          <View style={styles.secaoRegua} />
        </View>
        <Card style={styles.secaoCard}>
          <Text style={styles.secaoTexto}>
            Este aplicativo usa a API do Google Gemini para gerar flashcards a partir de material de estudo. A chave é salva apenas no seu dispositivo.
          </Text>

          <Pressable onPress={abrirLinkAPI} style={styles.linkBox}>
            <Text style={styles.linkTexto}>
              Obtenha sua chave em aistudio.google.com
            </Text>
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
            <Text style={styles.previewChave}>
              Atual: <Text style={styles.previewChaveMono}>{mascarada}</Text>
            </Text>
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
                <Text
                  style={[
                    styles.chipModeloTexto,
                    modelo === m && styles.chipModeloTextoAtivo,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ height: spacing.md }} />

          <Button title={salvou ? 'Salvo ✓' : 'Salvar configurações'} onPress={salvar} />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        </Card>

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Sobre</Text>
          <View style={styles.secaoRegua} />
        </View>
        <Card style={styles.secaoCard}>
          <Text style={styles.secaoTexto}>
            Flashcards Medicina é um aplicativo de estudo com revisão espaçada (SM-2 simplificado) voltado a estudantes e profissionais de medicina. Desenvolvido como Trabalho de Conclusão de Curso em Engenharia de Software.
          </Text>
          <Text style={styles.versao}>versão 1.1.0</Text>
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
  voltarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDeep,
    letterSpacing: 0.2,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
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
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  secaoWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
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
  secaoCard: { marginBottom: spacing.md },
  secaoTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.primaryDeep,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  linkTexto: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryDeep,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  linkSeta: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryDeep,
    fontSize: 14,
  },
  previewChave: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },
  previewChaveMono: {
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    letterSpacing: 0.6,
  },
  avisoChave: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.amber,
    marginTop: -4,
    letterSpacing: 0.2,
  },
  modelos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chipModelo: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipModeloAtivo: {
    borderColor: colors.primaryDeep,
    backgroundColor: colors.primarySoft,
  },
  chipModeloTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  chipModeloTextoAtivo: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryDeep,
  },
  erro: {
    fontFamily: fonts.bodyMedium,
    color: colors.danger,
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  versao: {
    fontFamily: fonts.displayItalic,
    fontSize: 12,
    color: colors.textSoft,
    marginTop: -spacing.sm,
    letterSpacing: 0.2,
  },
});
