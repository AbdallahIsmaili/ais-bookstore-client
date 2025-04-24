export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  publication_year: number;
  genre0: string;
  genre1: string;
  cover_image: string;
  isAvailable: boolean;
  borrowedDate?: string;
  dueDate?: string; 
  loanId?: string; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  borrowedBooks: string[];
}
