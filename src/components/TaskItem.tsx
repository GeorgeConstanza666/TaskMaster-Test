import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native'; 
import { Task } from '../types';
import { colors, spacing, borderRadius } from '../theme';

interface TaskItemProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

export const TaskItem = memo(({ task, onPress, onToggleStatus }: TaskItemProps) => {
  const priorityColor = colors.priority[task.priority];
  const isCompleted = task.status === 'completed';

  const getDeadlineInfo = () => {
    if (isCompleted) return { color: colors.text.secondary, icon: null };

    const now = new Date().getTime();
    const deadline = new Date(task.deadline).getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { 
        color: colors.error, 
        icon: <AlertCircle size={14} color={colors.error} style={{ marginRight: 4 }} />,
        isUrgent: true 
      };
    }
    if (diffHours < 24) {
      return { 
        color: '#FF9800', 
        icon: <Clock size={14} color="#FF9800" style={{ marginRight: 4 }} />,
        isUrgent: true 
      };
    }

    return { color: colors.text.secondary, icon: null };
  };

  const { color: dateColor, icon: dateIcon, isUrgent } = getDeadlineInfo();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityStrip, { backgroundColor: priorityColor }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[
              styles.title, 
              isCompleted && styles.completedTitle
            ]} numberOfLines={1}>
              {task.title}
            </Text>
          </View>

          {task.imageUrl && (
            <Image 
              source={{ uri: task.imageUrl }} 
              style={styles.thumbnail} 
            />
          )}

          <TouchableOpacity 
            onPress={() => onToggleStatus(task)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isCompleted ? (
              <CheckCircle2 size={24} color={colors.primary} />
            ) : (
              <Circle size={24} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {task.category || 'General'}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            {dateIcon}
            <Text style={[
              styles.date, 
              { color: dateColor },
              isUrgent && { fontWeight: 'bold' }
            ]}>
              {new Date(task.deadline).toLocaleDateString()}
              {isUrgent && ` ${new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    height: 80,
  },
  priorityStrip: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: spacing.s,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
});