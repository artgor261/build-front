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
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, file.fileName);

    const res = await fetch(`${BASE_URL}/recognize`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Failed to recognize: ${res.status}`);
    }
    return res.json();
  }

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.fileName,
  } as any);

  return new Promise<RecognizeResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/recognize`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Failed to recognize: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}
