import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';
import { colors, layout, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { StackNav } from '../navigation/types';

export function RegisterScreen() {
  const nav = useNavigation<StackNav>();
  const { cadastrar } = useAuth();
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

  return (
    <View style={styles.root}>
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
          <View style={styles.container}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>Nova matrícula</Text>
            </View>

            <View style={styles.brandBlock}>
              <BrandMark size={60} />
            </View>

            <Text style={styles.titulo}>Criar conta</Text>
            <Text style={styles.subtitulo}>
              Comece a organizar seus estudos e revisões em um só lugar.
            </Text>

            <View style={styles.card}>
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

  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 240,
    opacity: 0.13,
  },
  blobTop: {
    top: -220,
    left: -160,
    backgroundColor: colors.accent,
  },
  blobBottom: {
    bottom: -220,
    right: -160,
    backgroundColor: colors.primary,
    opacity: 0.14,
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
    marginBottom: spacing.md,
  },

  titulo: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    color: colors.text,
    letterSpacing: -0.6,
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
