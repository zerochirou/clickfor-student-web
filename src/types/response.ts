export interface Response<T> {
  data: T;
  errors: string | null;
  message: string | null;
  success: boolean;
}
