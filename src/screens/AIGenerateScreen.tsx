import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { StackNav, StackRoute } from '../navigation/types';
import {
  CardGerado,
  EstiloCard,
  FormatoCard,
  gerarFlashcardsComIA,
} from '../services/aiGenerator';

const QUANTIDADES = [5, 10, 15, 20, 30];

interface CardEditavel extends CardGerado {
  id: string;
  incluir: boolean;
}

export function AIGenerateScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'AIGenerate'>>();
  const { deckId } = route.params;
  const { decks, config, criarCardsEmLote } = useData();
  const deck = decks.find((d) => d.id === deckId);

  const [material, setMaterial] = useState('');
  const [quantidade, setQuantidade] = useState(10);
  const [estilo, setEstilo] = useState<EstiloCard>('conciso');
  const [formato, setFormato] = useState<FormatoCard>('qa');

  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<CardEditavel[] | null>(null);

  const semChave = !config.geminiApiKey;
  const materialValido = material.trim().length >= 20;
  const podeGerar = !gerando && !semChave && materialValido;

  const selecionados = useMemo(
    () => (resultado ? resultado.filter((c) => c.incluir).length : 0),
    [resultado],
  );

  async function handleGerar() {
    try {
      setErro(null);
      setGerando(true);
      const cards = await gerarFlashcardsComIA({
        material,
        quantidade,
        estilo,
        formato,
        apiKey: config.geminiApiKey,
        modelo: config.geminiModelo,
      });
      setResultado(
        cards.map((c, idx) => ({
          id: `${idx}_${Math.random().toString(36).slice(2, 6)}`,
          frente: c.frente,
          verso: c.verso,
          incluir: true,
        })),
      );
    } catch (e: any) {
      setErro(e?.message || 'Erro desconhecido ao gerar flashcards.');
    } finally {
      setGerando(false);
    }
  }

  async function handleSalvar() {
    if (!resultado) return;
    const paraSalvar = resultado.filter((c) => c.incluir);
    if (paraSalvar.length === 0) {
      Alert.alert('Selecione ao menos um cartao', 'Marque os cartoes que deseja incluir no baralho.');
      return;
    }
    try {
      setSalvando(true);
      await criarCardsEmLote(
        deckId,
        paraSalvar.map((c) => ({ frente: c.frente, verso: c.verso })),
      );
      nav.goBack();
    } catch (e: any) {
      setErro(e?.message || 'Nao foi possivel salvar os cartoes.');
    } finally {
      setSalvando(false);
    }
  }

  function editarCard(id: string, campo: 'frente' | 'verso', valor: string) {
    setResultado((atual) =>
      atual ? atual.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)) : atual,
    );
  }

  function toggleIncluir(id: string) {
    setResultado((atual) =>
      atual ? atual.map((c) => (c.id === id ? { ...c, incluir: !c.incluir } : c)) : atual,
    );
  }

  function abrirConfig() {
    nav.navigate('Settings');
  }

  if (resultado) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.topo}>
          <Pressable onPress={() => setResultado(null)} style={styles.voltar}>
            <Text style={styles.voltarTexto}>← Refazer</Text>
          </Pressable>
          <Text style={styles.topoTitulo}>Revisar cartoes</Text>
          <Text style={styles.topoContador}>{selecionados}/{resultado.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.subtitulo}>
            Edite o texto, desmarque os que nao servem e salve. So os marcados irao para o baralho.
          </Text>

          {resultado.map((card, idx) => (
            <Card key={card.id} style={[styles.cardRev, !card.incluir && styles.cardRevInativo]}>
              <View style={styles.cardRevTopo}>
                <Text style={styles.cardRevIndice}>#{idx + 1}</Text>
                <Pressable onPress={() => toggleIncluir(card.id)} style={styles.toggleWrap}>
                  <View style={[styles.toggle, card.incluir && styles.toggleAtivo]}>
                    {card.incluir ? <Text style={styles.toggleCheck}>✓</Text> : null}
                  </View>
                  <Text style={styles.toggleLabel}>
                    {card.incluir ? 'Incluir' : 'Ignorar'}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Frente</Text>
              <TextInput
                multiline
                value={card.frente}
                onChangeText={(t) => editarCard(card.id, 'frente', t)}
                style={styles.inputMulti}
                editable={card.incluir}
              />

              <Text style={styles.label}>Verso</Text>
              <TextInput
                multiline
                value={card.verso}
                onChangeText={(t) => editarCard(card.id, 'verso', t)}
                style={styles.inputMulti}
                editable={card.incluir}
              />
            </Card>
          ))}

          <View style={{ height: spacing.md }} />

          <Button
            title={salvando ? 'Salvando...' : `Adicionar ${selecionados} ao baralho`}
            onPress={handleSalvar}
            loading={salvando}
            disabled={selecionados === 0}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>Gerar com IA</Text>
              <Text style={styles.subtitulo}>
                Cole o material e a IA transforma em flashcards prontos para revisao espacada.
              </Text>
              {deck ? (
                <Text style={styles.destinoTexto}>
                  Destino: <Text style={styles.destinoNome}>{deck.nome}</Text>
                </Text>
              ) : null}
            </View>
          </View>

          {semChave ? (
            <Card style={styles.alerta}>
              <Text style={styles.alertaTitulo}>Configure sua chave de API</Text>
              <Text style={styles.alertaTexto}>
                A geracao usa o Google Gemini. Cole sua chave em Configuracoes para liberar esta funcionalidade.
              </Text>
              <View style={{ height: spacing.sm }} />
              <Button title="Abrir Configuracoes" onPress={abrirConfig} variant="outline" />
            </Card>
          ) : null}

          <Card style={styles.bloco}>
            <Text style={styles.secaoTitulo}>1. Material de estudo</Text>
            <Text style={styles.secaoDica}>
              Cole resumos, notas de aula, trechos de livro ou diretrizes clinicas. Ate cerca de 60 mil caracteres.
            </Text>
            <TextInput
              multiline
              placeholder="Cole aqui o texto que a IA deve transformar em flashcards..."
              placeholderTextColor={colors.textSoft}
              value={material}
              onChangeText={setMaterial}
              style={styles.materialInput}
              textAlignVertical="top"
            />
            <Text style={styles.contador}>
              {material.trim().length.toLocaleString('pt-BR')} caracteres
            </Text>
          </Card>

          <Card style={styles.bloco}>
            <Text style={styles.secaoTitulo}>2. Parametros</Text>

            <Text style={styles.subLabel}>Quantidade</Text>
            <View style={styles.chipsLinha}>
              {QUANTIDADES.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => setQuantidade(q)}
                  style={[styles.chip, quantidade === q && styles.chipAtivo]}
                >
                  <Text style={[styles.chipTexto, quantidade === q && styles.chipTextoAtivo]}>{q}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ height: spacing.md }} />

            <Text style={styles.subLabel}>Estilo</Text>
            <View style={styles.chipsLinha}>
              {[
                { v: 'conciso', l: 'Conciso' },
                { v: 'explicativo', l: 'Explicativo' },
              ].map((op) => (
                <Pressable
                  key={op.v}
                  onPress={() => setEstilo(op.v as EstiloCard)}
                  style={[styles.chipLargo, estilo === op.v && styles.chipAtivo]}
                >
                  <Text style={[styles.chipTexto, estilo === op.v && styles.chipTextoAtivo]}>{op.l}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ height: spacing.md }} />

            <Text style={styles.subLabel}>Formato</Text>
            <View style={styles.chipsLinha}>
              {[
                { v: 'qa', l: 'Pergunta e Resposta' },
                { v: 'cloze', l: 'Cloze deletion' },
              ].map((op) => (
                <Pressable
                  key={op.v}
                  onPress={() => setFormato(op.v as FormatoCard)}
                  style={[styles.chipLargo, formato === op.v && styles.chipAtivo]}
                >
                  <Text style={[styles.chipTexto, formato === op.v && styles.chipTextoAtivo]}>{op.l}</Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <View style={{ height: spacing.md }} />

          {gerando ? (
            <Card style={styles.cardGerando}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.gerandoTexto}>A IA esta lendo seu material e formulando os cartoes...</Text>
            </Card>
          ) : (
            <Button
              title="Gerar flashcards"
              onPress={handleGerar}
              disabled={!podeGerar}
            />
          )}

          {!materialValido && material.length > 0 ? (
            <Text style={styles.aviso}>O material precisa ter pelo menos 20 caracteres.</Text>
          ) : null}

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: spacing.sm,
  },
  voltar: { paddingVertical: 6 },
  voltarTexto: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  topoTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  topoContador: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  hero: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroEmoji: { fontSize: 32 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 },
  destinoTexto: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  destinoNome: { color: colors.primary, fontWeight: '700' },
  alerta: {
    backgroundColor: '#FFF6E4',
    borderColor: '#F2C066',
    marginBottom: spacing.md,
  },
  alertaTitulo: { fontSize: 14, fontWeight: '700', color: '#7A4B00', marginBottom: 4 },
  alertaTexto: { fontSize: 12, color: '#7A4B00', lineHeight: 18 },
  bloco: { marginBottom: spacing.md },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  secaoDica: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 17 },
  materialInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FAFBFC',
  },
  contador: { fontSize: 11, color: colors.textSoft, marginTop: 4, textAlign: 'right' },
  subLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsLinha: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipLargo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipAtivo: {
    borderColor: colors.primary,
    backgroundColor: '#E6EFFB',
  },
  chipTexto: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextoAtivo: { color: colors.primary },
  cardGerando: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  gerandoTexto: { flex: 1, color: colors.textMuted, fontSize: 13 },
  aviso: { fontSize: 12, color: colors.warning, marginTop: spacing.sm, textAlign: 'center' },
  erro: { color: colors.danger, fontSize: 13, marginTop: spacing.md, textAlign: 'center' },
  // Revisao
  cardRev: { marginBottom: spacing.sm },
  cardRevInativo: { opacity: 0.5 },
  cardRevTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardRevIndice: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  toggleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggle: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleCheck: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: -1 },
  toggleLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  inputMulti: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FAFBFC',
    marginBottom: spacing.sm,
    minHeight: 44,
  },
});
