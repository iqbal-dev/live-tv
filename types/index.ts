export interface Channel {
  _id?: string;
  id?: string;
  name: string;
  logo: string;
  category: string;
  url: string;
  country?: string;
  language?: string;
  order?: number;
  isActive?: boolean;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  genre: string;
}

export interface AdminCategory {
  _id: string;
  name: string;
  icon: string;
  order: number;
  channelCount?: number;
}

export type ViewMode = 'grid' | 'list';
