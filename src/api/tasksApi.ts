import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import firestore from '@react-native-firebase/firestore';
import { Task } from '../types';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    fetchTasks: builder.query<Task[], void>({
      queryFn: async () => {
        return { data: [] };
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;
          const unsubscribe = firestore()
            .collection('tasks')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
              if (!snapshot) return;
              const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              })) as Task[];
              updateCachedData(() => tasks);
            });
          await cacheEntryRemoved;
          unsubscribe();
        } catch (error) {
        }
      },
    }),


    addTask: builder.mutation<null, Partial<Task>>({
      queryFn: async (task) => {
        try {
          await firestore().collection('tasks').add({
            ...task,
            createdAt: Date.now(), 
          });
          return { data: null };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),

    updateTask: builder.mutation<null, { id: string; data: Partial<Task> }>({
      queryFn: async ({ id, data }) => {
        try {
          await firestore().collection('tasks').doc(id).update(data);
          return { data: null };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),

    deleteTask: builder.mutation<null, string>({
      queryFn: async (id) => {
        try {
          await firestore().collection('tasks').doc(id).delete();
          return { data: null };
        } catch (error: any) {
          return { error: error.message };
        }
      },
    }),
  }),
});

export const { 
  useFetchTasksQuery, 
  useAddTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation 
} = tasksApi;