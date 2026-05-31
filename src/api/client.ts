import { Platform } from 'react-native';

import { ObjectResponse, RecognizeResponse } from './types';

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8000'
  : 'http://192.168.93.51:8000';

export async function fetchObjects(): Promise<ObjectResponse[]> {
  const response = await fetch(`${BASE_URL}/objects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch objects: ${response.status}`);
  }
  return response.json();
}

export async function fetchObjectById(id: number): Promise<ObjectResponse> {
  const response = await fetch(`${BASE_URL}/objects/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch object: ${response.status}`);
  }
  return response.json();
}

export async function recognizeImage(file: {
  uri: string;
  type: string;
  fileName: string;
}): Promise<RecognizeResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.fileName,
  } as any);

  const response = await fetch(`${BASE_URL}/recognize`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to recognize: ${response.status}`);
  }
  return response.json();
}
