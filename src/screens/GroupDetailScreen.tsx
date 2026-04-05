import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav, StackRoute } from '../navigation/types';

async function copiarParaClipboard(texto: string) {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).clipboard?.writeText) {
      await (navigator as any).clipboard.writeText(texto);
      return true;
    }
    // @ts-ignore — fallback nativo
    if (Platform.OS !== 'web') {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      if (Clipboard?.setString) {
        Clipboard.setString(texto);
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

export function GroupDetailScreen() {
  const nav = useNavigation<StackNav>();
  const route = useRoute<StackRoute<'GroupDetail'>>();
  const { grupoId } = route.params;
  const { user } = useAuth();
  const { grupos, aprovarPendente, rejeitarPendente, sairDoGrupo, buscarPerfis } = useData();

  const grupo = grupos.find((g) => g.id === grupoId);
  const [perfis, setPerfis] = useState<Record<string, { nome: string; email: string } | undefined>>({});
  const [copiado, setCopiado] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const ehAdmin = !!user && !!grupo && grupo.donoId === user.id;
  const souPendente = !!user && !!grupo && grupo.pendentes.includes(user.id);

  useEffect(() => {
    if (!grupo) return;
    const uids = Array.from(new Set([...grupo.membros, ...grupo.pendentes]));
    buscarPerfis(uids).then(setPerfis).catch(() => {});
  }, [grupo?.id, grupo?.membros.length, grupo?.pendentes.length]);

  const membros = useMemo(() => {
    if (!grupo) return [];
    return grupo.membros.map((uid) => ({
      uid,
      nome: perfis[uid]?.nome ?? (uid === user?.id ? user?.nome ?? 'Você' : 'Participante'),
      email: perfis[uid]?.email ?? '',
      ehDono: grupo.donoId === uid,
      ehVoce: uid === user?.id,
    }));
  }, [grupo?.membros, perfis, user?.id]);

  const pendentes = useMemo(() => {
    if (!grupo) return [];
    return grupo.pendentes.map((uid) => ({
      uid,
      nome: perfis[uid]?.nome ?? 'Candidato',
      email: perfis[uid]?.email ?? '',
    }));
  }, [grupo?.pendentes, perfis]);

  if (!grupo) {
    return (
      <ScreenContainer>
        <View style={styles.topo}>
          <Pressable onPress={() => nav.goBack()} hitSlop={8} style={styles.voltar}>
            <Text style={styles.voltarTexto}>← Voltar</Text>
          </Pressable>
        </View>
        <View style={{ padding: spacing.lg }}>
          <Text style={styles.titulo}>Grupo não encontrado</Text>
          <Text style={styles.subtitulo}>O grupo pode ter sido removido ou você saiu dele.</Text>
        </View>
      </ScreenContainer>
    );
  }

  async function compartilharConvite() {
    if (!grupo) return;
    const mensagem = `Entre no grupo "${grupo.nome}" no Flashcards Medicina usando o código: ${grupo.codigoConvite}`;
    if (Platform.OS === 'web' || typeof Share?.share !== 'function') {
      const ok = await copiarParaClipboard(mensagem);
      setCopiado(ok);
      setTimeout(() => setCopiado(false), 2400);
      return;
    }
    try {
      await Share.share({ message: mensagem });
    } catch {
      // ignore
    }
  }

  async function handleSair() {
    if (!grupo) return;
    const confirmar = () =>
      new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          resolve(typeof window !== 'undefined' ? window.confirm(`Sair do grupo "${grupo.nome}"?`) : true);
          return;
        }
        Alert.alert('Sair do grupo', `Tem certeza que deseja sair de "${grupo.nome}"?`, [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Sair', style: 'destructive', onPress: () => resolve(true) },
        ]);
      });
    const ok = await confirmar();
    if (!ok) return;
    setOcupado(true);
    try {
      await sairDoGrupo(grupo.id);
      nav.goBack();
    } catch (e: any) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(e?.message ?? 'Falha ao sair do grupo.');
      } else {
        Alert.alert('Atenção', e?.message ?? 'Falha ao sair do grupo.');
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} hitSlop={8} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>GRUPO DE ESTUDO</Text>
        <Text style={styles.titulo}>{grupo.nome}</Text>
        {grupo.descricao ? <Text style={styles.descricao}>{grupo.descricao}</Text> : null}

        <View style={styles.metaLinha}>
          <Chip
            texto={grupo.requerAprovacao ? 'Aprovação' : 'Aberto'}
            tom={grupo.requerAprovacao ? 'aviso' : 'ok'}
          />
          <Text style={styles.metaTexto}>
            {grupo.membros.length} {grupo.membros.length === 1 ? 'membro' : 'membros'}
          </Text>
          {souPendente ? (
            <Chip texto="Aguardando aprovação" tom="aviso" />
          ) : null}
        </View>

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Convite</Text>
          <View style={styles.secaoRegua} />
        </View>

        <View style={styles.codigoWrap}>
          <Text style={styles.codigoLabel}>CÓDIGO DO GRUPO</Text>
          <Text style={styles.codigo}>{grupo.codigoConvite}</Text>
          <Text style={styles.codigoHint}>
            Compartilhe este código para que colegas entrem pelo menu “Descobrir grupos”.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <Button
              title={copiado ? 'Código copiado ✓' : 'Copiar convite'}
              onPress={compartilharConvite}
              variant="secondary"
            />
          </View>
        </View>

        {ehAdmin && pendentes.length > 0 ? (
          <>
            <View style={styles.secaoWrap}>
              <Text style={styles.secao}>Pedidos pendentes</Text>
              <View style={styles.secaoRegua} />
            </View>
            {pendentes.map((p) => (
              <View key={p.uid} style={styles.pessoaCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pessoaNome}>{p.nome}</Text>
                  {p.email ? <Text style={styles.pessoaEmail}>{p.email}</Text> : null}
                </View>
                <View style={styles.acoes}>
                  <Pressable
                    onPress={() => aprovarPendente(grupo.id, p.uid)}
                    style={[styles.botaoIcone, styles.botaoAprovar]}
                  >
                    <Text style={styles.botaoAprovarTexto}>Aprovar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => rejeitarPendente(grupo.id, p.uid)}
                    style={[styles.botaoIcone, styles.botaoRejeitar]}
                  >
                    <Text style={styles.botaoRejeitarTexto}>Rejeitar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : null}

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Membros</Text>
          <View style={styles.secaoRegua} />
        </View>

        {membros.map((m) => (
          <View key={m.uid} style={styles.pessoaCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{m.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.pessoaLinha}>
                <Text style={styles.pessoaNome}>{m.nome}</Text>
                {m.ehDono ? <Chip texto="Admin" tom="primario" /> : null}
                {m.ehVoce ? <Chip texto="Você" tom="ok" /> : null}
              </View>
              {m.email ? <Text style={styles.pessoaEmail}>{m.email}</Text> : null}
            </View>
          </View>
        ))}

        {!ehAdmin && grupo.membros.includes(user?.id ?? '') ? (
          <View style={{ marginTop: spacing.xl }}>
            <Button
              title="Sair do grupo"
              onPress={handleSair}
              variant="ghost"
              loading={ocupado}
            />
          </View>
        ) : null}
      </ScrollView>
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
  scroll: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: 120 },
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
  descricao: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  metaLinha: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  codigoWrap: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codigoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.textSoft,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  codigo: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.primaryDeep,
    letterSpacing: 8,
  },
  codigoHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 18,
  },
  pessoaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  pessoaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pessoaNome: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  pessoaEmail: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.primaryDeep,
  },
  acoes: { flexDirection: 'row', gap: 6 },
  botaoIcone: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  botaoAprovar: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  botaoAprovarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#0A8055',
  },
  botaoRejeitar: {
    backgroundColor: '#FDECEC',
    borderColor: colors.danger,
  },
  botaoRejeitarTexto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.danger,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
});
