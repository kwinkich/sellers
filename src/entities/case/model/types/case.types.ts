export interface Case {
  id: number;
  title: string;
  recommendedSellerLevel: string;
  situation: string;
  sellerLegend: string;
  buyerLegend: string;
  sellerTask: string;
  buyerTask: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface CaseListItem {
  id: number;
  title: string;
  recommendedSellerLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseOption {
  id: number;
  title: string;
}

export interface CreateCaseRequest {
  title: string;
  recommendedSellerLevel: string;
  situation: string;
  sellerLegend: string;
  buyerLegend: string;
  sellerTask: string;
  buyerTask: string;
}

export interface UpdateCaseRequest {
  title?: string;
  recommendedSellerLevel?: string;
  situation?: string;
  sellerLegend?: string;
  buyerLegend?: string;
  sellerTask?: string;
  buyerTask?: string;
}

export interface GetCasesParams {
  limit?: number;
  page?: number;
  by?: "id" | "title" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  title?: string;
  createdByUserId?: number;
  recommendedSellerLevel?: string;
}

export interface GetCaseOptionsParams {
  q?: string;
  limit?: number;
}
