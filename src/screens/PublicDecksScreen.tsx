import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
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
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Explorar baralhos</Text>
        <Text style={styles.subtitulo}>Baralhos publicos da comunidade.</Text>
      </View>
      <FlatList
        data={publicos}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}
        ListEmptyComponent={
          <EmptyState
            titulo="Nenhum baralho publico disponivel"
            descricao="Assim que a comunidade publicar baralhos, eles aparecerao aqui."
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
            <Text style={styles.meta}>{item.totalCards} cards</Text>
          </Card>
        )}
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
  },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nome: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  descricao: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
});
