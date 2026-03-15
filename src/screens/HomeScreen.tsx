import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { cardsParaRevisar } from '../services/spacedRepetition';
import { colors, layout, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';
import { Deck, Privacy } from '../types';

type Filtro = 'todos' | Privacy;

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'privado', label: 'Privados' },
  { valor: 'grupo', label: 'Grupo' },
  { valor: 'publico', label: 'Públicos' },
];

export function HomeScreen() {
  const nav = useNavigation<StackNav>();
  const { user } = useAuth();
  const { decks, cards, semearDadosExemplo } = useData();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const meusDecks = useMemo(
    () => decks.filter((d) => d.donoId === user?.id),
    [decks, user]
  );

  const decksFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return meusDecks.filter((d) => {
      if (filtro !== 'todos' && d.privacidade !== filtro) return false;
      if (!termo) return true;
      return (
        d.nome.toLowerCase().includes(termo) ||
        (d.descricao ?? '').toLowerCase().includes(termo)
      );
    });
  }, [meusDecks, busca, filtro]);

  const totalParaRevisar = useMemo(() => cardsParaRevisar(cards).length, [cards]);

  function contarPendentes(deck: Deck) {
    const dos = cards.filter((c) => c.deckId === deck.id);
    return cardsParaRevisar(dos).length;
  }

  const vazioPorFiltro = meusDecks.length > 0 && decksFiltrados.length === 0;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={[styles.wrapper, wide && styles.wrapperWide]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {new Date()
                .toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
                .toUpperCase()}
            </Text>
            <Text style={styles.cumprimento}>
              Olá, <Text style={styles.cumprimentoNome}>{user?.nome ?? 'estudante'}</Text>
            </Text>
            <Text style={styles.titulo}>Meus baralhos</Text>
          </View>
          <Pressable
            onPress={() => nav.navigate('Stats')}
            style={({ pressed }) => [styles.badge, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.badgeNumero}>{totalParaRevisar}</Text>
            <Text style={styles.badgeLabel}>para revisar</Text>
          </Pressable>
        </View>

        <FlatList
          data={decksFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <View>
              {meusDecks.length > 0 ? (
                <>
                  <View style={styles.buscaWrap}>
                    <Text style={styles.buscaIcone}>🔍</Text>
                    <TextInput
                      value={busca}
                      onChangeText={setBusca}
                      placeholder="Buscar baralhos..."
                      placeholderTextColor={colors.textSoft}
                      style={styles.buscaInput}
                    />
                    {busca ? (
                      <Pressable onPress={() => setBusca('')} hitSlop={8}>
                        <Text style={styles.buscaLimpar}>×</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <View style={styles.filtros}>
                    {FILTROS.map((f) => {
                      const ativo = filtro === f.valor;
                      return (
                        <Pressable
                          key={f.valor}
                          onPress={() => setFiltro(f.valor)}
                          style={[styles.filtro, ativo && styles.filtroAtivo]}
                        >
                          <Text
                            style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}
                          >
                            {f.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              <View style={styles.acoes}>
                <Button title="+ Novo baralho" onPress={() => nav.navigate('CreateDeck')} />
              </View>
            </View>
          }
          ListEmptyComponent={
            vazioPorFiltro ? (
              <EmptyState
                titulo="Nenhum baralho encontrado"
                descricao="Tente ajustar a busca ou mudar o filtro."
                icone="🔎"
              />
            ) : (
              <EmptyState
                titulo="Sua biblioteca está vazia"
                descricao="Crie seu primeiro baralho ou carregue exemplos de medicina para começar."
                icone="🗂️"
                acao={
                  <>
                    <Button title="+ Criar baralho" onPress={() => nav.navigate('CreateDeck')} />
                    <View style={{ height: spacing.sm }} />
                    <Button
                      title="Carregar exemplos"
                      variant="outline"
                      onPress={semearDadosExemplo}
                    />
                  </>
                }
              />
            )
          }
          renderItem={({ item }) => {
            const pendentes = contarPendentes(item);
            return (
              <Card
                onPress={() => nav.navigate('DeckDetail', { deckId: item.id })}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.deckHeader}>
                  <Text style={styles.deckNome}>{item.nome}</Text>
                  <Chip privacidade={item.privacidade} />
                </View>
                {item.descricao ? (
                  <Text style={styles.deckDescricao} numberOfLines={2}>
                    {item.descricao}
                  </Text>
                ) : null}
                <View style={styles.deckRodape}>
                  <Text style={styles.deckMeta}>
                    {item.totalCards} {item.totalCards === 1 ? 'cartão' : 'cartões'}
                  </Text>
                  {pendentes > 0 ? (
                    <View style={styles.pill}>
                      <Text style={styles.pillTexto}>{pendentes} para revisar</Text>
                    </View>
                  ) : (
                    <Text style={styles.deckMetaOk}>✓ em dia</Text>
                  )}
                </View>
              </Card>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  wrapper: { flex: 1 },
  wrapperWide: {
    width: '100%',
    maxWidth: layout.maxReading,
    alignSelf: 'center',
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.textSoft,
    marginBottom: 6,
  },
  cumprimento: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  cumprimentoNome: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primaryDeep,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    minWidth: 88,
  },
  badgeNumero: {
    fontFamily: fonts.display,
    color: '#fff',
    fontSize: 22,
    lineHeight: 26,
  },
  badgeLabel: {
    fontFamily: fonts.bodyMedium,
    color: '#fff',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.85,
    marginTop: 2,
  },

  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  acoes: { marginBottom: spacing.md },

  buscaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  buscaIcone: { fontSize: 14, marginRight: 6 },
  buscaInput: {
    flex: 1,
    height: 46,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  buscaLimpar: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  filtro: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtroAtivo: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
  },
  filtroTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  filtroTextoAtivo: { color: '#fff' },

  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  deckNome: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  deckDescricao: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 19,
  },
  deckRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deckMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  deckMetaOk: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#0A8055',
  },
  pill: {
    backgroundColor: colors.amberSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.amber,
    letterSpacing: 0.3,
  },
});
