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
}

export interface AppState {
  lists: List[];
  activeListId: string | null;
  filterTag?: string | null;
}
