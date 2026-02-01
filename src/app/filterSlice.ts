import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskPriority, TaskStatus } from '../types';

interface FilterState {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  searchQuery: string;
  sortBy: 'deadline' | 'priority' | 'createdAt';
}

const initialState: FilterState = {
  status: 'all',
  priority: 'all',
  searchQuery: '',
  sortBy: 'createdAt',
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<TaskStatus | 'all'>) {
      state.status = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<TaskPriority | 'all'>) {
      state.priority = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortBy(state, action: PayloadAction<'deadline' | 'priority' | 'createdAt'>) {
      state.sortBy = action.payload;
    },
    resetFilters(state) {
      return initialState;
    }
  },
});

export const {
  setStatusFilter,
  setPriorityFilter,
  setSearchQuery,
  setSortBy,
  resetFilters
} = filterSlice.actions;

export const selectFilter = (state: any) => state.filter;

export default filterSlice.reducer;