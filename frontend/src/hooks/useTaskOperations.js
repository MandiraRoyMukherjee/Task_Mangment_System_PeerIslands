import { useCallback } from 'react';
import { useTasks } from '../context/TaskContext';

export function useTaskOperations() {
  const { state, actions } = useTasks();

  const createTask = useCallback(async (taskData) => {
    try {
      const response = await actions.createTask(taskData);
      return response;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }, [actions]);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const response = await actions.updateTask(taskId, taskData);
      return response;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }, [actions]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await actions.deleteTask(taskId);
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }, [actions]);

  const markTaskDone = useCallback((task) => {
    actions.markTaskDone(task);
  }, [actions]);

  const refreshTasks = useCallback(() => {
    actions.fetchTasks();
  }, [actions]);

  return {
    createTask,
    updateTask,
    deleteTask,
    markTaskDone,
    refreshTasks,
    loading: state.loading,
    error: state.error
  };
}

// Custom hook for task filtering
export function useTaskFiltering() {
  const { state, actions } = useTasks();

  const setFilter = useCallback((filter) => {
    actions.setFilter(filter);
  }, [actions]);

  const clearFilter = useCallback(() => {
    actions.clearFilter();
  }, [actions]);

  const filteredTasks = useCallback(() => {
    return state.tasks.filter(task => {
      if (state.filters.status && task.status !== state.filters.status) return false;
      if (state.filters.priority && task.priority !== state.filters.priority) return false;
      if (state.filters.dueToday) {
        const taskDate = task.due_date ? new Date(task.due_date).toDateString() : null;
        if (taskDate !== new Date().toDateString()) return false;
      }
      return true;
    });
  }, [state.tasks, state.filters]);

  return {
    filters: state.filters,
    setFilter,
    clearFilter,
    filteredTasks: filteredTasks(),
    allTasks: state.tasks,
    completedTasks: state.completedTasks
  };
}

// Custom hook for task editing
export function useTaskEditing() {
  const { state, actions } = useTasks();

  const startEditing = useCallback((task) => {
    actions.setEditingTask(task);
  }, [actions]);

  const stopEditing = useCallback(() => {
    actions.clearEditingTask();
  }, [actions]);

  return {
    editingTask: state.editingTask,
    isEditing: !!state.editingTask,
    startEditing,
    stopEditing
  };
}
