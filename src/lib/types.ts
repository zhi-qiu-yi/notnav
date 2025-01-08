// 链接类型
export interface Link {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  lanlink: string;
  createdTime: string;
}

// 数据库信息类型
export interface DatabaseInfo {
  icon?: string;
  cover?: string;
  title: string;
}

// 分类排序类型
export interface CategoryOrder {
  [key: string]: number;
} 