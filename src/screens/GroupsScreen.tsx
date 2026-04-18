import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { StackNav } from '../navigation/types';

export function GroupsScreen() {
  const nav = useNavigation<StackNav>();
  const { grupos } = useData();

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Grupos de estudo</Text>
        <Text style={styles.subtitulo}>
          Crie ou participe de grupos para compartilhar baralhos.
        </Text>
      </View>

      <FlatList
        data={grupos}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Button title="+ Criar grupo" onPress={() => nav.navigate('CreateGroup')} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            titulo="Voce ainda nao esta em nenhum grupo"
            descricao="Crie seu proprio grupo e convide colegas para estudar juntos."
            icone="👥"
          />
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.cabecalho}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Chip
                texto={item.requerAprovacao ? 'Aprovacao' : 'Aberto'}
                tom={item.requerAprovacao ? 'aviso' : 'ok'}
              />
            </View>
            {item.descricao ? (
              <Text style={styles.descricao} numberOfLines={2}>
                {item.descricao}
              </Text>
            ) : null}
            <View style={styles.rodape}>
              <Text style={styles.meta}>
                {item.membros.length} {item.membros.length === 1 ? 'membro' : 'membros'}
              </Text>
            </View>
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
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nome: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  descricao: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  rodape: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: { fontSize: 12, color: colors.textMuted },
});
