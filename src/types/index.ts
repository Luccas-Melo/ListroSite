export interface Tag {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface ListItem {
  id: string;
  content: string;
  coverImage?: string;
  completed: boolean;
  createdAt: number;
  children?: ListItem[];
  priority?: boolean;
  listColor?: string; // cor personalizada da lista para o item
}

export interface List {
  id: string;
  title: string;
  type: string;
  icon?: string;
  avatar?: string;
  items: ListItem[];
  createdAt: number;
  viewMode: 'list' | 'cover';
  favorite?: boolean;
  pinned?: boolean;
  tags?: Tag[];
  color?: string; // cor personalizada da lista
}

export interface AppState {
  lists: List[];
  activeListId: string | null;
  filterTag?: string | null;
}
export interface ListType {
  id: string;
  title: string;
  pinned: boolean;
  favorite?: boolean;
  items?: { completed: boolean }[];
  icon?: string;
  avatar?: string;
  tags?: { id: string; name: string }[];
  type?: string;
}