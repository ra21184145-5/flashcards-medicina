import React, { useEffect, useState } from 'react';
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
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';
import { GoogleIcon } from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';
import { WEB_CLIENT_ID } from '../config/googleAuth';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const nav = useNavigation<StackNav>();
  const { entrar, entrarComGoogle, entrarComoDemo } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 960;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const googleHabilitado = !!WEB_CLIENT_ID;
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID || 'placeholder',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        (async () => {
          try {
            await entrarComGoogle(idToken);
          } catch (e: any) {
            setErro(e?.message ?? 'Falha no login com Google.');
          } finally {
            setLoadingGoogle(false);
          }
        })();
      } else {
        setLoadingGoogle(false);
        setErro('Google nao retornou token de identidade.');
      }
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      setLoadingGoogle(false);
    }
  }, [response, entrarComGoogle]);

  async function handleEntrar() {
    setErro('');
    setLoading(true);
    try {
      await entrar(email.trim(), senha);
    } catch (e: any) {
      setErro(e?.message ?? 'Falha no login.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setErro('');
    setLoadingGoogle(true);
    try {
      await promptAsync();
    } catch (e: any) {
      setErro(e?.message ?? 'Nao foi possivel iniciar o login com Google.');
      setLoadingGoogle(false);
    }
  }

  async function handleDemo() {
    setErro('');
    setLoadingDemo(true);
    try {
      await entrarComoDemo();
    } catch (e: any) {
      setErro(e?.message ?? 'Nao foi possivel entrar no modo demo.');
      setLoadingDemo(false);
    }
  }

  const hero = (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowDot} />
        <Text style={styles.eyebrowText}>Revisão espaçada · Medicina</Text>
      </View>

      <View style={styles.brandBlock}>
        <BrandMark size={wide ? 64 : 56} />
      </View>

      <Text style={[styles.titulo, wide && styles.tituloWide]}>Flashcards{'\n'}Medicina</Text>
      <Text style={styles.subtitulo}>
        Uma biblioteca pessoal de cartões de estudo, pensada para a rotina de
        quem aprende e pratica medicina.
      </Text>

      {wide ? (
        <View style={styles.heroFeatures}>
          <View style={styles.feature}>
            <Text style={styles.featureNum}>01</Text>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Crie e organize</Text>
              <Text style={styles.featureText}>
                Baralhos temáticos — fisiologia, clínica, farmacologia — com
                privacidade ajustável.
              </Text>
            </View>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureNum}>02</Text>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Revise no tempo certo</Text>
              <Text style={styles.featureText}>
                Algoritmo SM-2 reagenda cada cartão conforme sua resposta, para
                consolidar a memória de longo prazo.
              </Text>
            </View>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureNum}>03</Text>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Gere com IA</Text>
              <Text style={styles.featureText}>
                A partir de um tema ou trecho de texto, rascunhos de cartões
                para você revisar e adotar.
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <Text style={styles.epigrafe}>
        <Text style={styles.epigrafeAspas}>“</Text>
        A prática de recuperação, mais do que reler, é o que consolida o
        aprendizado duradouro.
        <Text style={styles.epigrafeAspas}>”</Text>
        {'\n'}
        <Text style={styles.epigrafeFonte}>— Karpicke, 2012</Text>
      </Text>
    </View>
  );

  const form = (
    <View style={[styles.formColumn, wide && styles.formColumnWide]}>
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Entrar na biblioteca</Text>
        <Text style={styles.cardSub}>
          Use seu e-mail e senha, ou continue com uma conta Google.
        </Text>

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
          placeholder="Sua senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <Button title="Entrar" onPress={handleEntrar} loading={loading} />

        {googleHabilitado ? (
          <>
            <View style={styles.divisor}>
              <View style={styles.divisorLinha} />
              <Text style={styles.divisorTexto}>ou</Text>
              <View style={styles.divisorLinha} />
            </View>
            <Button
              title="Entrar com Google"
              onPress={handleGoogle}
              loading={loadingGoogle}
              variant="outline"
              icon={<GoogleIcon size={18} />}
            />
          </>
        ) : null}

        <View style={styles.registroLinha}>
          <Text style={styles.registroTexto}>Ainda não tem conta?</Text>
          <Text
            style={styles.registroLink}
            onPress={() => nav.navigate('Register')}
          >
            Criar agora
          </Text>
        </View>

        <View style={styles.demoLinha}>
          <Text style={styles.demoLabel}>PARA AVALIADORES</Text>
          <Text
            style={styles.demoLink}
            onPress={loadingDemo ? undefined : handleDemo}
          >
            {loadingDemo ? 'Preparando...' : 'Explorar como convidado →'}
          </Text>
          <Text style={styles.demoHint}>
            Sem cadastro. Dados ficam apenas neste dispositivo.
          </Text>
        </View>
      </View>

      <Text style={styles.rodape}>
        Ao entrar você concorda com os termos de uso do aplicativo.
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Marca dagua editorial: moldura fina + linha vertical sutil a direita */}
      <View pointerEvents="none" style={styles.bgLayer}>
        <View style={styles.grain} />
        <View style={styles.blobAmber} />
        <View style={styles.blobBlue} />
        <View style={styles.ruleRight} />
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

  // Fundo editorial contido
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceMuted,
    opacity: 0.35,
  },
  blobAmber: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.amberSoft,
    opacity: 0.55,
  },
  blobBlue: {
    position: 'absolute',
    bottom: -160,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primarySoft,
    opacity: 0.65,
  },
  ruleRight: {
    position: 'absolute',
    top: 48,
    bottom: 48,
    right: 32,
    width: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },

  hero: {
    width: '100%',
  },
  heroWide: {
    flex: 1.05,
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
    backgroundColor: colors.amber,
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
    fontSize: 40,
    lineHeight: 44,
    color: colors.text,
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  tituloWide: {
    fontSize: 64,
    lineHeight: 66,
    letterSpacing: -2,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    maxWidth: 460,
  },

  heroFeatures: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  featureNum: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    color: colors.amber,
    minWidth: 24,
    lineHeight: 22,
  },
  featureBody: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  featureText: {
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

  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divisorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  divisorTexto: {
    marginHorizontal: spacing.md,
    fontFamily: fonts.displayItalic,
    color: colors.textSoft,
    fontSize: 13,
  },

  registroLinha: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  registroTexto: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  registroLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.primaryDeep,
  },
  demoLinha: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  demoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.textSoft,
    marginBottom: 6,
  },
  demoLink: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.amber,
    letterSpacing: 0.2,
  },
  demoHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSoft,
    marginTop: 4,
  },

  epigrafe: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: spacing.lg,
    paddingRight: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.amber,
    paddingLeft: spacing.md,
  },
  epigrafeAspas: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.amber,
  },
  epigrafeFonte: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },

  rodape: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
