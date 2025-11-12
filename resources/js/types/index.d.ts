import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    profile?: UserProfile;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface UserProfile {
    id: number;
    user_id: number;
    // Datos físicos básicos
    height?: number; // cm
    weight?: number; // kg
    age?: number;
    gender?: 'male' | 'female' | 'other';
    activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

    // Contextura y composición corporal
    body_frame?: 'small' | 'medium' | 'large';
    body_type?: 'ectomorph' | 'mesomorph' | 'endomorph';
    wrist_circumference?: number; // cm
    waist_circumference?: number; // cm
    hip_circumference?: number; // cm
    neck_circumference?: number; // cm
    body_fat_percentage?: number; // %
    muscle_mass_percentage?: number; // %

    // Objetivos nutricionales
    daily_calorie_goal?: number;
    protein_goal?: number; // g
    carbs_goal?: number; // g
    fat_goal?: number; // g
    water_goal?: number; // ml

    // Objetivos de peso
    target_weight?: number; // kg
    target_date?: string;

    // Información médica
    medical_conditions?: string;
    dietary_restrictions?: string;
    is_medically_supervised?: boolean;

    created_at: string;
    updated_at: string;
}

export interface BodyComposition {
    body_frame?: string;
    body_frame_description?: string;
    body_type?: string;
    body_type_description?: string;
    body_fat_percentage?: number;
    body_fat_category?: string;
    waist_to_hip_ratio?: number;
    whr_category?: string;
    ideal_weight_range?: {
        min: number;
        max: number;
        frame: string;
    };
}

export interface ProfileData {
    profile: UserProfile;
    bmi?: number;
    bmi_category?: string;
    bmr?: number;
    tdee?: number;
    body_composition?: BodyComposition;
}
