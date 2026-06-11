import type { ReurbProcess } from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('urbanus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function listProcesses(): Promise<ReurbProcess[]> {
  const response = await fetch('/api/processes', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to load processes.');
  }

  const data = await response.json();
  return data.items ?? [];
}

export async function createProcess(processData: ReurbProcess): Promise<ReurbProcess> {
  const response = await fetch('/api/processes', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(processData),
  });

  if (!response.ok) {
    throw new Error('Failed to create process.');
  }

  return response.json();
}

export async function updateProcess(id: string, processData: ReurbProcess): Promise<ReurbProcess> {
  const response = await fetch(`/api/processes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(processData),
  });

  if (!response.ok) {
    throw new Error('Failed to update process.');
  }

  return response.json();
}

export async function deleteProcess(id: string): Promise<void> {
  const response = await fetch(`/api/processes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete process.');
  }
}
