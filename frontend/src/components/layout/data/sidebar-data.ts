import {
  LayoutDashboard,
  BarChart3,
  Eye,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '部门业务',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: '部门业务工具',
      logo: BarChart3,
      plan: '内部工具平台',
    },
  ],
  navGroups: [
    {
      title: '',
      items: [
        {
          title: '首页',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '竞品分析',
          url: '/bidding',
          icon: BarChart3,
        },
        {
          title: '价格监控',
          url: '/price/monitor',
          icon: Eye,
        },
      ],
    },
  ],
}
