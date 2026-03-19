import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';

export function GroupsScreen() {
  const nav = useNavigation<StackNav>();
  const { grupos } = useData();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>GRUPOS DE ESTUDO</Text>
        <Text style={styles.titulo}>Comunidade</Text>
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
            titulo="Você ainda não está em nenhum grupo"
            descricao="Crie seu próprio grupo e convide colegas para estudar juntos."
            icone="👥"
          />
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.cabecalho}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Chip
                texto={item.requerAprovacao ? 'Aprovação' : 'Aberto'}
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
                {item.membros.length}{' '}
                {item.membros.length === 1 ? 'membro' : 'membros'}
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
  cabecalho: {
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
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
