import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PublicVerifyRedirect() {
  const router = useRouter();
  const { tokenId } = useLocalSearchParams();

  useEffect(() => {
    if (tokenId) {
      router.replace({ pathname: '/verifying', params: { tokenId } });
    }
  }, [tokenId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#003527', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
