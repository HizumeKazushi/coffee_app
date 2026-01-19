// プロフィール・設定画面

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setDisplayName(user?.user_metadata?.display_name || '');
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('エラー', '表示名を入力してください');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() },
    });
    setLoading(false);

    if (error) {
      Alert.alert('エラー', error.message);
    } else {
      Alert.alert('成功', 'プロフィールを更新しました');
    }
  };

  const handleChangePassword = async () => {
    if (Platform.OS === 'web') {
      const newPassword = window.prompt('新しいパスワードを入力してください（6文字以上）');
      if (!newPassword || newPassword.length < 6) {
        alert('パスワードは6文字以上で入力してください');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        alert(error.message);
      } else {
        alert('パスワードを変更しました');
      }
    } else {
      Alert.prompt(
        'パスワード変更',
        '新しいパスワードを入力してください（6文字以上）',
        async (newPassword) => {
          if (!newPassword || newPassword.length < 6) {
            Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
            return;
          }
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) {
            Alert.alert('エラー', error.message);
          } else {
            Alert.alert('成功', 'パスワードを変更しました');
          }
        },
        'secure-text',
      );
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('ログアウトしますか？')) {
        await supabase.auth.signOut();
      }
    } else {
      Alert.alert('ログアウト', 'ログアウトしますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('この操作は取り消せません。本当に削除しますか？')) {
        alert('アカウント削除機能は現在開発中です');
      }
    } else {
      Alert.alert('アカウント削除', 'この操作は取り消せません。本当に削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            Alert.alert('お知らせ', 'アカウント削除機能は現在開発中です');
          },
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* プロフィール */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プロフィール</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>表示名</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="表示名を入力"
            placeholderTextColor="#ccc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>メールアドレス</Text>
          <Text style={styles.staticValue}>{user?.email || '-'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '更新中...' : 'プロフィールを更新'}</Text>
        </TouchableOpacity>
      </View>

      {/* アカウント設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="key-outline" size={20} color="#1a1a1a" />
            <Text style={styles.menuItemText}>パスワードを変更</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={20} color="#1a1a1a" />
            <Text style={styles.menuItemText}>ログアウト</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* 危険なアクション */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>危険な操作</Text>

        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#f44336" />
          <Text style={styles.dangerText}>アカウントを削除</Text>
        </TouchableOpacity>
      </View>

      {/* アプリ情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>
        <Text style={styles.appInfo}>Coffee Recipe Hub v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  staticValue: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  dangerText: {
    fontSize: 16,
    color: '#f44336',
  },
  appInfo: {
    fontSize: 14,
    color: '#999',
  },
});
