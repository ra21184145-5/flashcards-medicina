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
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';
import { GoogleIcon } from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { colors, layout, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';
import { WEB_CLIENT_ID } from '../config/googleAuth';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const nav = useNavigation<StackNav>();
  const { entrar, entrarComGoogle } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

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

  return (
    <View style={styles.root}>
      {/* Camada de fundo com manchas suaves de cor para dar profundidade. */}
      <View pointerEvents="none" style={styles.bgLayer}>
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobBottom]} />
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
          <View style={[styles.container, wide && styles.containerWide]}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>Revisão espaçada · Medicina</Text>
            </View>

            <View style={styles.brandBlock}>
              <BrandMark size={72} />
            </View>

            <Text style={styles.titulo}>Flashcards Medicina</Text>
            <Text style={styles.subtitulo}>
              Uma biblioteca pessoal de cartões de estudo, pensada para a rotina de quem
              aprende e pratica medicina.
            </Text>

            <View style={styles.card}>
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
            </View>

            <Text style={styles.epigrafe}>
              <Text style={styles.epigrafeAspas}>“</Text>
              A prática de recuperação, mais do que reler, é o que consolida o aprendizado
              duradouro.
              <Text style={styles.epigrafeAspas}>”</Text>
              {'\n'}
              <Text style={styles.epigrafeFonte}>— Karpicke, 2012</Text>
            </Text>

            <Text style={styles.rodape}>
              Ao entrar você concorda com os termos de uso do aplicativo.
            </Text>
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
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: layout.maxContent,
  },
  containerWide: {
    paddingVertical: spacing.xl,
  },

  // Camada decorativa de fundo
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    opacity: 0.16,
  },
  blobTop: {
    top: -260,
    right: -180,
    backgroundColor: colors.primary,
  },
  blobBottom: {
    bottom: -240,
    left: -160,
    backgroundColor: colors.amber,
    opacity: 0.12,
  },

  // Eyebrow (small caps label)
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
    fontSize: 38,
    lineHeight: 42,
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
  },
  subtitulo: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    maxWidth: 420,
  },

  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
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

  epigrafe: {
    fontFamily: fonts.displayItalic,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
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
    marginTop: spacing.lg,
  },
});
