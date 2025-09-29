import { create } from 'zustand'
import { User, UserRole } from '../types'

/**
 * 用户状态接口
 */
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * 应用状态接口
 */
interface AppState {
  sidebarCollapsed: boolean;
  currentModule: string;
  breadcrumbs: { title: string; path?: string }[];
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentModule: (module: string) => void;
  setBreadcrumbs: (breadcrumbs: { title: string; path?: string }[]) => void;
}

/**
 * 用户状态管理
 */
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  }))
}))

/**
 * 应用状态管理
 */
export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentModule: 'dashboard',
  breadcrumbs: [{ title: '首页' }],
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentModule: (module) => set({ currentModule: module }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs })
}))

/**
 * 模拟用户数据
 */
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    department: '信息技术部',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'receiver',
    name: '张接样',
    email: 'receiver@example.com',
    role: UserRole.SAMPLE_RECEIVER,
    department: '样本管理部',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    username: 'technician',
    name: '李实验',
    email: 'technician@example.com',
    role: UserRole.LAB_TECHNICIAN,
    department: '实验室',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    username: 'analyst',
    name: '王分析',
    email: 'analyst@example.com',
    role: UserRole.ANALYST,
    department: '生信分析部',
    avatar: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

/**
 * 模拟登录函数
 * @param username 用户名
 * @param password 密码
 * @returns Promise<User | null>
 */
export const mockLogin = async (username: string, password: string): Promise<User | null> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 简单的用户名密码验证
  if (password === '123456') {
    const user = mockUsers.find(u => u.username === username)
    return user || null
  }
  
  return null
}