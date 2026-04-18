import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { cardsParaRevisar } from '../services/spacedRepetition';
import { colors, spacing } from '../theme/colors';
import { StackNav } from '../navigation/types';
import { Deck, Privacy } from '../types';

type Filtro = 'todos' | Privacy;

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'privado', label: 'Privados' },
  { valor: 'grupo', label: 'Grupo' },
  { valor: 'publico', label: 'Publicos' },
];

export function HomeScreen() {
  const nav = useNavigation<StackNav>();
  const { user } = useAuth();
  const { decks, cards, semearDadosExemplo } = useData();

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
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cumprimento}>Ola, {user?.nome ?? 'estudante'}</Text>
          <Text style={styles.titulo}>Meus baralhos</Text>
        </View>
        <Pressable
          onPress={() => nav.navigate('Stats')}
          style={({ pressed }) => [styles.badge, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.badgeNumero}>{totalParaRevisar}</Text>
          <Text style={styles.badgeLabel}>a revisar</Text>
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
                        <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>
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
              titulo="Voce ainda nao tem baralhos"
              descricao="Crie seu primeiro baralho ou carregue alguns exemplos de medicina para comecar."
              icone="🗂️"
              acao={
                <>
                  <Button title="+ Criar baralho" onPress={() => nav.navigate('CreateDeck')} />
                  <View style={{ height: spacing.sm }} />
                  <Button title="Carregar exemplos" variant="outline" onPress={semearDadosExemplo} />
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
                  {item.totalCards} {item.totalCards === 1 ? 'card' : 'cards'}
                </Text>
                {pendentes > 0 ? (
                  <View style={styles.pill}>
                    <Text style={styles.pillTexto}>{pendentes} para revisar</Text>
                  </View>
                ) : (
                  <Text style={styles.deckMetaOk}>em dia</Text>
                )}
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cumprimento: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  badgeNumero: { color: '#fff', fontSize: 18, fontWeight: '800' },
  badgeLabel: { color: '#fff', fontSize: 10, letterSpacing: 0.5 },
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  acoes: { marginBottom: spacing.md },
  buscaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  buscaIcone: { fontSize: 14, marginRight: 6 },
  buscaInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 14,
  },
  buscaLimpar: { fontSize: 22, color: colors.textMuted, paddingHorizontal: 4 },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  filtro: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtroAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtroTexto: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  filtroTextoAtivo: { color: '#fff' },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  deckNome: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  deckDescricao: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  deckRodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deckMeta: { fontSize: 12, color: colors.textMuted },
  deckMetaOk: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  pill: {
    backgroundColor: '#FEF2CF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillTexto: { fontSize: 11, color: '#8A5C00', fontWeight: '600' },
});
