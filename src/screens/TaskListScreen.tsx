import React, { useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Plus } from 'lucide-react-native';

import { RootStackParamList, Task } from '../types';
import { useFetchTasksQuery, useUpdateTaskMutation } from '../api/tasksApi';
import { selectFilter } from '../app/filterSlice';
import { TaskItem } from '../components/TaskItem';
import { FilterControls } from '../components/FilterControls'; 
import { colors, spacing } from '../theme';

type TaskListScreenProp = NativeStackNavigationProp<RootStackParamList, 'TaskList'>;

export const TaskListScreen = () => {
  const navigation = useNavigation<TaskListScreenProp>();
  
  const { data: tasks = [], isLoading } = useFetchTasksQuery(); 
  const [updateTask] = useUpdateTaskMutation();
  
  const { status, priority, searchQuery, sortBy } = useSelector(selectFilter);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (status !== 'all') {
      result = result.filter(t => t.status === status);
    }
    if (priority !== 'all') {
      result = result.filter(t => t.priority === priority);
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerQuery) || 
        (t.description && t.description.toLowerCase().includes(lowerQuery))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return b.createdAt - a.createdAt; 
    });

    return result;
  }, [tasks, status, priority, searchQuery, sortBy]);

  const handlePressTask = useCallback((task: Task) => {
    navigation.navigate('TaskForm', { taskId: task.id });
  }, [navigation]);

  const handleToggleStatus = useCallback((task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask({ 
      id: task.id, 
      data: { status: newStatus } 
    });
  }, [updateTask]);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem 
      task={item} 
      onPress={handlePressTask} 
      onToggleStatus={handleToggleStatus} 
    />
  ), [handlePressTask, handleToggleStatus]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterControls />

      <FlatList
        data={filteredAndSortedTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10} 
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.text.secondary, marginTop: 40 }}>No tasks found</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('TaskForm', { taskId: undefined })}
      >
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 80 }, 
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: spacing.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});