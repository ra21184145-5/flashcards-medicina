import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { useData } from '../context/DataContext';
import { colors, spacing } from '../theme/colors';
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
    <SafeAreaView style={styles.flex} edges={['top']}>
      <View style={styles.topo}>
        <Pressable onPress={() => nav.goBack()} style={styles.voltar}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Suas estatisticas</Text>
        <Text style={styles.subtitulo}>Acompanhe seu progresso e mantenha a consistencia.</Text>

        <View style={styles.linhaCards}>
          <Card style={styles.statBox}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumero}>{resumo.streak}</Text>
            <Text style={styles.statLabel}>Dias seguidos</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statNumero}>{resumo.taxaAcerto}%</Text>
            <Text style={styles.statLabel}>Acerto</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statNumero}>{resumo.totalSemana}</Text>
            <Text style={styles.statLabel}>Na semana</Text>
          </Card>
        </View>

        <Card style={styles.bloco}>
          <Text style={styles.blocoTitulo}>Revisoes nos ultimos 7 dias</Text>
          <Text style={styles.blocoSubtitulo}>Quantos cartoes voce revisou em cada dia.</Text>
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

        <Card style={styles.bloco}>
          <Text style={styles.blocoTitulo}>Maturidade dos cartoes</Text>
          <Text style={styles.blocoSubtitulo}>
            Classificacao pelo intervalo atual de revisao espacada.
          </Text>
          <View style={styles.maturidadeBarra}>
            <View
              style={[
                styles.segmento,
                { flex: Math.max(0.1, resumo.novos), backgroundColor: '#94A3B8' },
              ]}
            />
            <View
              style={[
                styles.segmento,
                { flex: Math.max(0.1, resumo.aprendendo), backgroundColor: colors.warning },
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
              <View style={[styles.legendaDot, { backgroundColor: '#94A3B8' }]} />
              <Text style={styles.legendaTexto}>Novos ({resumo.novos})</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendaTexto}>Aprendendo ({resumo.aprendendo})</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.legendaTexto}>Maduros ({resumo.maduros})</Text>
            </View>
          </View>
          <Text style={styles.notaRodape}>
            Cartoes "maduros" possuem intervalo de revisao de 21 dias ou mais.
          </Text>
        </Card>

        {reviewLogs.length === 0 ? (
          <Card style={styles.vazioBloco}>
            <Text style={styles.vazioTexto}>
              Voce ainda nao tem revisoes registradas. Comece a estudar um baralho para ver seus numeros aqui.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  topo: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  voltar: { paddingVertical: 6, alignSelf: 'flex-start' },
  voltarTexto: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  titulo: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  linhaCards: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statIcon: { fontSize: 22, marginBottom: 2 },
  statNumero: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 },
  bloco: { marginBottom: spacing.md, padding: spacing.md },
  blocoTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  blocoSubtitulo: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },
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
    backgroundColor: colors.primary,
    borderRadius: 6,
    minHeight: 4,
  },
  colunaHoje: { backgroundColor: colors.accent },
  colunaVazia: { backgroundColor: colors.border },
  colunaValor: { fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 6 },
  colunaLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  maturidadeBarra: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  segmento: { height: '100%' },
  legendaMaturidade: { marginTop: spacing.sm, gap: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendaDot: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { fontSize: 12, color: colors.text },
  notaRodape: { fontSize: 11, color: colors.textSoft, marginTop: spacing.sm },
  vazioBloco: { alignItems: 'center', padding: spacing.lg },
  vazioTexto: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
});
