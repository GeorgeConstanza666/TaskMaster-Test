import { configureStore } from '@reduxjs/toolkit';
import { tasksApi } from '../api/tasksApi';
import filterReducer from './filterSlice'; 

export const store = configureStore({
  reducer: {
    [tasksApi.reducerPath]: tasksApi.reducer,

    filter: filterReducer, 
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(tasksApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;