import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { DEMO_PROPERTIES } from '@/lib/demoData'
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
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles(full_name, avatar_url, phone)')
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ properties: (data as Property[]) ?? [] })
    } catch {
      // Fallback to demo data
      set({ properties: DEMO_PROPERTIES })
    } finally {
      set({ loading: false })
    }
  },

  fetchFeatured: async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles(full_name, avatar_url, phone)')
        .eq('featured', true)
        .limit(6)
      if (error) throw error
      set({ featured: (data as Property[]) ?? [] })
    } catch {
      set({ featured: DEMO_PROPERTIES.filter(p => p.featured) })
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles(full_name, avatar_url, phone)')
        .eq('id', id)
        .single()
      if (error) throw error
      set({ current: data as Property })
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
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ properties: (data as Property[]) ?? [] })
    } catch {
      set({ properties: DEMO_PROPERTIES })
    } finally {
      set({ loading: false })
    }
  },

  createProperty: async (formData, agentId) => {
    try {
      const payload = {
        agent_id: agentId,
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
        images: formData.images,
        amenities: formData.amenities,
      }
      const { error } = await supabase.from('properties').insert(payload)
      if (error) return error.message
      await get().fetchByAgent(agentId)
      return null
    } catch {
      return 'Failed to create property.'
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
