import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme/colors';
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>Comece a organizar seus estudos agora.</Text>

        <View style={{ marginTop: spacing.lg }}>
          <Input label="Nome" placeholder="Seu nome" value={nome} onChangeText={setNome} />
          <Input
            label="E-mail"
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input label="Senha" placeholder="No minimo 6 caracteres" secureTextEntry value={senha} onChangeText={setSenha} />
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          <Button title="Cadastrar" onPress={handleCadastrar} loading={loading} />
          <Button
            title="Ja tenho conta"
            onPress={() => nav.goBack()}
            variant="ghost"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingTop: 48 },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  erro: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
});
