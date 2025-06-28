import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { List, AppState, Tag, ListItem } from '../types';

type Action =
  | { type: 'ADD_LIST'; payload: { id?: string; title: string; type: string; icon?: string; avatar?: string; tags?: Tag[]; viewMode?: 'list' | 'cover'; color?: string; temporary?: boolean } }
  | { type: 'DELETE_LIST'; payload: { id: string } }
  | { type: 'SET_ACTIVE_LIST'; payload: { id: string | null } }
  | { type: 'ADD_ITEM'; payload: { listId: string; content: string; coverImage?: string; parentItemId?: string } }
  | { type: 'DELETE_ITEM'; payload: { listId: string; itemId: string; parentItemId?: string } }
  | { type: 'TOGGLE_ITEM'; payload: { listId: string; itemId: string; parentItemId?: string } }
  | { type: 'UPDATE_ITEM'; payload: { listId: string; itemId: string; content: string; coverImage?: string; parentItemId?: string } }
  | { type: 'TOGGLE_VIEW_MODE'; payload: { listId: string } }
  | { type: 'UPDATE_LIST'; payload: { id: string; title: string; icon?: string; avatar?: string; tags?: Tag[]; favorite?: boolean; pinned?: boolean; color?: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string } }
  | { type: 'TOGGLE_PINNED'; payload: { id: string } }
  | { type: 'TOGGLE_PRIORITY_ITEM'; payload: { listId: string; itemId: string } }
  | { type: 'SET_FILTER_TAG'; payload: { tag: string | null } }
  | { type: 'REORDER_ITEMS'; payload: { listId: string; items: ListItem[] } }
  | { type: 'REORDER_LISTS'; payload: { lists: List[] } };

interface ListContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addList: (title: string, type: string, icon?: string, avatar?: string, tags?: Tag[], color?: string, temporary?: boolean) => void;
  addListFromTemplate: (template: { title: string; type: string; icon?: string; tags?: string[]; items: any[] }) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string | null) => void;
  addItem: (listId: string, content: string, coverImage?: string, parentItemId?: string) => void;
  deleteItem: (listId: string, itemId: string, parentItemId?: string) => void;
  toggleItem: (listId: string, itemId: string, parentItemId?: string) => void;
  updateItem: (listId: string, itemId: string, content: string, coverImage?: string, parentItemId?: string) => void;
  reorderItems: (listId: string, items: ListItem[]) => void;
  toggleViewMode: (listId: string) => void;
  setFilterTag: (tag: string | null) => void;
  getActiveList: () => List | undefined;
  updateList: (id: string, title: string, icon?: string, avatar?: string, tags?: Tag[], favorite?: boolean, pinned?: boolean, color?: string) => void;
  togglePriorityItem: (listId: string, itemId: string) => void;
}


const initialState: AppState = {
  lists: [],
  activeListId: null,
  filterTag: null,
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const reducer = (state: AppState, action: Action): AppState => {
  const updateNestedItems = (items: ListItem[], itemId: string, callback: (item: ListItem) => ListItem): ListItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return callback(item);
      }
      if (item.children) {
        return {
          ...item,
          children: updateNestedItems(item.children, itemId, callback),
        };
      }
      return item;
    });
  };

  switch (action.type) {
  case 'ADD_LIST':
      const newList: List = {
        id: action.payload.id || generateId(),
        title: action.payload.title,
        type: action.payload.type,
        icon: action.payload.icon,
        items: [],
        createdAt: Date.now(),
        viewMode: action.payload.viewMode || 'list',
        favorite: false,
        pinned: false,
        tags: action.payload.tags || [],
        color: action.payload.color || '#84cc16', // cor padrão verde
        temporary: action.payload.temporary || false,
      };
      return {
        ...state,
        lists: [...state.lists, newList],
        activeListId: newList.id,
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== action.payload.id),
        activeListId: state.activeListId === action.payload.id ? null : state.activeListId,
      };
    case 'REORDER_LISTS':
      return {
        ...state,
        lists: action.payload.lists,
      };

    case 'SET_ACTIVE_LIST':
      return {
        ...state,
        activeListId: action.payload.id,
      };

    case 'ADD_ITEM':
      if (action.payload.parentItemId) {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: updateNestedItems(list.items, action.payload.parentItemId!, (parentItem) => ({
                  ...parentItem,
                  children: [
                    ...(parentItem.children || []),
                    {
                      id: generateId(),
                      content: action.payload.content,
                      coverImage: action.payload.coverImage,
                      completed: false,
                      createdAt: Date.now(),
                    },
                  ],
                })),
              };
            }
            return list;
          }),
        };
      } else {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: [
                  ...list.items,
                  {
                    id: generateId(),
                    content: action.payload.content,
                    coverImage: action.payload.coverImage,
                    completed: false,
                    createdAt: Date.now(),
                  },
                ],
              };
            }
            return list;
          }),
        };
      }

    case 'DELETE_ITEM':
      if (action.payload.parentItemId) {
        const deleteNestedItem = (items: ListItem[], itemId: string): ListItem[] => {
          return items
            .map(item => {
              if (item.children) {
                return {
                  ...item,
                  children: deleteNestedItem(item.children, itemId),
                };
              }
              return item;
            })
            .filter(item => item.id !== itemId);
        };
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: deleteNestedItem(list.items, action.payload.itemId),
              };
            }
            return list;
          }),
        };
      } else {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: list.items.filter((item) => item.id !== action.payload.itemId),
              };
            }
            return list;
          }),
        };
      }

    case 'TOGGLE_ITEM':
      if (action.payload.parentItemId) {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: updateNestedItems(list.items, action.payload.itemId, (item) => ({
                  ...item,
                  completed: !item.completed,
                })),
              };
            }
            return list;
          }),
        };
      } else {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: list.items.map((item) => {
                  if (item.id === action.payload.itemId) {
                    return {
                      ...item,
                      completed: !item.completed,
                    };
                  }
                  return item;
                }),
              };
            }
            return list;
          }),
        };
      }

    case 'UPDATE_ITEM':
      if (action.payload.parentItemId) {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: updateNestedItems(list.items, action.payload.itemId, (item) => ({
                  ...item,
                  content: action.payload.content,
                  coverImage: action.payload.coverImage,
                })),
              };
            }
            return list;
          }),
        };
      } else {
        return {
          ...state,
          lists: state.lists.map((list) => {
            if (list.id === action.payload.listId) {
              return {
                ...list,
                items: list.items.map((item) => {
                  if (item.id === action.payload.itemId) {
                    return {
                      ...item,
                      content: action.payload.content,
                      coverImage: action.payload.coverImage,
                    };
                  }
                  return item;
                }),
              };
            }
            return list;
          }),
        };
      }

    case 'TOGGLE_VIEW_MODE':
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.listId) {
            return {
              ...list,
              viewMode: list.viewMode === 'list' ? 'cover' : 'list',
            };
          }
          return list;
        }),
      };

  case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.id) {
            return {
              ...list,
              title: action.payload.title,
              icon: action.payload.icon,
              avatar: action.payload.avatar,
              tags: action.payload.tags,
              favorite: action.payload.favorite ?? list.favorite,
              pinned: action.payload.pinned ?? list.pinned,
              color: action.payload.color ?? list.color,
            };
          }
          return list;
        }),
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.id) {
            return {
              ...list,
              favorite: !list.favorite,
            };
          }
          return list;
        }),
      };

    case 'TOGGLE_PINNED':
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.id) {
            return {
              ...list,
              pinned: !list.pinned,
            };
          }
          return list;
        }),
      };
    case 'SET_FILTER_TAG':
      return {
        ...state,
        filterTag: action.payload.tag,
      };

    case 'REORDER_ITEMS':
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.listId) {
            return {
              ...list,
              items: action.payload.items,
            };
          }
          return list;
        }),
      };
    case 'TOGGLE_PRIORITY_ITEM':
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id === action.payload.listId) {
            return {
              ...list,
              items: updateNestedItems(list.items, action.payload.itemId, (item) => ({
                ...item,
                priority: !item.priority,
              })),
            };
          }
          return list;
        }),
      };
    default:
      return state;
  }
};

const loadState = (): AppState => {
  try {
    const savedState = localStorage.getItem('listApp');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return initialState;
};

const ListContext = createContext<ListContextType>({} as ListContextType);

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, loadState());

  useEffect(() => {
    // Não persistir listas temporárias
    const persistentState: AppState = {
      ...state,
      lists: state.lists.filter(l => !l.temporary),
    };
    localStorage.setItem('listApp', JSON.stringify(persistentState));
  }, [state]);

  const addList = (title: string, type: string, icon?: string, avatar?: string, tags?: Tag[], color?: string, temporary: boolean = false) => {
    // Set default icon based on type if icon not provided
    const defaultIcons: Record<string, string> = {
      movies: 'Film',
      shows: 'Tv',
      places: 'MapPin',
      drawings: 'PenTool',
      books: 'Book',
      custom: 'Plus',
      games: 'Gamepad',
      travel: 'Globe',
      music: 'Music',
      photography: 'Camera',
    };
    const iconToUse = icon || defaultIcons[type] || 'Plus';

    dispatch({
      type: 'ADD_LIST',
      payload: { title, type, icon: iconToUse, avatar, tags, color, temporary },
    });
  };

  // New function to add list from template
  const addListFromTemplate = (template: { title: string; type: string; icon?: string; tags?: string[]; items: any[] }) => {
    // Create the list first
    const newListId = generateId();
    const iconToUse = template.icon || 'Plus';

    dispatch({
      type: 'ADD_LIST',
      payload: {
        id: newListId,
        title: template.title,
        type: template.type,
        icon: iconToUse,
        viewMode: 'cover',
        tags: template.tags?.map(tag => ({ id: generateId(), name: tag })) || [],
      },
    });

    // Add items to the new list after a short delay to ensure list is created
    setTimeout(() => {
      template.items.forEach(item => {
        dispatch({
          type: 'ADD_ITEM',
          payload: {
            listId: newListId,
            content: item.content,
            coverImage: item.coverImage,
          },
        });
      });
    }, 100);
  };

  const togglePriorityItem = (listId: string, itemId: string) => {
    dispatch({
      type: 'TOGGLE_PRIORITY_ITEM',
      payload: { listId, itemId },
    });
  };

  const updateList = (id: string, title: string, icon?: string, avatar?: string, tags?: Tag[], favorite?: boolean, pinned?: boolean, color?: string) => {
    dispatch({
      type: 'UPDATE_LIST',
      payload: { id, title, icon, avatar, tags, favorite, pinned, color },
    });
  };

  const deleteList = (id: string) => {
    dispatch({
      type: 'DELETE_LIST',
      payload: { id },
    });
  };

  const setActiveList = (id: string | null) => {
    dispatch({
      type: 'SET_ACTIVE_LIST',
      payload: { id },
    });
  };

  const addItem = (listId: string, content: string, coverImage?: string, parentItemId?: string) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { listId, content, coverImage, parentItemId },
    });
  };

  const deleteItem = (listId: string, itemId: string, parentItemId?: string) => {
    dispatch({
      type: 'DELETE_ITEM',
      payload: { listId, itemId, parentItemId },
    });
  };

  const toggleItem = (listId: string, itemId: string, parentItemId?: string) => {
    dispatch({
      type: 'TOGGLE_ITEM',
      payload: { listId, itemId, parentItemId },
    });
  };

  const updateItem = (listId: string, itemId: string, content: string, coverImage?: string, parentItemId?: string) => {
    dispatch({
      type: 'UPDATE_ITEM',
      payload: { listId, itemId, content, coverImage, parentItemId },
    });
  };

  const reorderItems = (listId: string, items: ListItem[]) => {
    dispatch({
      type: 'REORDER_ITEMS',
      payload: { listId, items },
    });
  };

  const toggleViewMode = (listId: string) => {
    dispatch({ type: 'TOGGLE_VIEW_MODE', payload: { listId } });
  };

  const setFilterTag = (tag: string | null) => {
    dispatch({ type: 'SET_FILTER_TAG', payload: { tag } });
  };

  const getActiveList = () => {
    return state.lists.find((list: List) => list.id === state.activeListId);
  };

  return (
    <ListContext.Provider
      value={{
        state,
        dispatch,
        addList,
        addListFromTemplate,
        deleteList,
        setActiveList,
        addItem,
        deleteItem,
        toggleItem,
        updateItem,
        reorderItems,
        toggleViewMode,
        setFilterTag,
        getActiveList,
        updateList,
        togglePriorityItem,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useListContext = (): ListContextType => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useListContext must be used within a ListProvider');
  }
  return context;
};

export default ListContext;