// خدمة النظرة الشاملة للمشرف
import { API_BASE_URL, getApiHeaders } from './authService';

// واجهات البيانات الشاملة
export interface ComprehensiveGroup {
  id: number;
  name: string;
  description: string;
  status: string;
  teacher: any;
  students: any[];
  students_count: number;
}

export interface ComprehensiveTeacher {
  id: number;
  name: string;
  phone: string;
  job_title: string;
  task_type: string;
  work_time: string;
  evaluation: string;
  start_date: string;
}

export interface ComprehensiveCircle {
  id: number;
  name: string;
  type: string;
  status: string;
  time_period: string;
  teachers: ComprehensiveTeacher[];
  groups: ComprehensiveGroup[];
  students: any[];
  circle_summary: {
    teachers_count: number;
    groups_count: number;
    students_count: number;
  };
}

export interface ComprehensiveMosque {
  mosque: {
    id: number;
    name: string;
    neighborhood: string;
    contact_number: string | null;
  };
  circles: ComprehensiveCircle[];
  mosque_summary: {
    circles_count: number;
    groups_count: number;
    teachers_count: number;
    students_count: number;
  };
}

export interface ComprehensiveOverview {
  supervisor: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  mosques: ComprehensiveMosque[];
  summary: {
    total_mosques: number;
    total_circles: number;
    total_groups: number;
    total_teachers: number;
    total_students: number;
  };
}

export interface ComprehensiveResponse {
  success: boolean;
  message: string;
  data: ComprehensiveOverview;
}

/**
 * جلب النظرة الشاملة للمشرف
 */
export const getComprehensiveOverview = async (supervisorId: number, token?: string): Promise<ComprehensiveOverview | null> => {
  try {
    console.log('🚀 جلب النظرة الشاملة للمشرف:', supervisorId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisor/comprehensive-overview?supervisor_id=${supervisorId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب النظرة الشاملة: ${response.status}`);
      return null;
    }

    const data: ComprehensiveResponse = await response.json();
    console.log('✅ نجح جلب النظرة الشاملة:', data);
    
    if (data.success && data.data) {
      return data.data;
    }

    return null;

  } catch (error) {
    console.error('❌ خطأ في جلب النظرة الشاملة:', error);
    return null;
  }
};

export default {
  getComprehensiveOverview
};
