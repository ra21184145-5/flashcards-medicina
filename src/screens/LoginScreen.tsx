import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme/colors';
import { StackNav } from '../navigation/types';

export function LoginScreen() {
  const nav = useNavigation<StackNav>();
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoTexto}>FM</Text>
          </View>
          <Text style={styles.titulo}>Flashcards Medicina</Text>
          <Text style={styles.subtitulo}>
            Estude com revisão espaçada e compartilhe baralhos com seu grupo.
          </Text>
        </View>

        <View style={styles.form}>
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
          <Button
            title="Criar conta"
            onPress={() => nav.navigate('Register')}
            variant="ghost"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <Text style={styles.rodape}>
          Ao entrar voce concorda com os termos de uso do aplicativo.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingTop: 48,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoTexto: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitulo: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  form: {
    marginTop: spacing.lg,
  },
  erro: {
    color: colors.danger,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  rodape: {
    marginTop: spacing.xl,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSoft,
  },
});
