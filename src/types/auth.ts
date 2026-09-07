export type UserRole = 'teacher' | 'parent';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone_number: string;
  role: UserRole;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
}
