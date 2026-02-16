import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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
          <FlatList
            data={buildings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigateToBuilding(item.id)}>
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
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        )}
      </View>
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
  section: {
    flex: 1,
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
