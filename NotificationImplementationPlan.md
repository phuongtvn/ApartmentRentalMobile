# Notification Feature Implementation Plan

## Overview

This document outlines a comprehensive plan for implementing push notifications in the Apartment Rental Management Mobile Application. Notifications will keep users informed about important events such as lease expirations, payment due dates, maintenance requests, and other critical updates.

## Objectives

1. Enable real-time notifications for critical business events
2. Support both in-app and push notifications (iOS and Android)
3. Allow users to manage notification preferences
4. Integrate with existing Supabase infrastructure
5. Ensure notifications respect multi-tenant data isolation

## Notification Types

### 1. Payment Notifications
- **Payment Due Reminder**: 3 days before payment due date
- **Payment Overdue Alert**: On the day payment becomes overdue
- **Payment Received Confirmation**: When payment is recorded
- **Late Fee Applied**: When late fees are added to payment

### 2. Lease Notifications
- **Lease Expiring Soon**: 30, 60, and 90 days before expiration
- **Lease Started**: On lease start date
- **Lease Expired**: On lease end date
- **New Lease Created**: When a new lease is drafted

### 3. Maintenance Notifications
- **New Maintenance Request**: When a request is created
- **Maintenance Status Update**: When status changes (assigned, in progress, completed)
- **Maintenance Scheduled**: When a maintenance date is set
- **Maintenance Completed**: When maintenance is marked complete

### 4. Tenant Notifications
- **New Tenant Added**: When a tenant record is created
- **Tenant Status Change**: When tenant status changes

### 5. Room/Building Notifications
- **Room Status Change**: When room becomes available or occupied
- **New Building Added**: When a new property is added

### 6. System Notifications
- **Welcome Message**: First-time user onboarding
- **Account Updates**: Profile or settings changes
- **Security Alerts**: Password changes, login from new device

## Technical Architecture

### 1. Notification Service Provider

**Recommended**: **Expo Notifications** (with React Native Firebase as alternative)

#### Option A: Expo Notifications (Recommended)
**Pros**:
- Easy integration with React Native
- Works with both iOS and Android
- Built-in notification management
- Free tier available
- Well-documented

**Cons**:
- Requires Expo SDK (can use bare workflow)
- Additional dependency

**Installation**:
```bash
npm install expo-notifications
npm install expo-device
npm install expo-constants
```

#### Option B: React Native Firebase Cloud Messaging
**Pros**:
- Free service from Google
- Highly reliable
- Rich feature set
- Direct FCM integration

**Cons**:
- More complex setup
- Requires Firebase project setup
- Additional configuration for iOS

**Installation**:
```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
```

### 2. Database Schema Changes

#### New Table: notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL CHECK (type IN (
        'payment_due', 'payment_overdue', 'payment_received', 'late_fee_applied',
        'lease_expiring', 'lease_started', 'lease_expired', 'lease_created',
        'maintenance_new', 'maintenance_updated', 'maintenance_scheduled', 'maintenance_completed',
        'tenant_added', 'tenant_status_changed',
        'room_status_changed', 'building_added',
        'welcome', 'account_update', 'security_alert'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data (lease_id, payment_id, etc.)
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration for time-sensitive notifications
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());
```

#### New Table: notification_preferences

```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Payment notifications
    payment_due_enabled BOOLEAN DEFAULT true,
    payment_due_days_before INTEGER DEFAULT 3,
    payment_overdue_enabled BOOLEAN DEFAULT true,
    payment_received_enabled BOOLEAN DEFAULT true,
    
    -- Lease notifications
    lease_expiring_enabled BOOLEAN DEFAULT true,
    lease_expiring_days_before INTEGER[] DEFAULT ARRAY[30, 60, 90],
    lease_started_enabled BOOLEAN DEFAULT true,
    lease_expired_enabled BOOLEAN DEFAULT true,
    
    -- Maintenance notifications
    maintenance_new_enabled BOOLEAN DEFAULT true,
    maintenance_updated_enabled BOOLEAN DEFAULT true,
    maintenance_completed_enabled BOOLEAN DEFAULT true,
    
    -- Other notifications
    tenant_notifications_enabled BOOLEAN DEFAULT true,
    room_notifications_enabled BOOLEAN DEFAULT true,
    system_notifications_enabled BOOLEAN DEFAULT true,
    
    -- Delivery preferences
    push_notifications_enabled BOOLEAN DEFAULT true,
    in_app_notifications_enabled BOOLEAN DEFAULT true,
    email_notifications_enabled BOOLEAN DEFAULT false,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- RLS Policy
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
    ON notification_preferences FOR ALL
    USING (user_id = auth.uid());
```

#### New Table: push_tokens

```sql
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type VARCHAR(50) CHECK (device_type IN ('ios', 'android', 'web')),
    device_name VARCHAR(255),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Index
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active);

-- RLS Policy
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tokens"
    ON push_tokens FOR ALL
    USING (user_id = auth.uid());
```

### 3. Database Functions and Triggers

#### Function: Create Notification

```sql
CREATE OR REPLACE FUNCTION create_notification(
    p_client_id UUID,
    p_user_id UUID,
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_data JSONB DEFAULT NULL,
    p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        client_id, user_id, type, title, message, data, priority
    ) VALUES (
        p_client_id, p_user_id, p_type, p_title, p_message, p_data, p_priority
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Trigger: Payment Due Notifications

```sql
CREATE OR REPLACE FUNCTION check_payment_due_notifications()
RETURNS void AS $$
DECLARE
    payment_record RECORD;
    lease_record RECORD;
    user_record RECORD;
    days_before INTEGER;
BEGIN
    -- Get notification preferences and create notifications for upcoming payments
    FOR payment_record IN 
        SELECT p.*, l.tenant_id, l.room_id, l.client_id
        FROM payments p
        JOIN leases l ON p.lease_id = l.id
        WHERE p.status = 'pending'
        AND p.due_date > CURRENT_DATE
        AND p.due_date <= CURRENT_DATE + INTERVAL '7 days'
    LOOP
        -- Get users who should be notified (managers and admins of the client)
        FOR user_record IN
            SELECT u.id, np.payment_due_enabled, np.payment_due_days_before
            FROM users u
            LEFT JOIN notification_preferences np ON u.id = np.user_id
            WHERE u.client_id = payment_record.client_id
            AND u.role IN ('admin', 'manager')
            AND (np.payment_due_enabled IS NULL OR np.payment_due_enabled = true)
        LOOP
            days_before := COALESCE(user_record.payment_due_days_before, 3);
            
            IF payment_record.due_date = CURRENT_DATE + days_before THEN
                PERFORM create_notification(
                    payment_record.client_id,
                    user_record.id,
                    'payment_due',
                    'Payment Due Soon',
                    format('Payment of $%s is due in %s days', payment_record.amount, days_before),
                    jsonb_build_object('payment_id', payment_record.id, 'lease_id', payment_record.lease_id),
                    'high'
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger: Lease Expiration Notifications

```sql
CREATE OR REPLACE FUNCTION check_lease_expiration_notifications()
RETURNS void AS $$
DECLARE
    lease_record RECORD;
    user_record RECORD;
    days_until_expiry INTEGER;
BEGIN
    FOR lease_record IN 
        SELECT *
        FROM leases
        WHERE status = 'active'
        AND end_date > CURRENT_DATE
        AND end_date <= CURRENT_DATE + INTERVAL '90 days'
    LOOP
        days_until_expiry := lease_record.end_date - CURRENT_DATE;
        
        -- Get users who should be notified
        FOR user_record IN
            SELECT u.id, np.lease_expiring_enabled, np.lease_expiring_days_before
            FROM users u
            LEFT JOIN notification_preferences np ON u.id = np.user_id
            WHERE u.client_id = lease_record.client_id
            AND u.role IN ('admin', 'manager')
            AND (np.lease_expiring_enabled IS NULL OR np.lease_expiring_enabled = true)
        LOOP
            -- Check if we should notify for this number of days
            IF days_until_expiry = ANY(COALESCE(user_record.lease_expiring_days_before, ARRAY[30, 60, 90])) THEN
                PERFORM create_notification(
                    lease_record.client_id,
                    user_record.id,
                    'lease_expiring',
                    'Lease Expiring Soon',
                    format('Lease #%s expires in %s days', lease_record.lease_number, days_until_expiry),
                    jsonb_build_object('lease_id', lease_record.id),
                    'high'
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

#### Trigger: Maintenance Request Notifications

```sql
CREATE OR REPLACE FUNCTION notify_maintenance_request()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Notify all managers and admins when a new maintenance request is created
    IF TG_OP = 'INSERT' THEN
        FOR user_record IN
            SELECT u.id
            FROM users u
            LEFT JOIN notification_preferences np ON u.id = np.user_id
            WHERE u.client_id = NEW.client_id
            AND u.role IN ('admin', 'manager')
            AND (np.maintenance_new_enabled IS NULL OR np.maintenance_new_enabled = true)
        LOOP
            PERFORM create_notification(
                NEW.client_id,
                user_record.id,
                'maintenance_new',
                'New Maintenance Request',
                format('New %s maintenance request: %s', NEW.priority, NEW.title),
                jsonb_build_object('maintenance_id', NEW.id, 'room_id', NEW.room_id),
                CASE WHEN NEW.priority = 'urgent' THEN 'urgent' ELSE 'normal' END
            );
        END LOOP;
    END IF;
    
    -- Notify when status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Notify the assigned user
        IF NEW.assigned_to IS NOT NULL THEN
            PERFORM create_notification(
                NEW.client_id,
                NEW.assigned_to,
                'maintenance_updated',
                'Maintenance Status Updated',
                format('Maintenance request status changed to: %s', NEW.status),
                jsonb_build_object('maintenance_id', NEW.id, 'room_id', NEW.room_id),
                'normal'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_notification_trigger
AFTER INSERT OR UPDATE ON maintenance_requests
FOR EACH ROW EXECUTE FUNCTION notify_maintenance_request();
```

### 4. Application Layer Components

#### Service: NotificationService.ts

```typescript
// src/services/notification.service.ts
import { supabase } from '../config/supabase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export class NotificationService {
  // Initialize notification system
  static async initialize() {
    await this.configurePushNotifications();
    await this.registerForPushNotifications();
    this.setupNotificationListeners();
  }
  
  // Configure notification settings
  static async configurePushNotifications() {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
  
  // Register device for push notifications
  static async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await this.savePushToken(token);
    
    return token;
  }
  
  // Save push token to database
  static async savePushToken(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('push_tokens').upsert({
      user_id: user.id,
      token,
      device_type: Platform.OS,
      device_name: Device.deviceName || 'Unknown',
      is_active: true,
      last_used_at: new Date().toISOString(),
    });
  }
  
  // Setup notification listeners
  static setupNotificationListeners() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    
    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      this.handleNotificationTap(response.notification);
    });
  }
  
  // Handle notification tap - navigate to relevant screen
  static handleNotificationTap(notification: any) {
    const { data } = notification.request.content;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'payment_due':
      case 'payment_overdue':
        // Navigate to payment details
        break;
      case 'lease_expiring':
      case 'lease_started':
        // Navigate to lease details
        break;
      case 'maintenance_new':
      case 'maintenance_updated':
        // Navigate to maintenance request
        break;
      default:
        // Navigate to notifications list
        break;
    }
  }
  
  // Fetch notifications from database
  static async fetchNotifications(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }
  
  // Mark notification as read
  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);
    
    if (error) throw error;
  }
  
  // Mark all notifications as read
  static async markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'unread');
    
    if (error) throw error;
  }
  
  // Get unread notification count
  static async getUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'unread');
    
    if (error) throw error;
    return count || 0;
  }
  
  // Subscribe to real-time notifications
  static subscribeToNotifications(callback: (notification: any) => void) {
    const { data: { user } } = supabase.auth.getUser();
    
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        payload => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
  
  // Get notification preferences
  static async getPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No preferences exist, create default
      return await this.createDefaultPreferences();
    }
    
    if (error) throw error;
    return data;
  }
  
  // Create default preferences
  static async createDefaultPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({ user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Update notification preferences
  static async updatePreferences(preferences: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
      });
    
    if (error) throw error;
  }
}
```

#### Component: NotificationBell.tsx

```typescript
// src/components/NotificationBell.tsx
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { NotificationService } from '../services/notification.service';

export const NotificationBell = ({ onPress }: { onPress: () => void }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    loadUnreadCount();
    
    // Subscribe to new notifications
    const subscription = NotificationService.subscribeToNotifications(() => {
      loadUnreadCount();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const loadUnreadCount = async () => {
    const count = await NotificationService.getUnreadCount();
    setUnreadCount(count);
  };
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.icon}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  icon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

#### Screen: NotificationsListScreen.tsx

```typescript
// src/screens/notifications/NotificationsListScreen.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { NotificationService } from '../../services/notification.service';

export const NotificationsListScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const loadNotifications = async () => {
    try {
      const data = await NotificationService.fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationPress = async (notification: any) => {
    await NotificationService.markAsRead(notification.id);
    
    // Navigate to relevant screen based on notification data
    if (notification.data?.payment_id) {
      navigation.navigate('PaymentDetails', { id: notification.data.payment_id });
    } else if (notification.data?.lease_id) {
      navigation.navigate('LeaseDetails', { id: notification.data.lease_id });
    }
    // ... handle other types
  };
  
  const renderNotification = ({ item }: any) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        item.status === 'unread' && styles.unreadItem
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{formatTime(item.sent_at)}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={loadNotifications}
      />
    </View>
  );
};

const formatTime = (timestamp: string) => {
  // Format timestamp to human-readable format
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadItem: {
    borderLeftColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
```

## Implementation Steps

### Phase 1: Database Setup (Week 1)
1. ✅ Create notifications table
2. ✅ Create notification_preferences table
3. ✅ Create push_tokens table
4. ✅ Add RLS policies for all new tables
5. ✅ Create database functions for notification creation
6. ✅ Create triggers for automatic notifications

### Phase 2: Core Service Implementation (Week 2)
1. Install required npm packages (expo-notifications, expo-device)
2. Create NotificationService class with core methods
3. Implement push token registration
4. Add notification permission handling
5. Create notification preferences management
6. Add real-time notification subscription

### Phase 3: UI Components (Week 3)
1. Create NotificationBell component with unread badge
2. Create NotificationsListScreen
3. Create NotificationSettingsScreen
4. Add notification icon to navigation header
5. Implement notification tap handling and navigation

### Phase 4: Scheduled Notifications (Week 4)
1. Set up cron job or scheduled function for payment reminders
2. Implement lease expiration check job
3. Add database functions to run daily checks
4. Configure Supabase Edge Functions for scheduled tasks

### Phase 5: Testing & Refinement (Week 5)
1. Test on iOS devices
2. Test on Android devices
3. Verify multi-tenant isolation
4. Test notification preferences
5. Load testing for notification throughput
6. User acceptance testing

### Phase 6: Documentation & Deployment (Week 6)
1. Update user documentation
2. Create admin guide for notification management
3. Add notification analytics
4. Deploy to production
5. Monitor notification delivery rates

## Configuration Requirements

### 1. Expo Configuration (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#007AFF",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    }
  }
}
```

### 2. iOS Configuration

- Add NSUserNotificationsUsageDescription to Info.plist
- Configure Apple Push Notification service (APNs)
- Add push notification capability in Xcode

### 3. Android Configuration

- Add Firebase Cloud Messaging configuration
- Update AndroidManifest.xml with notification permissions
- Configure notification channels

### 4. Supabase Configuration

- Enable Supabase Realtime for notifications table
- Set up Edge Functions for scheduled notifications
- Configure webhook endpoints if needed

## Testing Strategy

### Unit Tests
- Test NotificationService methods
- Test preference management
- Test notification data formatting

### Integration Tests
- Test database triggers
- Test RLS policies
- Test real-time subscriptions

### E2E Tests
- Test notification flow from trigger to display
- Test notification tap navigation
- Test preference updates

### Manual Testing
- Test on physical iOS device
- Test on physical Android device
- Test background and foreground scenarios
- Test permission flows

## Performance Considerations

1. **Batch Notifications**: Group multiple notifications for the same user
2. **Rate Limiting**: Prevent notification spam
3. **Quiet Hours**: Respect user quiet hours preferences
4. **Notification Expiry**: Auto-delete old notifications
5. **Database Indexing**: Ensure proper indexes on notifications table
6. **Real-time Subscriptions**: Limit active subscriptions

## Security Considerations

1. **RLS Policies**: Ensure users can only see their notifications
2. **Token Security**: Encrypt push tokens at rest
3. **Data Validation**: Validate all notification data
4. **Permission Checks**: Verify user permissions before sending
5. **Multi-tenant Isolation**: Enforce client_id filtering

## Monitoring & Analytics

### Metrics to Track
- Notification delivery rate
- Notification open rate
- Time to delivery
- User preference changes
- Failed deliveries
- Unsubscribe rate

### Alerts
- High failure rate
- Delivery delays
- Permission denial rate
- Database performance issues

## Cost Estimation

### Expo Push Notifications
- Free: Up to 1 million notifications/month
- Pro: Higher limits and priority delivery

### Supabase
- Database storage: Minimal (notifications)
- Realtime connections: Consider active users
- Edge Functions: Based on execution time

### Total Estimated Cost
- **Month 1-3**: Free tier sufficient
- **After scale**: ~$10-50/month depending on user base

## Future Enhancements

1. **Rich Notifications**: Add images, buttons, and actions
2. **Notification Channels**: Let users customize by category
3. **Email Notifications**: Send email copies of critical notifications
4. **SMS Notifications**: Add SMS for urgent notifications
5. **Notification Templates**: Create reusable templates
6. **A/B Testing**: Test notification effectiveness
7. **Notification History**: Keep longer history for audit
8. **Smart Notifications**: Use ML to optimize delivery timing

## Success Metrics

- ✅ 95%+ notification delivery rate
- ✅ <5 second delivery time
- ✅ 50%+ notification open rate
- ✅ <5% unsubscribe rate
- ✅ Zero cross-tenant data leaks
- ✅ User satisfaction score >4/5

## Dependencies

```json
{
  "dependencies": {
    "expo-notifications": "^0.27.0",
    "expo-device": "^5.9.0",
    "expo-constants": "^15.4.0"
  }
}
```

Alternative (React Native Firebase):
```json
{
  "dependencies": {
    "@react-native-firebase/app": "^18.0.0",
    "@react-native-firebase/messaging": "^18.0.0"
  }
}
```

## Rollout Plan

### Phase 1: Alpha (Internal Testing)
- Deploy to development environment
- Test with internal users
- Gather feedback

### Phase 2: Beta (Limited Release)
- Deploy to select users/clients
- Monitor performance and issues
- Iterate based on feedback

### Phase 3: General Availability
- Deploy to all users
- Monitor metrics
- Provide user training

## Support & Maintenance

- Weekly review of notification metrics
- Monthly review of user feedback
- Quarterly review of notification types and triggers
- Regular updates to notification content and templates

## Conclusion

This implementation plan provides a comprehensive roadmap for adding push notifications to the Apartment Rental Management Mobile Application. The phased approach ensures a stable rollout with proper testing and monitoring at each stage.
