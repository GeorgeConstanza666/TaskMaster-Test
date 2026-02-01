export type TaskStatus = 'completed' | 'pending';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string; 
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; 
  category: string; 
  imageUrl?: string | null;
  createdAt: number; 
  userId?: string; 
}


export interface FilterState {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  searchQuery: string;
}


export type RootStackParamList = {
  TaskList: undefined; 
  TaskForm: { taskId?: string }; 
};