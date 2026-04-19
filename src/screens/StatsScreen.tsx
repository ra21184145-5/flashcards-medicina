import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { useData } from '../context/DataContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';
import { ReviewLog } from '../types';

const UM_DIA = 24 * 60 * 60 * 1000;
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function inicioDoDia(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function agruparPorDia(logs: ReviewLog[], dias: number): { label: string; total: number }[] {
  const hojeInicio = inicioDoDia(Date.now());
  const buckets: { label: string; total: number; data: Date }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hojeInicio - i * UM_DIA);
    buckets.push({ label: DIAS_SEMANA[d.getDay()], total: 0, data: d });
  }
  for (const log of logs) {
    const diff = Math.floor((hojeInicio - inicioDoDia(log.timestamp)) / UM_DIA);
    if (diff >= 0 && diff < dias) {
      buckets[dias - 1 - diff].total += 1;
    }
  }
  return buckets.map(({ label, total }) => ({ label, total }));
}

function calcularStreak(logs: ReviewLog[]): number {
  if (logs.length === 0) return 0;
  const diasComRevisao = new Set(logs.map((l) => inicioDoDia(l.timestamp)));
  let streak = 0;
  let cursor = inicioDoDia(Date.now());
  // Se nao houve revisao hoje mas houve ontem, o streak conta a partir de ontem.
  if (!diasComRevisao.has(cursor)) {
    cursor -= UM_DIA;
  }
  while (diasComRevisao.has(cursor)) {
    streak += 1;
    cursor -= UM_DIA;
  }
  return streak;
}

export function StatsScreen() {
  const nav = useNavigation<StackNav>();
  const { reviewLogs, cards } = useData();

  const resumo = useMemo(() => {
    const semana = agruparPorDia(reviewLogs, 7);
    const totalSemana = semana.reduce((acc, d) => acc + d.total, 0);
    const maxSemana = Math.max(1, ...semana.map((d) => d.total));
    const acertos = reviewLogs.filter((l) => l.qualidade >= 3).length;
    const taxaAcerto = reviewLogs.length > 0 ? Math.round((acertos / reviewLogs.length) * 100) : 0;
    const streak = calcularStreak(reviewLogs);

    const novos = cards.filter((c) => c.repeticoes === 0).length;
    const aprendendo = cards.filter((c) => c.repeticoes > 0 && c.intervalo < 21).length;
    const maduros = cards.filter((c) => c.intervalo >= 21).length;

    return { semana, totalSemana, maxSemana, taxaAcerto, streak, novos, aprendendo, maduros };
  }, [reviewLogs, cards]);

  return (
    <ScreenContainer>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>ESTATÍSTICAS</Text>
        <Text style={styles.titulo}>Seu progresso</Text>
        <Text style={styles.subtitulo}>
          Acompanhe consistência, acertos e a maturidade dos seus cartões.
        </Text>

        <View style={styles.painelResumo}>
          <View style={styles.resumoCol}>
            <Text style={styles.resumoNumero}>{resumo.streak}</Text>
            <Text style={styles.resumoLabel}>Dias seguidos</Text>
          </View>
          <View style={styles.resumoDivider} />
          <View style={styles.resumoCol}>
            <Text style={[styles.resumoNumero, { color: colors.accent }]}>
              {resumo.taxaAcerto}
              <Text style={styles.resumoPct}>%</Text>
            </Text>
            <Text style={styles.resumoLabel}>Acerto</Text>
          </View>
          <View style={styles.resumoDivider} />
          <View style={styles.resumoCol}>
            <Text style={[styles.resumoNumero, { color: colors.amber }]}>{resumo.totalSemana}</Text>
            <Text style={styles.resumoLabel}>Na semana</Text>
          </View>
        </View>

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Revisões nos últimos 7 dias</Text>
          <View style={styles.secaoRegua} />
        </View>
        <Card style={styles.bloco}>
          <Text style={styles.blocoSubtitulo}>
            Quantos cartões você revisou em cada dia.
          </Text>
          <View style={styles.grafico}>
            {resumo.semana.map((dia, idx) => {
              const alturaRel = (dia.total / resumo.maxSemana) * 100;
              const destacado = idx === resumo.semana.length - 1;
              return (
                <View key={idx} style={styles.colunaWrap}>
                  <View style={styles.colunaArea}>
                    <View
                      style={[
                        styles.coluna,
                        { height: `${alturaRel}%` },
                        destacado ? styles.colunaHoje : null,
                        dia.total === 0 && styles.colunaVazia,
                      ]}
                    />
                  </View>
                  <Text style={styles.colunaValor}>{dia.total}</Text>
                  <Text style={styles.colunaLabel}>{dia.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={styles.secaoWrap}>
          <Text style={styles.secao}>Maturidade dos cartões</Text>
          <View style={styles.secaoRegua} />
        </View>
        <Card style={styles.bloco}>
          <Text style={styles.blocoSubtitulo}>
            Classificação pelo intervalo atual de revisão espaçada.
          </Text>
          <View style={styles.maturidadeBarra}>
            <View
              style={[
                styles.segmento,
                { flex: Math.max(0.1, resumo.novos), backgroundColor: colors.textSoft },
              ]}
            />
            <View
              style={[
                styles.segmento,
                { flex: Math.max(0.1, resumo.aprendendo), backgroundColor: colors.amber },
              ]}
            />
            <View
              style={[
                styles.segmento,
                { flex: Math.max(0.1, resumo.maduros), backgroundColor: colors.accent },
              ]}
            />
          </View>
          <View style={styles.legendaMaturidade}>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: colors.textSoft }]} />
              <Text style={styles.legendaTexto}>
                Novos <Text style={styles.legendaNum}>{resumo.novos}</Text>
              </Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: colors.amber }]} />
              <Text style={styles.legendaTexto}>
                Aprendendo <Text style={styles.legendaNum}>{resumo.aprendendo}</Text>
              </Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendaTexto}>
                Maduros <Text style={styles.legendaNum}>{resumo.maduros}</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.notaRodape}>
            Cartões "maduros" possuem intervalo de revisão de 21 dias ou mais.
          </Text>
        </Card>

        {reviewLogs.length === 0 ? (
          <Card style={styles.vazioBloco}>
            <Text style={styles.vazioTexto}>
              Você ainda não tem revisões registradas. Comece a estudar um baralho para ver seus números aqui.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topo: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
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
  painelResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  resumoCol: { flex: 1, alignItems: 'center' },
  resumoDivider: { width: 1, height: 28, backgroundColor: colors.border },
  resumoNumero: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.primaryDeep,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  resumoPct: {
    fontFamily: fonts.displayItalic,
    fontSize: 18,
    color: colors.accent,
  },
  resumoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  secaoWrap: { marginTop: spacing.lg, marginBottom: spacing.sm },
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
  bloco: { marginBottom: spacing.md, padding: spacing.md },
  blocoSubtitulo: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  grafico: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginTop: spacing.sm,
  },
  colunaWrap: { flex: 1, alignItems: 'center' },
  colunaArea: {
    height: 110,
    justifyContent: 'flex-end',
    width: '65%',
    minWidth: 14,
  },
  coluna: {
    width: '100%',
    backgroundColor: colors.primaryDeep,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  colunaHoje: { backgroundColor: colors.amber },
  colunaVazia: { backgroundColor: colors.border },
  colunaValor: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.text,
    marginTop: 6,
    letterSpacing: -0.2,
  },
  colunaLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textSoft,
    marginTop: 2,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  maturidadeBarra: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  segmento: { height: '100%' },
  legendaMaturidade: { marginTop: spacing.md, gap: 8 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendaDot: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
  },
  legendaNum: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    color: colors.textMuted,
  },
  notaRodape: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSoft,
    marginTop: spacing.md,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  vazioBloco: { alignItems: 'center', padding: spacing.lg },
  vazioTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
