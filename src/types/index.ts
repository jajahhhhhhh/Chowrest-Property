export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'agent' | 'buyer' | 'admin'
  created_at: string
}

export type PropertyType = 'house' | 'condo' | 'villa' | 'land' | 'commercial'
export type PropertyStatus = 'for_sale' | 'for_rent' | 'off_market' | 'sold' | 'rented'

export interface Property {
  id: string
  agent_id: string
  title: string
  description: string
  type: PropertyType
  status: PropertyStatus
  price: number
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  address: string
  city: string
  province: string
  country: string
  lat?: number | null
  lng?: number | null
  featured: boolean
  images: string[]
  amenities: string[]
  created_at: string
  updated_at: string
  profiles?: { full_name: string | null; avatar_url: string | null; phone: string | null }
}

export interface PropertyFormData {
  title: string
  description: string
  type: PropertyType
  status: PropertyStatus
  price: string
  bedrooms: string
  bathrooms: string
  area_sqm: string
  address: string
  city: string
  province: string
  images: string[]
  amenities: string[]
}

export interface PropertyFilters {
  search: string
  type: string
  status: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  city: string
}
