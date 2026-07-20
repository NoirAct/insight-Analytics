export type ReportOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  source: string;
  itemsCount: number;
  createdAt: string;
};

export type ReportSortBy =
  | "createdAt"
  | "total"
  | "customerName"
  | "status"
  | "source";

export type ReportsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: ReportSortBy;
  sortDir?: "asc" | "desc";
};

export type ReportsListResponse = {
  data: ReportOrder[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
