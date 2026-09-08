export interface Course {
    id: string;
    title_ar: string;
    title_en: string;
    description_ar: string;
    description_en: string;
    price: number;
    duration: string;
    image?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
    category?: string;
    maxStudents?: number;
    startDate?: string | null;
    endDate?: string | null;
    createdAt: string;
    _count?: { enrollments: number };
  }
  export interface CourseListResponse {
    success: boolean;
    data: {
      courses: Course[];
      pagination: Pagination;
    };
  }
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    pricePaid: number;
    couponUsed?: string;
    enrolledAt: string;
    course?: Partial<Course>;
    user?: { firstName: string; lastName: string; email: string };
  }
  export interface Wishlist {
    id: string;
    userId: string;
    courseId: string;
    createdAt: string;
    course?: Course;
  }
  export interface Coupon {
    id: string;
    code: string;
    discount: number;
    type: 'PERCENTAGE' | 'FIXED';
    maxUses?: number;
    usedCount: number;
    expiresAt?: string;
    isActive: boolean;
    createdAt: string;
    _count?: { usages: number };
  }
export interface CouponValidation {
    coupon?: Pick<Coupon, 'id' | 'code' | 'discount' | 'type'>;
    id?: string;
    code?: string;
    type: Coupon['type'];
    discount: number;
    originalPrice: number;
    discountAmount: string;
    finalPrice: string;
  }
  export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    errorCode?: string;
    data?: T;
  }
