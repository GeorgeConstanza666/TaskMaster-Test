import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

export const OfflineNotice = () => {
  const netInfo = useNetInfo();

  if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false) {
    return (
      <View style={styles.container}>
        <WifiOff size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: width,
    position: 'absolute',
    top: 0,
    zIndex: 999, 
    elevation: 5, 
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});