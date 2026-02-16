import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { ScreenContainer, Card, Button, Loading, ErrorMessage } from '../../components/ui';
import { DatabaseService } from '../../services/database.service';

interface RoomDetailsScreenProps {
  route: any;
  navigation: any;
}

export const RoomDetailsScreen: React.FC<RoomDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { roomId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [room, setRoom] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    loadRoomDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      const { data, error: fetchError } = await DatabaseService.getRoomById(roomId);
      if (fetchError || !data) {
        setError('Failed to load room details');
        setLoading(false);
        return;
      }

      setRoom(data);
      setLoading(false);

      // Load contract for this room
      const { data: contractData } = await DatabaseService.getContractByRoom(roomId);
      setContract(contractData);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this room? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await DatabaseService.deleteRoom(roomId);
            if (deleteError) {
              Alert.alert('Error', 'Failed to delete room');
            } else {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const { error: updateError } = await DatabaseService.updateRoom(roomId, {
      status: newStatus as any,
    });
    if (updateError) {
      Alert.alert('Error', 'Failed to update room status');
    } else {
      Alert.alert('Success', 'Room status updated');
      loadRoomDetails();
    }
  };

  if (loading) {
    return <Loading message="Loading room..." />;
  }

  if (!room) {
    return (
      <ScreenContainer>
        <ErrorMessage message="Room not found" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Room {room.room_number}</Text>
        <View style={styles.headerButtons}>
          <Button
            title="Edit"
            onPress={() => navigation.navigate('EditRoom', { roomId })}
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
        <Text style={styles.sectionTitle}>Room Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Room Number:</Text>
          <Text style={styles.value}>{room.room_number}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Floor:</Text>
          <Text style={styles.value}>{room.floor_number || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{room.room_type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Area:</Text>
          <Text style={styles.value}>
            {room.area_sqft ? `${room.area_sqft} sqft` : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Bedrooms:</Text>
          <Text style={styles.value}>{room.bedrooms}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Bathrooms:</Text>
          <Text style={styles.value}>{room.bathrooms}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.value,
            styles.statusBadge,
            room.status === 'available' && styles.status_available,
            room.status === 'occupied' && styles.status_occupied,
            room.status === 'maintenance' && styles.status_maintenance,
            room.status === 'reserved' && styles.status_reserved,
          ]}>
            {room.status}
          </Text>
        </View>
        {room.description && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{room.description}</Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Rent:</Text>
          <Text style={styles.priceValue}>
            {room.currency} {room.rent_amount}/month
          </Text>
        </View>
        {room.deposit_amount && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Deposit:</Text>
            <Text style={styles.value}>
              {room.currency} {room.deposit_amount}
            </Text>
          </View>
        )}
        {room.available_from && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Available From:</Text>
            <Text style={styles.value}>
              {new Date(room.available_from).toLocaleDateString()}
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Contract</Text>
        {contract ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Lease #:</Text>
              <Text style={styles.value}>{contract.lease_number || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[
                styles.value,
                styles.statusBadge,
                contract.status === 'active' && styles.status_available,
                contract.status === 'draft' && styles.status_reserved,
              ]}>
                {contract.status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Period:</Text>
              <Text style={styles.value}>
                {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
              </Text>
            </View>
            <Button
              title="View Contract Details"
              onPress={() => navigation.navigate('ContractDetails', { contractId: contract.id, roomId })}
              size="small"
              style={styles.contractButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.emptyContract}>No active contract for this room</Text>
            <Button
              title="+ Add Contract"
              onPress={() => navigation.navigate('AddContract', { roomId })}
              size="small"
              style={styles.contractButton}
            />
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtons}>
          <Button
            title="Available"
            onPress={() => handleUpdateStatus('available')}
            size="small"
            variant={room.status === 'available' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
          <Button
            title="Occupied"
            onPress={() => handleUpdateStatus('occupied')}
            size="small"
            variant={room.status === 'occupied' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
          <Button
            title="Maintenance"
            onPress={() => handleUpdateStatus('maintenance')}
            size="small"
            variant={room.status === 'maintenance' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
          <Button
            title="Reserved"
            onPress={() => handleUpdateStatus('reserved')}
            size="small"
            variant={room.status === 'reserved' ? 'primary' : 'outline'}
            style={styles.statusButton}
          />
        </View>
      </Card>
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
    alignItems: 'flex-start',
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
  priceValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
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
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
  },
  contractButton: {
    marginTop: 12,
  },
  emptyContract: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
});
