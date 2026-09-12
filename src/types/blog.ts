export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  date: string;
  category: 'Education' | 'Healthcare' | 'Women Empowerment' | 'Nutrition' | 'Community Event';
  published: boolean;
}
