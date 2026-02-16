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

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    flex: 1,
  };

  return (
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
            ✓ Project structure ready
          </Text>
          <Text style={[styles.statusText, { color: isDarkMode ? '#90caf9' : '#1976d2' }]}>
            ✓ Supabase configured
          </Text>
        </View>
        <Text style={[styles.instructions, { color: isDarkMode ? '#999999' : '#888888' }]}>
          Next steps:{'\n'}
          1. Configure Supabase credentials in src/config/supabase.ts{'\n'}
          2. Install dependencies: npm install --legacy-peer-deps{'\n'}
          3. Run: npm run android or npm run ios
        </Text>
      </View>
    </SafeAreaView>
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
