import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { taskAPI } from '../api/taskapi';


const TASK_ACTIONS = {
  FETCH_TASKS_START: 'FETCH_TASKS_START',
  FETCH_TASKS_SUCCESS: 'FETCH_TASKS_SUCCESS',
  FETCH_TASKS_ERROR: 'FETCH_TASKS_ERROR',
  CREATE_TASK_START: 'CREATE_TASK_START',
  CREATE_TASK_SUCCESS: 'CREATE_TASK_SUCCESS',
  CREATE_TASK_ERROR: 'CREATE_TASK_ERROR',
  UPDATE_TASK_START: 'UPDATE_TASK_START',
  UPDATE_TASK_SUCCESS: 'UPDATE_TASK_SUCCESS',
  UPDATE_TASK_ERROR: 'UPDATE_TASK_ERROR',
  DELETE_TASK_START: 'DELETE_TASK_START',
  DELETE_TASK_SUCCESS: 'DELETE_TASK_SUCCESS',
  DELETE_TASK_ERROR: 'DELETE_TASK_ERROR',
  MARK_TASK_DONE: 'MARK_TASK_DONE',
  SET_EDITING_TASK: 'SET_EDITING_TASK',
  CLEAR_EDITING_TASK: 'CLEAR_EDITING_TASK',
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTER: 'CLEAR_FILTER'
};

// Initial State
const initialState = {
  tasks: [],
  completedTasks: [],
  editingTask: null,
  filters: {
    status: '',
    priority: '',
    dueToday: false
  },
  loading: {
    tasks: false,
    create: false,
    update: false,
    delete: false
  },
  error: null
};

// Reducer
function taskReducer(state, action) {
  switch (action.type) {
    case TASK_ACTIONS.FETCH_TASKS_START:
      return {
        ...state,
        loading: { ...state.loading, tasks: true },
        error: null
      };

    case TASK_ACTIONS.FETCH_TASKS_SUCCESS:
      const allTasks = action.payload;
      const activeTasks = allTasks.filter(task => task.status !== 'Done');
      const completedTasks = allTasks.filter(task => task.status === 'Done');
      
      return {
        ...state,
        tasks: activeTasks,
        completedTasks,
        loading: { ...state.loading, tasks: false },
        error: null
      };

    case TASK_ACTIONS.FETCH_TASKS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, tasks: false },
        error: action.payload
      };

    case TASK_ACTIONS.CREATE_TASK_START:
      return {
        ...state,
        loading: { ...state.loading, create: true },
        error: null
      };

    case TASK_ACTIONS.CREATE_TASK_SUCCESS:
      const newTask = action.payload;
      if (newTask.status === 'Done') {
        return {
          ...state,
          completedTasks: [newTask, ...state.completedTasks],
          loading: { ...state.loading, create: false }
        };
      } else {
        return {
          ...state,
          tasks: [newTask, ...state.tasks],
          loading: { ...state.loading, create: false }
        };
      }

    case TASK_ACTIONS.CREATE_TASK_ERROR:
      return {
        ...state,
        loading: { ...state.loading, create: false },
        error: action.payload
      };

    case TASK_ACTIONS.UPDATE_TASK_START:
      return {
        ...state,
        loading: { ...state.loading, update: true },
        error: null
      };

    case TASK_ACTIONS.UPDATE_TASK_SUCCESS:
      const updatedTask = action.payload;
      const isCompleted = updatedTask.status === 'Done';
      
      if (isCompleted) {
        // Move from active to completed
        return {
          ...state,
          tasks: state.tasks.filter(task => task.id !== updatedTask.id),
          completedTasks: [updatedTask, ...state.completedTasks],
          loading: { ...state.loading, update: false }
        };
      } else {
        // Update in active tasks
        return {
          ...state,
          tasks: state.tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          ),
          loading: { ...state.loading, update: false }
        };
      }

    case TASK_ACTIONS.UPDATE_TASK_ERROR:
      return {
        ...state,
        loading: { ...state.loading, update: false },
        error: action.payload
      };

    case TASK_ACTIONS.DELETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        completedTasks: state.completedTasks.filter(task => task.id !== action.payload),
        loading: { ...state.loading, delete: false }
      };

    case TASK_ACTIONS.MARK_TASK_DONE:
      const taskToMark = action.payload;
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== taskToMark.id),
        completedTasks: [taskToMark, ...state.completedTasks]
      };

    case TASK_ACTIONS.SET_EDITING_TASK:
      return {
        ...state,
        editingTask: action.payload
      };

    case TASK_ACTIONS.CLEAR_EDITING_TASK:
      return {
        ...state,
        editingTask: null
      };

    case TASK_ACTIONS.SET_FILTER:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case TASK_ACTIONS.CLEAR_FILTER:
      return {
        ...state,
        filters: initialState.filters
      };

    default:
      return state;
  }
}

// Context
const TaskContext = createContext();

// Provider Component
export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Actions
  const actions = {
    // Fetch all tasks
    fetchTasks: async () => {
      dispatch({ type: TASK_ACTIONS.FETCH_TASKS_START });
      try {
        const response = await taskAPI.getTasks();
        dispatch({ 
          type: TASK_ACTIONS.FETCH_TASKS_SUCCESS, 
          payload: response.data || response 
        });
      } catch (error) {
        dispatch({ 
          type: TASK_ACTIONS.FETCH_TASKS_ERROR, 
          payload: error.message 
        });
      }
    },

    // Create task
    createTask: async (taskData) => {
      dispatch({ type: TASK_ACTIONS.CREATE_TASK_START });
      try {
        const response = await taskAPI.createTask(taskData);
        const newTask = {
          id: response.data?.taskId || response.taskId,
          ...taskData
        };
        dispatch({ 
          type: TASK_ACTIONS.CREATE_TASK_SUCCESS, 
          payload: newTask 
        });
        return response;
      } catch (error) {
        dispatch({ 
          type: TASK_ACTIONS.CREATE_TASK_ERROR, 
          payload: error.message 
        });
        throw error;
      }
    },

    // Update task
    updateTask: async (taskId, taskData) => {
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK_START });
      try {
        const response = await taskAPI.updateTask(taskId, taskData);
        const updatedTask = { id: taskId, ...taskData };
        dispatch({ 
          type: TASK_ACTIONS.UPDATE_TASK_SUCCESS, 
          payload: updatedTask 
        });
        return response;
      } catch (error) {
        dispatch({ 
          type: TASK_ACTIONS.UPDATE_TASK_ERROR, 
          payload: error.message 
        });
        throw error;
      }
    },

    // Delete task
    deleteTask: async (taskId) => {
      dispatch({ type: TASK_ACTIONS.DELETE_TASK_START });
      try {
        await taskAPI.deleteTask(taskId);
        dispatch({ 
          type: TASK_ACTIONS.DELETE_TASK_SUCCESS, 
          payload: taskId 
        });
      } catch (error) {
        dispatch({ 
          type: TASK_ACTIONS.DELETE_TASK_ERROR, 
          payload: error.message 
        });
        throw error;
      }
    },

    // Mark task as done
    markTaskDone: (task) => {
      dispatch({ type: TASK_ACTIONS.MARK_TASK_DONE, payload: task });
    },

    // Set editing task
    setEditingTask: (task) => {
      dispatch({ type: TASK_ACTIONS.SET_EDITING_TASK, payload: task });
    },

    // Clear editing task
    clearEditingTask: () => {
      dispatch({ type: TASK_ACTIONS.CLEAR_EDITING_TASK });
    },

    // Set filter
    setFilter: (filter) => {
      dispatch({ type: TASK_ACTIONS.SET_FILTER, payload: filter });
    },

    // Clear filter
    clearFilter: () => {
      dispatch({ type: TASK_ACTIONS.CLEAR_FILTER });
    }
  };

  // Fetch tasks on mount
  useEffect(() => {
    actions.fetchTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ state, actions }}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom Hook
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

export { TASK_ACTIONS };
