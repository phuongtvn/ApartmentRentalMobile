import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer, Card, Button, Loading, ErrorMessage } from '../../components/ui';
import { DatabaseService } from '../../services/database.service';

interface BuildingDetailsScreenProps {
  route: any;
  navigation: any;
}

export const BuildingDetailsScreen: React.FC<BuildingDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { buildingId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [building, setBuilding] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    loadBuildingDetails();
  }, [buildingId]);

  const loadBuildingDetails = async () => {
    try {
      const { data: buildingData, error: buildingError } = await DatabaseService.getBuildingById(
        buildingId,
      );
      if (buildingError || !buildingData) {
        setError('Failed to load building details');
        setLoading(false);
        return;
      }

      setBuilding(buildingData);

      const { data: roomsData, error: roomsError } = await DatabaseService.getRoomsByBuilding(
        buildingId,
      );
      if (roomsError) {
        setError('Failed to load rooms');
      } else {
        setRooms(roomsData || []);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Building',
      'Are you sure you want to delete this building? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await DatabaseService.deleteBuilding(buildingId);
            if (error) {
              Alert.alert('Error', 'Failed to delete building');
            } else {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <Loading message="Loading building..." />;
  }

  if (!building) {
    return (
      <ScreenContainer>
        <ErrorMessage message="Building not found" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>{building.name}</Text>
        <View style={styles.headerButtons}>
          <Button
            title="Edit"
            onPress={() => navigation.navigate('EditBuilding', { buildingId })}
            size="small"
            style={styles.editButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            size="small"
            variant="secondary"
          />
        </View>
      </View>

      {error && <ErrorMessage message={error} />}

      <Card>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{building.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{building.city}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{building.country}</Text>
        </View>
        {building.postal_code && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Postal Code:</Text>
            <Text style={styles.value}>{building.postal_code}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{building.building_type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{building.status}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Floors:</Text>
          <Text style={styles.value}>{building.total_floors}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Rooms:</Text>
          <Text style={styles.value}>{building.total_rooms}</Text>
        </View>
        {building.year_built && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Year Built:</Text>
            <Text style={styles.value}>{building.year_built}</Text>
          </View>
        )}
        {building.description && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{building.description}</Text>
          </View>
        )}
      </Card>

      <View style={styles.roomsSection}>
        <View style={styles.roomsHeader}>
          <Text style={styles.sectionTitle}>Rooms ({rooms.length})</Text>
          <Button
            title="+ Add Room"
            onPress={() => navigation.navigate('AddRoom', { buildingId })}
            size="small"
          />
        </View>

        {rooms.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No rooms yet</Text>
          </Card>
        ) : (
          rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              onPress={() => navigation.navigate('RoomDetails', { roomId: room.id })}
            >
              <Card>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomNumber}>Room {room.room_number}</Text>
                  <Text style={[styles.roomStatus, styles[`status_${room.status}`]]}>
                    {room.status}
                  </Text>
                </View>
                <Text style={styles.roomType}>{room.room_type}</Text>
                <Text style={styles.roomRent}>
                  {room.currency} {room.rent_amount}/month
                </Text>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    width: 120,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  roomsSection: {
    marginTop: 16,
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  roomStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  status_available: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  status_occupied: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  status_maintenance: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  status_reserved: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  roomType: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  roomRent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
