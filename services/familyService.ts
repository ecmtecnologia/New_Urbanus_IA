export interface FamilyMemberPayload {
  id?: string;
  name: string;
  relation: string;
  cpf?: string;
  birth_date?: string;
}

export interface OccupantContactPayload {
  id?: string;
  phone?: string;
  email?: string;
  is_primary?: boolean;
}

export interface OccupantDocumentPayload {
  id?: string;
  document_type: string;
  document_number?: string;
  file_name?: string;
  file_url?: string;
  ged_document_id?: string;
  ged_status?: string;
  ged_current_version?: number;
}

export interface OccupantGedVersionUploadPayload {
  ged_document_id: string;
  ged_status: string;
  ged_current_version: number;
  file_name: string;
  file_url: string;
}

export interface OccupantGedDocumentPayload {
  id: string;
  process_id?: string;
  title: string;
  category: string;
  document_type: string;
  file_name: string;
  file_hash: string;
  status: string;
  current_version: number;
  versions_count: number;
  created_at: string;
}

export interface OccupantGedDocumentVersionPayload {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  file_hash: string;
  created_at: string;
  file_url?: string;
}

export interface OccupantAddressPayload {
  id?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  zip_code?: string;
  city?: string;
  state?: string;
}

export interface OccupantPayload {
  id?: string;
  process_id?: string;
  property_id?: string;
  name: string;
  cpf: string;
  rg?: string;
  birth_date?: string;
  civil_status?: string;
  monthly_income?: number;
  nis_number?: string;
  profession?: string;
  education_level?: string;
  family_members_count?: number;
  spouse_data?: unknown;
  phone?: string;
  email?: string;
  signature_data?: string;
  members?: FamilyMemberPayload[];
  contacts?: OccupantContactPayload[];
  documents?: OccupantDocumentPayload[];
  address?: OccupantAddressPayload;
}

const getToken = () => localStorage.getItem('urbanus_token');

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? message;
    } catch {
      // ignore JSON parse error and keep fallback message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function listOccupants(filters?: { property_id?: string; process_id?: string }): Promise<OccupantPayload[]> {
  const params = new URLSearchParams();
  if (filters?.property_id) params.set('property_id', filters.property_id);
  if (filters?.process_id) params.set('process_id', filters.process_id);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const data = await request<{ items: OccupantPayload[] }>(`/api/families/occupants${suffix}`);
  return data.items ?? [];
}

export async function createOccupant(payload: OccupantPayload): Promise<OccupantPayload> {
  return request<OccupantPayload>('/api/families/occupants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateOccupant(id: string, payload: OccupantPayload): Promise<OccupantPayload> {
  return request<OccupantPayload>(`/api/families/occupants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteOccupant(id: string): Promise<void> {
  await request<void>(`/api/families/occupants/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadOccupantDocument(
  occupantId: string,
  file: File,
  metadata: { document_type: string; document_number?: string }
): Promise<OccupantDocumentPayload> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', metadata.document_type);
  if (metadata.document_number) {
    formData.append('document_number', metadata.document_number);
  }

  const response = await fetch(`/api/families/occupants/${occupantId}/documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = `Upload failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? message;
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  return response.json() as Promise<OccupantDocumentPayload>;
}

export async function listOccupantGedDocuments(occupantId: string): Promise<OccupantGedDocumentPayload[]> {
  const data = await request<{ items: OccupantGedDocumentPayload[] }>(`/api/families/occupants/${occupantId}/ged-documents`);
  return data.items ?? [];
}

export async function uploadOccupantGedDocumentVersion(
  occupantId: string,
  gedDocumentId: string,
  file: File
): Promise<OccupantGedVersionUploadPayload> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/families/occupants/${occupantId}/ged-documents/${gedDocumentId}/version`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = `Version upload failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? message;
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  return response.json() as Promise<OccupantGedVersionUploadPayload>;
}

export async function listOccupantGedDocumentVersions(
  occupantId: string,
  gedDocumentId: string
): Promise<OccupantGedDocumentVersionPayload[]> {
  const data = await request<{ items: OccupantGedDocumentVersionPayload[] }>(
    `/api/families/occupants/${occupantId}/ged-documents/${gedDocumentId}/versions`
  );
  return data.items ?? [];
}
