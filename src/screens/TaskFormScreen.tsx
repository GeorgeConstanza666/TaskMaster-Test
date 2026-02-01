import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Save, Trash2, Image as ImageIcon, X } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { RootStackParamList, TaskPriority, Task } from '../types';
import { useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation, useFetchTasksQuery } from '../api/tasksApi';
import { uploadImageToStorage } from '../utils/fileUpload';
import { colors, spacing, borderRadius } from '../theme';

type TaskFormRouteProp = RouteProp<RootStackParamList, 'TaskForm'>;

const DRAFT_KEY = 'TASK_DRAFT_V1'; 

export const TaskFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<TaskFormRouteProp>();
  const { taskId } = route.params;

  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  
  const { task } = useFetchTasksQuery(undefined, {
    selectFromResult: ({ data }) => ({
      task: data?.find((t) => t.id === taskId),
    }),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState(new Date());
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDeadline(new Date(task.deadline));
      setCategory(task.category || '');
      if (task.imageUrl) setImageUri(task.imageUrl);
      navigation.setOptions({ title: 'Edit Task' });
    } else {
      const loadDraft = async () => {
        try {
          const draftJson = await AsyncStorage.getItem(DRAFT_KEY);
          if (draftJson) {
            const draft = JSON.parse(draftJson);
            setTitle(draft.title || '');
            setDescription(draft.description || '');
            setCategory(draft.category || '');
            if (draft.priority) setPriority(draft.priority);
            
            console.log('Draft restored');
          }
        } catch (e) {
          console.error('Failed to load draft');
        }
      };
      loadDraft();
    }
  }, [task, navigation]);

  useEffect(() => {
    if (!taskId) { 
      const saveDraft = async () => {
        const draftData = { title, description, category, priority };
        await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      };
      const timer = setTimeout(saveDraft, 500); 
      return () => clearTimeout(timer);
    }
  }, [title, description, category, priority, taskId]);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.5,
    });

    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = imageUri;

      if (imageUri && !imageUri.startsWith('http')) {
        finalImageUrl = await uploadImageToStorage(imageUri);
      }

      const taskData = {
        title,
        description,
        priority,
        category: category || 'General',
        deadline: deadline.toISOString(),
        status: task ? task.status : 'pending',
        imageUrl: finalImageUrl || null,
      };

      if (taskId) {
        await updateTask({ id: taskId, data: taskData }).unwrap();
      } else {
        await addTask(taskData as Task).unwrap();
        await AsyncStorage.removeItem(DRAFT_KEY);
      }
      
      navigation.goBack();
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          if (taskId) {
            try {
              await deleteTask(taskId).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      }
    ]);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDeadline(selectedDate);
  };

  const isBusy = isUploading || isDeleting;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.imageSection}>
          {imageUri ? (
            <View style={{ width: '100%' }}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                <X size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
              <ImageIcon size={32} color={colors.text.secondary} />
              <Text style={styles.imagePlaceholderText}>Attach Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && { backgroundColor: colors.priority[p] },
                  priority !== p && styles.priorityButtonInactive
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.priorityText,
                  priority === p ? { color: '#FFF' } : { color: colors.text.primary }
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Deadline</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={colors.text.secondary} />
            <Text style={styles.dateText}>
              {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details..."
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Work, Personal"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, isBusy && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Task</Text>
              </>
            )}
          </TouchableOpacity>

          {taskId && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete}
              disabled={isBusy}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
     flex: 1, 
     backgroundColor: colors.background 
    },
  content: { 
    padding: spacing.m 
  },
  section: { 
    marginBottom: spacing.l 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.text.secondary, 
    marginBottom: spacing.s 
  },
  input: { 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.m, 
    padding: spacing.m, 
    fontSize: 16, 
    color: colors.text.primary, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  textArea: { 
    height: 100 
  },
  priorityRow: { 
    flexDirection: 'row', 
    gap: spacing.m 
  },
  priorityButton: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: borderRadius.m, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  priorityButtonInactive: { 
    backgroundColor: colors.surface, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  priorityText: { 
    fontWeight: '600' 
  },
  dateButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.surface, 
    padding: spacing.m, 
    borderRadius: borderRadius.m, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  dateText: { 
    marginLeft: spacing.s, 
    fontSize: 16, 
    color: colors.text.primary 
  },
  footer: { 
    marginTop: spacing.m, 
    flexDirection: 'row', 
    gap: spacing.m 
  },
  saveButton: { 
    flex: 1, 
    backgroundColor: colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderRadius: borderRadius.l, 
    elevation: 2 
  },
  saveButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  deleteButton: { 
    width: 56, 
    height: 56, 
    backgroundColor: '#FFEBEE', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: borderRadius.l 
  },
  imageSection: { 
    alignItems: 'center', 
    marginBottom: spacing.l 
  },
  imagePlaceholder: {
    width: '100%', 
    height: 150, 
    backgroundColor: colors.surface, 
    borderRadius: borderRadius.m,
    borderWidth: 1, 
    borderColor: colors.border, 
    borderStyle: 'dashed',
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8
  },
  imagePlaceholderText: { 
    color: colors.text.secondary 
  },
  imagePreview: { 
    width: '100%', 
    height: 200, 
    borderRadius: borderRadius.m, 
    resizeMode: 'cover' 
  },
  removeImageButton: {
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6, 
    borderRadius: 20
  }
});