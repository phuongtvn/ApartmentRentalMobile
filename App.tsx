/**
 * Apartment Rental Management App
 * Main Application Entry Point
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from './src/config/gluestack-ui.config';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    flex: 1,
  };

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <View style={styles.container}>
          <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            🏢 Apartment Rental Management
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
            Welcome to your property management solution
          </Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: isDarkMode ? '#90caf9' : '#1976d2' }]}>
              ✓ React Native configured
            </Text>
            <Text style={[styles.statusText, { color: isDarkMode ? '#90caf9' : '#1976d2' }]}>
              ✓ TypeScript enabled
            </Text>
            <Text style={[styles.statusText, { color: isDarkMode ? '#90caf9' : '#1976d2' }]}>
              ✓ Gluestack UI ready
            </Text>
            <Text style={[styles.statusText, { color: isDarkMode ? '#90caf9' : '#1976d2' }]}>
              ✓ Supabase configured
            </Text>
          </View>
          <Text style={[styles.instructions, { color: isDarkMode ? '#999999' : '#888888' }]}>
            Please configure your Supabase credentials in .env file{'\n'}
            Then install dependencies: npm install
          </Text>
        </View>
      </SafeAreaView>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  statusContainer: {
    marginVertical: 30,
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: '500',
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 20,
  },
});

export default App;
