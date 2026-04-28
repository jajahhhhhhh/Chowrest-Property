import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { DEMO_PROPERTIES } from '@/lib/demoData'
import { fetchPropertiesFromAirtable, createPropertyInAirtable } from '@/lib/airtable'
import type { Property, PropertyFilters, PropertyFormData } from '@/types'

interface PropertyState {
  properties: Property[]
  featured: Property[]
  current: Property | null
  loading: boolean
  error: string | null
  filters: PropertyFilters
  fetchProperties: () => Promise<void>
  fetchFeatured: () => Promise<void>
  fetchById: (id: string) => Promise<void>
  fetchByAgent: (agentId: string) => Promise<void>
  createProperty: (data: PropertyFormData, agentId: string) => Promise<string | null>
  updateProperty: (id: string, data: Partial<PropertyFormData>) => Promise<string | null>
  deleteProperty: (id: string) => Promise<string | null>
  setFilters: (filters: Partial<PropertyFilters>) => void
  getFiltered: () => Property[]
}

const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  type: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  city: '',
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  featured: [],
  current: null,
  loading: false,
  error: null,
  filters: DEFAULT_FILTERS,

  fetchProperties: async () => {
    set({ loading: true, error: null })
    try {
      // Primary source: Airtable
      const properties = await fetchPropertiesFromAirtable()
      set({ properties })
    } catch {
      // Fallback to demo data
      set({ properties: DEMO_PROPERTIES })
    } finally {
      set({ loading: false })
    }
  },

  fetchFeatured: async () => {
    try {
      // Get all properties from Airtable and mark high-value ones as featured
      const properties = await fetchPropertiesFromAirtable()
      // Feature properties with price > 5M or villas
      const featured = properties
        .filter(p => (p.price > 5000000 || p.type === 'villa') && p.status === 'for_sale')
        .slice(0, 6)
      set({ featured })
    } catch {
      set({ featured: DEMO_PROPERTIES.filter(p => p.featured) })
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true })
    try {
      const properties = await fetchPropertiesFromAirtable()
      const property = properties.find(p => p.id === id) ?? null
      set({ current: property })
    } catch {
      const demo = DEMO_PROPERTIES.find(p => p.id === id) ?? null
      set({ current: demo })
    } finally {
      set({ loading: false })
    }
  },

  fetchByAgent: async (agentId: string) => {
    set({ loading: true })
    try {
      // For now, agents can only see demo properties
      // In production, you'd query a separate agent_listings table in Airtable
      const agentListings = DEMO_PROPERTIES.filter(p => p.agent_id === agentId)
      set({ properties: agentListings })
    } catch {
      set({ properties: DEMO_PROPERTIES })
    } finally {
      set({ loading: false })
    }
  },

  createProperty: async (formData, _agentId) => {
    try {
      // Transform form data to Property format
      const property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'agent_id' | 'profiles'> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        country: 'Thailand',
        lat: null,
        lng: null,
        featured: false,
        images: formData.images,
        amenities: formData.amenities,
      }
      
      // Create in Airtable
      await createPropertyInAirtable(property)
      
      // Refresh all properties
      await get().fetchProperties()
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Failed to create property.'
    }
  },

  updateProperty: async (id, data) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) return error.message
      return null
    } catch {
      return 'Failed to update property.'
    }
  },

  deleteProperty: async (id) => {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) return error.message
      set(state => ({ properties: state.properties.filter(p => p.id !== id) }))
      return null
    } catch {
      return 'Failed to delete property.'
    }
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }))
  },

  getFiltered: () => {
    const { properties, filters } = get()
    return properties.filter(p => {
      if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !p.city?.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.type && p.type !== filters.type) return false
      if (filters.status && p.status !== filters.status) return false
      if (filters.minPrice && p.price < parseFloat(filters.minPrice)) return false
      if (filters.maxPrice && p.price > parseFloat(filters.maxPrice)) return false
      if (filters.bedrooms && (p.bedrooms ?? 0) < parseInt(filters.bedrooms)) return false
      if (filters.city && !p.city?.toLowerCase().includes(filters.city.toLowerCase())) return false
      return true
    })
  },
}))
