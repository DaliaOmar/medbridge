import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Med Bridge Academy - Medical Training Platform',
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/course-list/course-list.component').then(m => m.CourseListComponent),
    title: 'Courses | Med Bridge Academy',
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
    title: 'Course Details | Med Bridge Academy',
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Login | Med Bridge Academy',
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Register | Med Bridge Academy',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'my-courses',
        pathMatch: 'full',
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./features/dashboard/my-courses/my-courses.component').then(m => m.MyCoursesComponent),
        title: 'My Courses | Med Bridge Academy',
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./features/dashboard/wishlist/wishlist.component').then(m => m.WishlistComponent),
        title: 'My Wishlist | Med Bridge Academy',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/dashboard/profile/profile.component').then(m => m.ProfileComponent),
        title: 'My Profile | Med Bridge Academy',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () => import('./features/admin/overview/admin-overview.component').then(m => m.AdminOverviewComponent),
        title: 'Dashboard | Admin',
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/admin/courses/admin-courses.component').then(m => m.AdminCoursesComponent),
        title: 'Courses Management | Admin',
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
        title: 'Users Management | Admin',
      },
      {
        path: 'enrollments',
        loadComponent: () => import('./features/admin/enrollments/admin-enrollments.component').then(m => m.AdminEnrollmentsComponent),
        title: 'Enrollments | Admin',
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/admin/coupons/admin-coupons.component').then(m => m.AdminCouponsComponent),
        title: 'Coupons | Admin',
      },
      {
        path: 'academy-settings',
        loadComponent: () => import('./features/admin/academy-settings/academy-settings.component').then(m => m.AcademySettingsComponent),
        title: 'Academy Information | Admin',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 | Med Bridge Academy',
  },
];
