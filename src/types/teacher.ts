import type { Profile } from './auth';

export type TeachingMode = 'online' | 'face_to_face';
export type CategoryGroup = 'academic' | 'special';
export type DiplomaStatus = 'pending' | 'approved' | 'rejected';
export type DiplomaType = 'diploma' | 'certificate';

export interface Teacher {
  profile_id: string;
  bio: string;
  major: string;
  university: string;
  phone_number: string;
  email: string;
  hourly_rate: number;
  video_url: string | null;
  diploma_url: string | null;
  diploma_status: DiplomaStatus;
  diploma_type: DiplomaType;
  subscription_status: boolean;
  is_verified: boolean;
  view_count: number;
  contact_count: number;
  offers_trial: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherMode {
  mode: TeachingMode;
}

export interface TeacherLocation {
  id: number;
  city: string;
  district: string;
}

export interface Category {
  id: number;
  name: string;
  group_type: CategoryGroup;
  display_order: number;
}

export interface Tag {
  id: number;
  name: string;
  display_order: number;
}

export interface TeacherWithDetails {
  profile_id: string;
  bio: string;
  major: string;
  university: string;
  phone_number: string;
  email: string;
  hourly_rate: number;
  video_url: string | null;
  diploma_url: string | null;
  diploma_status: DiplomaStatus;
  diploma_type: DiplomaType;
  subscription_status: boolean;
  is_verified: boolean;
  view_count: number;
  contact_count: number;
  avg_rating: number;
  review_count: number;
  experience_years: number;
  offers_trial: boolean;
  show_diploma: boolean;
  profile: Profile;
  modes: TeacherMode[];
  locations: TeacherLocation[];
  categories: { category: Category }[];
  tags: { tag: Tag }[];
}

export interface TeacherFilters {
  search: string;
  categoryIds: number[];
  majors: string[];
  modes: TeachingMode[];
  city: string;
  tagIds: number[];
  priceSort: 'asc' | 'desc' | ''; // '' = no sort, 'asc' = low to high, 'desc' = high to low
  priceMin: number | null;
  priceMax: number | null;
  isVerified: boolean;
  hasVideo: boolean;
  minExperience: number | null;
}
