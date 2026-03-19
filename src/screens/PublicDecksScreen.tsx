import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';
import { Deck } from '../types';

export function PublicDecksScreen() {
  const nav = useNavigation<StackNav>();
  const { decks, listarDecksPublicosRemotos } = useData();
  const [remotos, setRemotos] = useState<Deck[]>([]);
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    try {
      const lista = await listarDecksPublicosRemotos();
      setRemotos(lista);
    } finally {
      setAtualizando(false);
    }
  }

  useEffect(() => {
    atualizar();
  }, []);

  // Une publicos locais + remotos, removendo duplicatas pelo id.
  const mapa = new Map<string, Deck>();
  for (const d of decks) if (d.privacidade === 'publico') mapa.set(d.id, d);
  for (const d of remotos) if (!mapa.has(d.id)) mapa.set(d.id, d);
  const publicos = Array.from(mapa.values());

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>EXPLORAR</Text>
        <Text style={styles.titulo}>Biblioteca pública</Text>
        <Text style={styles.subtitulo}>
          Baralhos compartilhados pela comunidade de estudo.
        </Text>
      </View>
      <FlatList
        data={publicos}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ListEmptyComponent={
          <EmptyState
            titulo="Nenhum baralho público disponível"
            descricao="Assim que a comunidade publicar baralhos, eles aparecerão aqui."
            icone="🌐"
          />
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => nav.navigate('DeckDetail', { deckId: item.id })}
            style={{ marginBottom: spacing.md }}
          >
            <View style={styles.topo}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Chip privacidade={item.privacidade} />
            </View>
            {item.descricao ? (
              <Text style={styles.descricao} numberOfLines={2}>
                {item.descricao}
              </Text>
            ) : null}
            <View style={styles.rodape}>
              <Text style={styles.meta}>
                {item.totalCards} {item.totalCards === 1 ? 'cartão' : 'cartões'}
              </Text>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
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
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nome: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  descricao: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 19,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
