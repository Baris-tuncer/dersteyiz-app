// Super Features type definitions

export interface TeacherBoost {
  id: string;
  teacher_id: string;
  boosted_at: string;
  expires_at: string;
  created_at: string;
}

export interface Review {
  id: string;
  teacher_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface TeacherAvailability {
  id: number;
  teacher_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;  // "HH:MM:SS"
  end_time: string;    // "HH:MM:SS"
}

export type TrialRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TrialRequest {
  id: string;
  teacher_id: string;
  parent_id: string;
  status: TrialRequestStatus;
  message: string;
  teacher_note: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  parent?: {
    full_name: string;
    avatar_url: string | null;
  };
  teacher?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  note: string;
  remind_at: string;
  notified_2h: boolean;
  notified_1h: boolean;
  created_at: string;
}

export interface ViewerProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  viewed_at: string;
  city?: string;
}

export interface HourlyViewCount {
  hour: number;
  count: number;
}

export interface CityViewCount {
  city: string;
  count: number;
}

export interface ContactProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  contacted_at: string;
}

export interface AnalyticsData {
  viewers: ViewerProfile[];
  hourlyViews: HourlyViewCount[];
  cityViews: CityViewCount[];
  contacts: ContactProfile[];
  totalViews: number;
  totalContacts: number;
}
