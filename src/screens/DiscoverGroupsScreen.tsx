import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';
import { Grupo } from '../types';

export function DiscoverGroupsScreen() {
  const nav = useNavigation<StackNav>();
  const { user } = useAuth();
  const { buscarGruposPublicos, entrarPorCodigo } = useData();
  const [termo, setTermo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [resultados, setResultados] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [mensagemCodigo, setMensagemCodigo] = useState<{ tipo: 'erro' | 'ok'; texto: string } | null>(null);

  const aviso = (titulo: string, msg: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${titulo}\n${msg}`);
    } else {
      Alert.alert(titulo, msg);
    }
  };

  const buscar = useCallback(
    async (texto: string) => {
      setCarregando(true);
      try {
        const lista = await buscarGruposPublicos(texto);
        setResultados(lista);
      } finally {
        setCarregando(false);
      }
    },
    [buscarGruposPublicos]
  );

  useEffect(() => {
    buscar('');
  }, [buscar]);

  useEffect(() => {
    const t = setTimeout(() => buscar(termo), 250);
    return () => clearTimeout(t);
  }, [termo, buscar]);

  async function handleEntrarPorCodigo() {
    const cod = codigo.trim().toUpperCase();
    if (cod.length !== 6) {
      setMensagemCodigo({ tipo: 'erro', texto: 'O código tem 6 caracteres.' });
      return;
    }
    setEntrando(true);
    setMensagemCodigo(null);
    try {
      const res = await entrarPorCodigo(cod);
      if (res.status === 'entrou') {
        setMensagemCodigo({ tipo: 'ok', texto: `Você entrou no grupo "${res.grupo.nome}".` });
        setTimeout(() => nav.navigate('GroupDetail', { grupoId: res.grupo.id }), 600);
      } else {
        setMensagemCodigo({
          tipo: 'ok',
          texto: `Pedido enviado para "${res.grupo.nome}". Aguarde aprovação do administrador.`,
        });
      }
      setCodigo('');
    } catch (e: any) {
      setMensagemCodigo({ tipo: 'erro', texto: e?.message ?? 'Falha ao entrar no grupo.' });
    } finally {
      setEntrando(false);
    }
  }

  async function entrarDireto(grupo: Grupo) {
    try {
      const res = await entrarPorCodigo(grupo.codigoConvite);
      if (res.status === 'entrou') {
        nav.navigate('GroupDetail', { grupoId: res.grupo.id });
      } else {
        aviso(
          'Pedido enviado',
          `O grupo "${res.grupo.nome}" requer aprovação. Você entrará assim que o administrador aprovar.`
        );
      }
    } catch (e: any) {
      aviso('Não foi possível entrar', e?.message ?? 'Tente novamente.');
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} hitSlop={8} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <FlatList
        data={resultados}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>DESCOBRIR</Text>
            <Text style={styles.titulo}>Encontrar grupos</Text>
            <Text style={styles.subtitulo}>
              Entre por código de convite ou procure grupos pelo nome.
            </Text>

            <View style={styles.secaoWrap}>
              <Text style={styles.secao}>Entrar por código</Text>
              <View style={styles.secaoRegua} />
            </View>
            <Input
              label="Código de convite"
              placeholder="Ex.: A7H2XP"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              value={codigo}
              onChangeText={(t) => setCodigo(t.replace(/\s/g, '').toUpperCase())}
              erro={mensagemCodigo?.tipo === 'erro' ? mensagemCodigo.texto : undefined}
              hint={mensagemCodigo?.tipo === 'ok' ? mensagemCodigo.texto : undefined}
            />
            <Button
              title="Entrar"
              onPress={handleEntrarPorCodigo}
              loading={entrando}
              disabled={codigo.length !== 6}
            />

            <View style={styles.secaoWrap}>
              <Text style={styles.secao}>Buscar por nome</Text>
              <View style={styles.secaoRegua} />
            </View>
            <Input
              placeholder="Procurar grupos de estudo..."
              value={termo}
              onChangeText={setTermo}
              autoCorrect={false}
            />
            {carregando ? (
              <View style={{ alignItems: 'center', padding: spacing.md }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          carregando ? null : (
            <EmptyState
              titulo="Nenhum grupo encontrado"
              descricao="Tente outro termo ou peça um código de convite para entrar direto."
              icone="🔎"
            />
          )
        }
        renderItem={({ item }) => {
          const jaEhMembro = !!user && item.membros.includes(user.id);
          const jaEhPendente = !!user && item.pendentes.includes(user.id);
          return (
            <View style={styles.card}>
              <View style={styles.cardTopo}>
                <Text style={styles.cardNome}>{item.nome}</Text>
                <Chip
                  texto={item.requerAprovacao ? 'Aprovação' : 'Aberto'}
                  tom={item.requerAprovacao ? 'aviso' : 'ok'}
                />
              </View>
              {item.descricao ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.descricao}
                </Text>
              ) : null}
              <View style={styles.cardRodape}>
                <Text style={styles.meta}>
                  {item.membros.length} {item.membros.length === 1 ? 'membro' : 'membros'}
                </Text>
                {jaEhMembro ? (
                  <Button
                    title="Abrir"
                    onPress={() => nav.navigate('GroupDetail', { grupoId: item.id })}
                    variant="outline"
                  />
                ) : jaEhPendente ? (
                  <Chip texto="Aguardando aprovação" tom="aviso" />
                ) : (
                  <Button
                    title={item.requerAprovacao ? 'Pedir entrada' : 'Entrar'}
                    onPress={() => entrarDireto(item)}
                    variant="secondary"
                  />
                )}
              </View>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topo: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  voltar: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: spacing.md },
  voltarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDeep,
  },
  lista: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
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
    lineHeight: 34,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 21,
  },
  secaoWrap: { marginTop: spacing.xl, marginBottom: spacing.sm },
  secao: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  secaoRegua: { width: 32, height: 2, backgroundColor: colors.amber },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardNome: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 19,
  },
  cardRodape: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
