import { List, ListItem } from '../types';

export interface ListTemplate {
  title: string;
  type: string;
  icon?: string;
  tags?: string[];
  items: Array<{
    content: string;
    coverImage?: string;
    children?: ListItem[];
  }>;
}

export const listTemplates: ListTemplate[] = [
  {
    title: 'Filmes Favoritos',
    type: 'movies',
    icon: 'Film',
    tags: ['favoritos', 'filmes'],
    items: [
      { content: 'O Poderoso Chefão', coverImage: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg' },
      { content: 'Clube da Luta', coverImage: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg' },
      { content: 'Matrix', coverImage: 'https://m.media-amazon.com/images/I/51EG732BV3L.jpg' },
    ],
  },
  {
    title: 'Livros para Ler',
    type: 'books',
    icon: 'Book',
    tags: ['leitura', 'livros'],
    items: [
      { content: '1984 - George Orwell', coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg' },
      { content: 'Harry Potter and the Sorcerer\'s Stone - J.K. Rowling', coverImage: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Harry_Potter_and_the_Philosopher%27s_Stone_Book_Cover.jpg' },
      { content: 'O Senhor dos Anéis - J.R.R. Tolkien', coverImage: 'https://images-na.ssl-images-amazon.com/images/I/51EstVXM1UL._SX331_BO1,204,203,200_.jpg' },
    ],
  },
  {
    title: 'Jogos para Jogar',
    type: 'games',
    icon: 'Gamepad',
    tags: ['jogos', 'diversão'],
    items: [
      { content: 'Super Mario Bros.', coverImage: 'https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png' },
      { content: 'The Witcher 3', coverImage: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg' },
      { content: 'Portal 2', coverImage: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Portal2cover.jpg' },
    ],
  },
];
