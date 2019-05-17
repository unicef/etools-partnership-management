export interface ListQueryParams {
  size?: number;
  sort?: string;
  page?: number;
  [key: string]: any;
}

export interface Route {
  prefix: string;
  path: string;
  __queryParams: ListQueryParams;
}


