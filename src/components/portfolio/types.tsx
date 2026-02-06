export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  type: 'Personal Project' | 'Academic Project' | 'Internship';
  imageUrl?: string;
  logoUrl?: string;
  themeColor?: string;
  logoBackgroundColor?: string;
  category?: string[];
  tags?: string[];
  date?: string;
  AIUsed?: string;
}