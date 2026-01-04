// 友情链接相关类型定义

/**
 * 友情链接分类接口
 */
export interface FriendLinkCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 友情链接状态枚举
 */
export type FriendLinkStatus = "active" | "error" | "lost";

/**
 * 友情链接接口
 */
export interface FriendLink {
  id: number;
  name: string;
  url: string;
  description?: string;
  avatar?: string;
  status: FriendLinkStatus;
  category_code: string;
  added_date: string;
  sort_order: number;
  is_featured: boolean;
  click_count: number;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 包含RSS字段的友情链接接口
 */
export interface FriendLinkWithRSS extends FriendLink {
  rss_url?: string;
  extension_field_1?: string;
  extension_field_2?: string;
  last_rss_fetch_at?: string;
  rss_fetch_status?: "success" | "error" | "pending";
}

/**
 * 友情链接与分类的联合查询结果
 */
export interface FriendLinkWithCategory extends FriendLink {
  category: FriendLinkCategory;
}

/**
 * 友情链接查询参数
 */
export interface FriendLinkQueryParams {
  category_code?: string;
  status?: FriendLinkStatus;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
  order_by?: "sort_order" | "added_date" | "name" | "click_count";
  order_direction?: "asc" | "desc";
}

/**
 * 友情链接统计信息
 */
export interface FriendLinkStats {
  total_count: number;
  active_count: number;
  error_count: number;
  lost_count: number;
  category_counts: Record<string, number>;
}

/**
 * 创建友情链接的输入数据
 */
export interface CreateFriendLinkInput {
  name: string;
  url: string;
  description?: string;
  avatar?: string;
  category_code: string;
  is_featured?: boolean;
  sort_order?: number;
}

/**
 * 更新友情链接的输入数据
 */
export interface UpdateFriendLinkInput {
  name?: string;
  url?: string;
  description?: string;
  avatar?: string;
  status?: FriendLinkStatus;
  category_code?: string;
  is_featured?: boolean;
  sort_order?: number;
}

/**
 * 友情链接 API 响应
 */
export interface FriendLinkResponse {
  data: FriendLink[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 友情链接分类 API 响应
 */
export interface FriendLinkCategoryResponse {
  data: FriendLinkCategory[];
  total: number;
}

// RSS相关类型定义

/**
 * RSS文章数据库存储结构
 */
export interface RSSArticleDB {
  id: number;
  friend_link_id: number;
  title: string;
  link: string;
  description?: string;
  pub_date: string;
  guid: string;
  author?: string;
  categories?: string[];
  content_hash: string;
  created_at: string;
  updated_at: string;
}

/**
 * 前端展示用的RSS文章数据结构
 */
export interface RSSArticleWithSource {
  id: number;
  title: string;
  link: string;
  description?: string;
  pub_date: string;
  guid: string;
  author?: string;
  categories?: string[];
  source: {
    id: number;
    name: string;
    url: string;
    avatar?: string;
    category_code: string;
  };
  created_at: string;
}

/**
 * RSS文章查询参数
 */
export interface RSSArticleQueryParams {
  limit?: number;
  offset?: number;
  friend_link_ids?: number[];
  category_codes?: string[];
  search_keyword?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "pub_date" | "created_at" | "title";
  sort_order?: "asc" | "desc";
}

/**
 * RSS统计信息
 */
export interface RSSStats {
  total_count: number;
  recent_count: number;
  source_counts: Record<number, number>;
}

/**
 * RSS页面状态管理
 */
export interface RSSPageState {
  articles: RSSArticleWithSource[];
  friendLinks: FriendLinkWithRSS[];
  loading: boolean;
  error: string | null;
  filters: {
    selectedSources: number[];
    selectedCategories: string[];
    searchKeyword: string;
    dateRange: {
      from?: string;
      to?: string;
    };
    sortBy: "pub_date" | "created_at" | "title";
    sortOrder: "asc" | "desc";
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };
  stats: RSSStats;
}
