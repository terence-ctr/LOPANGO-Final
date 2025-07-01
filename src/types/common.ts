// Types utilitaires communs

export type WithId<T> = T & {
  id: string;
};

export type WithTimestamps = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SortDirection = 'asc' | 'desc';

export type SortOption = {
  field: string;
  direction: SortDirection;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: SortOption[];
  search?: string;
  [key: string]: any; // Pour les filtres supplémentaires
};

export type ApiError = {
  message: string;
  code?: string | number;
  statusCode?: number;
  errors?: Record<string, string[]>;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type WithLoading<T> = T & {
  isLoading?: boolean;
  error?: Error | null;
};
