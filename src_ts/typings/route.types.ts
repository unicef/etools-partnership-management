export type ListQueryParams = {
  size?: number,
  sort?: string,
  page?: number,
  [key: string] : any
}

export type Route = {
  prefix: string,
  path: string,
  __queryParams: ListQueryParams
}


