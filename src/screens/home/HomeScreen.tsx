import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { ScreenContainer, Card, Button, Loading, ErrorMessage } from '../../components/ui';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        navigation.replace('Auth');
        return;
      }

      const { data: profile, error: profileError } = await DatabaseService.getUserProfile(user.id);
      if (profileError || !profile) {
        setError('Failed to load user profile');
        setLoading(false);
        return;
      }

      setUserProfile(profile);

      const { data: buildingsData, error: buildingsError } = await DatabaseService.getBuildings(
        profile.client_id,
      );
      if (buildingsError) {
        setError('Failed to load buildings');
      } else {
        setBuildings(buildingsData || []);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    navigation.replace('Auth');
  };

  const navigateToBuilding = (buildingId: string) => {
    navigation.navigate('BuildingDetails', { buildingId });
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <ScreenContainer>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, {userProfile?.full_name || 'User'}!
            </Text>
            <Text style={styles.role}>Role: {userProfile?.role || 'N/A'}</Text>
          </View>
          <Button title="Logout" onPress={handleLogout} size="small" variant="outline" />
        </View>

        {error && <ErrorMessage message={error} />}

        {/* Quick Access Cards */}
        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('TenantsList')}
            >
              <Text style={styles.quickAccessIcon}>👤</Text>
              <Text style={styles.quickAccessLabel}>Tenants</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => navigation.navigate('LeasesList')}
            >
              <Text style={styles.quickAccessIcon}>📄</Text>
              <Text style={styles.quickAccessLabel}>Leases</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Buildings</Text>
            <Button
              title="+ Add"
              onPress={() => navigation.navigate('AddBuilding')}
              size="small"
            />
          </View>

          {buildings.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No buildings yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the "+ Add" button to create your first building
              </Text>
            </Card>
          ) : (
            buildings.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => navigateToBuilding(item.id)}>
                <Card>
                  <Text style={styles.buildingName}>{item.name}</Text>
                  <Text style={styles.buildingAddress}>
                    {item.address}, {item.city}
                  </Text>
                  <View style={styles.buildingStats}>
                    <Text style={styles.statText}>
                      🏢 {item.total_floors} floors
                    </Text>
                    <Text style={styles.statText}>
                      🚪 {item.total_rooms} rooms
                    </Text>
                    <Text style={styles.statText}>
                      📊 {item.status}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  role: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  quickAccess: {
    marginBottom: 24,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAccessIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  buildingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  buildingAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  buildingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#999999',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
