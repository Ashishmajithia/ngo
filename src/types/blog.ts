export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  images?: string[]; // Multiple gallery images for the blog
  author: string;
  date: string;
  category: 'Education' | 'Healthcare' | 'Women Empowerment' | 'Nutrition' | 'Community Event';
  published: boolean;
}
