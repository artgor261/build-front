export interface ObjectResponse {
  id: number;
  name: string;
  description?: string;
  address?: string;
  year_built?: number | null;
  architect?: string;
  style?: string;
  latitude?: number;
  longitude?: number;
  image_base64?: string;
}

export interface RecognizeResponse {
  class_name: string;
  object?: ObjectResponse | null;
}
