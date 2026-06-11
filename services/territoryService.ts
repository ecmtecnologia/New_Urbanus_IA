export interface Zone {
  id: string;
  name: string;
  type: 'ZEIS' | 'ZR' | 'ZC' | 'ZUE' | 'RURAL';
  description?: string;
  min_lot_area_sqm?: number;
  max_height_meters?: number;
  created_at?: string;
}

export interface Sector {
  id: string;
  zone_id: string;
  name: string;
  responsible_tech_id?: string;
  created_at?: string;
}

export interface Block {
  id: string;
  sector_id: string;
  designation: string;
  registry_number?: string;
  total_area_sqm?: number;
}

export interface Property {
  id: string;
  block_id?: string;
  cadastral_code: string;
  address_street?: string;
  address_number?: string;
  address_zip?: string;
  area_sqm: number;
  status: string;
  created_at?: string;
}

const getToken = () => localStorage.getItem('urbanus_token');

export async function listZones(): Promise<Zone[]> {
  const response = await fetch('/api/territory/zones', {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to list zones: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
}

export async function createZone(zone: Omit<Zone, 'id' | 'created_at'>): Promise<Zone> {
  const response = await fetch('/api/territory/zones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(zone),
  });
  if (!response.ok) throw new Error(`Failed to create zone: ${response.statusText}`);
  return response.json();
}

export async function updateZone(id: string, zone: Partial<Zone>): Promise<Zone> {
  const response = await fetch(`/api/territory/zones/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(zone),
  });
  if (!response.ok) throw new Error(`Failed to update zone: ${response.statusText}`);
  return response.json();
}

export async function deleteZone(id: string): Promise<void> {
  const response = await fetch(`/api/territory/zones/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to delete zone: ${response.statusText}`);
}

export async function listSectors(): Promise<Sector[]> {
  const response = await fetch('/api/territory/sectors', {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to list sectors: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
}

export async function createSector(sector: Omit<Sector, 'id' | 'created_at'>): Promise<Sector> {
  const response = await fetch('/api/territory/sectors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(sector),
  });
  if (!response.ok) throw new Error(`Failed to create sector: ${response.statusText}`);
  return response.json();
}

export async function listBlocks(): Promise<Block[]> {
  const response = await fetch('/api/territory/blocks', {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to list blocks: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
}

export async function createBlock(block: Omit<Block, 'id'>): Promise<Block> {
  const response = await fetch('/api/territory/blocks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(block),
  });
  if (!response.ok) throw new Error(`Failed to create block: ${response.statusText}`);
  return response.json();
}

export async function listProperties(): Promise<Property[]> {
  const response = await fetch('/api/territory/properties', {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to list properties: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
}

export async function createProperty(property: Omit<Property, 'id' | 'created_at'>): Promise<Property> {
  const response = await fetch('/api/territory/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(property),
  });
  if (!response.ok) throw new Error(`Failed to create property: ${response.statusText}`);
  return response.json();
}

export async function deleteProperty(id: string): Promise<void> {
  const response = await fetch(`/api/territory/properties/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to delete property: ${response.statusText}`);
}
