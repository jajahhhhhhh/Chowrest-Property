import type { Property, PropertyType, PropertyStatus } from '@/types'

const AIRTABLE_TOKEN = 'pat7KC0O4W0RkHIzG.fcc271c560b8bb892dcac95dc7f616bfa79361d2c1eebda22e16f2d4c892437b'
const BASE_ID = 'appXNSycaCsR18AIO'
const TABLE_ID = 'tbl6VK5e7iZXkJPNk'

interface AirtableRecord {
    id: string
    fields: {
        'Property Name'?: string
        'ID'?: string
        'Category'?: string
        'Status'?: string
        'Price'?: number
        'Price Unit'?: string
        'Location'?: string
        'Description'?: string
        'Bedrooms'?: number
        'Bathrooms'?: number
        'Land (sqm)'?: number
        'Built (sqm)'?: number
        'Title Type'?: string
        'Ownership'?: string
        'Features'?: string[]
        'Cover Photo URL'?: string
        'Page URL'?: string
        'Latitude'?: number
        'Longitude'?: number
    }
}

// Map Airtable category to Property type
function mapCategory(category: string): PropertyType {
    if (category.includes('Villa')) return 'villa'
    if (category.includes('Land')) return 'land'
    if (category.includes('House')) return 'house'
    if (category.includes('Monthly rental')) return 'condo'
    if (category.includes('Holiday')) return 'condo'
    return 'house'
}

// Map Airtable status + price unit to Property status
function mapStatus(airtableStatus: string, priceUnit: string): PropertyStatus {
    if (airtableStatus === 'Sold') return 'sold'
    if (airtableStatus === 'Rented') return 'rented'
    if (priceUnit === 'Per month' || priceUnit === 'Per night') return 'for_rent'
    return 'for_sale'
}

// Transform Airtable record to Property
function transformRecord(record: AirtableRecord): Property {
    const fields = record.fields
    const category = fields.Category || ''
    const priceUnit = fields['Price Unit'] || 'Total'

    return {
        id: record.id,
        agent_id: 'airtable',
        title: fields['Property Name'] || 'Untitled Property',
        description: fields.Description || '',
        type: mapCategory(category),
        status: mapStatus(fields.Status || 'Live', priceUnit),
        price: fields.Price || 0,
        bedrooms: fields.Bedrooms ?? null,
        bathrooms: fields.Bathrooms ?? null,
        area_sqm: fields['Built (sqm)'] ?? fields['Land (sqm)'] ?? null,
        address: fields.Location || '',
        city: fields.Location?.split(',')[0] || '',
        province: 'Surat Thani', // Default for Koh Samui properties
        country: 'Thailand',
        lat: fields.Latitude ?? null,
        lng: fields.Longitude ?? null,
        featured: false, // Set manually in Airtable if needed
        images: fields['Cover Photo URL'] ? [fields['Cover Photo URL']] : [],
        amenities: fields.Features || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}

export async function fetchPropertiesFromAirtable(): Promise<Property[]> {
    try {
        const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`)
        url.searchParams.append('pageSize', '100')

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status}`)
        }

        const data = await response.json() as { records: AirtableRecord[] }
        return data.records.map(transformRecord)
    } catch (error) {
        console.error('Failed to fetch from Airtable:', error)
        throw error
    }
}

export async function createPropertyInAirtable(property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'agent_id' | 'profiles'>): Promise<string> {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                records: [
                    {
                        fields: {
                            'Property Name': property.title,
                            'ID': property.title.toLowerCase().replace(/\s+/g, '-'),
                            'Category': property.type === 'villa' ? 'Villa for sale' : property.type === 'land' ? 'Land for sale' : 'Monthly rental',
                            'Status': property.status === 'for_sale' ? 'Live' : 'Live',
                            'Price': property.price,
                            'Price Unit': ['for_rent', 'rented'].includes(property.status) ? 'Per month' : 'Total',
                            'Location': `${property.city}, Koh Samui`,
                            'Description': property.description,
                            'Bedrooms': property.bedrooms,
                            'Bathrooms': property.bathrooms,
                            'Built (sqm)': property.area_sqm,
                            'Features': property.amenities,
                            'Cover Photo URL': property.images[0] || '',
                            'Latitude': property.lat,
                            'Longitude': property.lng,
                        },
                    },
                ],
            }),
        })

        if (!response.ok) {
            throw new Error(`Failed to create property in Airtable: ${response.status}`)
        }

        const data = await response.json() as { records: AirtableRecord[] }
        return data.records[0]?.id || ''
    } catch (error) {
        console.error('Failed to create property in Airtable:', error)
        throw error
    }
}
