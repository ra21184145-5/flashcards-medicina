import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';

export function RegisterScreen() {
  const nav = useNavigation<StackNav>();
  const { cadastrar } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 960;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCadastrar() {
    setErro('');
    setLoading(true);
    try {
      await cadastrar(nome.trim(), email.trim(), senha);
    } catch (e: any) {
      setErro(e?.message ?? 'Falha no cadastro.');
    } finally {
      setLoading(false);
    }
  }

  const hero = (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowDot} />
        <Text style={styles.eyebrowText}>Nova matrícula</Text>
      </View>

      <View style={styles.brandBlock}>
        <BrandMark size={wide ? 60 : 52} />
      </View>

      <Text style={[styles.titulo, wide && styles.tituloWide]}>Criar conta</Text>
      <Text style={styles.subtitulo}>
        Comece a organizar seus estudos e revisões em um só lugar — um acervo
        pessoal que te acompanha pelo curso.
      </Text>

      {wide ? (
        <View style={styles.checklist}>
          <View style={styles.checkItem}>
            <View style={styles.checkDot} />
            <Text style={styles.checkText}>
              Baralhos ilimitados, privados ou compartilhados em grupo.
            </Text>
          </View>
          <View style={styles.checkItem}>
            <View style={styles.checkDot} />
            <Text style={styles.checkText}>
              Histórico de revisões e progresso com gráfico semanal.
            </Text>
          </View>
          <View style={styles.checkItem}>
            <View style={styles.checkDot} />
            <Text style={styles.checkText}>
              Geração assistida por IA — você revisa antes de salvar.
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  const form = (
    <View style={[styles.formColumn, wide && styles.formColumnWide]}>
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Dados da conta</Text>
        <Text style={styles.cardSub}>
          Seus dados ficam no dispositivo. Você pode apagar a qualquer momento.
        </Text>

        <Input
          label="Nome"
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
        />
        <Input
          label="E-mail"
          placeholder="voce@exemplo.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Senha"
          placeholder="No mínimo 6 caracteres"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          hint="Use uma senha que você lembre em revisões futuras."
        />
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Button title="Criar conta" onPress={handleCadastrar} loading={loading} />

        <View style={styles.voltarLinha}>
          <Text style={styles.voltarTexto}>Já tem cadastro?</Text>
          <Text style={styles.voltarLink} onPress={() => nav.goBack()}>
            Entrar
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.bgLayer}>
        <View style={styles.grain} />
        <View style={styles.blobAccent} />
        <View style={styles.blobBlue} />
        <View style={styles.ruleLeft} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.shell, wide && styles.shellWide]}>
            {wide ? (
              <View style={styles.twoCol}>
                {hero}
                {form}
              </View>
            ) : (
              <>
                {hero}
                {form}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  shell: {
    width: '100%',
    maxWidth: 480,
  },
  shellWide: {
    maxWidth: 1120,
    paddingVertical: spacing.xl,
  },
  twoCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 72,
  },

  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceMuted,
    opacity: 0.3,
  },
  blobAccent: {
    position: 'absolute',
    top: -140,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accentSoft,
    opacity: 0.55,
  },
  blobBlue: {
    position: 'absolute',
    bottom: -160,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primarySoft,
    opacity: 0.5,
  },
  ruleLeft: {
    position: 'absolute',
    top: 48,
    bottom: 48,
    left: 32,
    width: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },

  hero: { width: '100%' },
  heroWide: {
    flex: 1,
    maxWidth: 520,
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  eyebrowText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  brandBlock: {
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },

  titulo: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 42,
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
  },
  tituloWide: {
    fontSize: 58,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    maxWidth: 460,
  },

  checklist: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  checkText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },

  formColumn: {
    width: '100%',
    marginTop: spacing.lg,
  },
  formColumnWide: {
    flex: 0.95,
    marginTop: 0,
    maxWidth: 440,
  },

  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 4,
  },
  cardTitulo: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  erro: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.sm,
  },

  voltarLinha: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  voltarTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  voltarLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDeep,
  },
});
