import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NewPage from '../components/NewPage'
import MaterialsCard from '../components/MaterialsCard'
import PopupForm from '../components/PopupForm'
import Input from '../components/Input'
import Select from '../components/Select'
import RadioGroup from '../components/RadioGroup'
import { API_V2_BASE_URL } from '../config/api'
import apiService from '../utils/apiService'

function Library() {
  const location = useLocation()
  const sectionRefs = useRef({})
  const [materialsData, setMaterialsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [categories, setCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [vendors, setVendors] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    productNumber: '',
    category: '',
    categoryId: '',
    supplier: '',
    supplierId: '',
    manufacturer: '',
    manufacturerId: '',
    units: '',
    price: '',
    warrantyYears: '',
    groundShipping: 'required',
    quote: 'required',
    active: 'active',
  })

  // Fetch materials from API
  useEffect(() => {
    fetchMaterials()
    fetchCategories()
    fetchManufacturers()
    fetchVendors()
  }, [])

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const data = await apiService.categories.getAll()
      // Transform categories into Select options format
      // Use slug if available, otherwise use id, and name as label
      const categoriesList = Array.isArray(data) ? data : (data.categories || [])
      const categoryOptions = categoriesList.map(cat => ({
        value: cat.slug || cat.id,
        label: cat.name,
        id: cat.id
      }))
      setCategories(categoryOptions)
    } catch (err) {
      console.error('Categories fetch error:', err)
      // Fallback to default categories if API fails
      setCategories([
        { value: 'flashings-vents', label: 'Flashings/Vents' },
        { value: 'membranes', label: 'Membranes' },
        { value: 'insulation', label: 'Insulation' },
        { value: 'adhesives', label: 'Adhesives' },
      ])
    }
  }

  // Fetch manufacturers from API
  const fetchManufacturers = async () => {
    try {
      const data = await apiService.manufacturers.getAll()
      const manufacturersList = Array.isArray(data) ? data : (data.manufacturers || [])
      setManufacturers(manufacturersList)
    } catch (err) {
      console.error('Manufacturers fetch error:', err)
    }
  }

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      const data = await apiService.vendors.getAll()
      const vendorsList = Array.isArray(data) ? data : (data.vendors || [])
      setVendors(vendorsList)
    } catch (err) {
      console.error('Vendors fetch error:', err)
    }
  }

  // Scroll to section when hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash && sectionRefs.current[hash]) {
      setTimeout(() => {
        sectionRefs.current[hash].scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }, [location.hash, materialsData])

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please log in to view the library')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_V2_BASE_URL}/materials-library`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch materials')
      }

      const data = await response.json()
      setMaterialsData(data)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching materials')
      console.error('Materials fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to create section ID from category/subcategory name
  const createSectionId = (name) => {
    if (!name) return ''
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  // Structure materials - combine all into "Materials" category
  const structureMaterials = () => {
    if (!materialsData) return []

    const { categories, materials, manufacturers, vendors } = materialsData

    // Create lookup maps for manufacturers and vendors
    const manufacturerMap = new Map()
    if (manufacturers) {
      manufacturers.forEach(m => manufacturerMap.set(m.id, m.name))
    }
    const vendorMap = new Map()
    if (vendors) {
      vendors.forEach(v => vendorMap.set(v.id, v.name))
    }

    // Map categories to sections with their materials
    const categoriesWithMaterials = categories.map(category => {
      // Find materials for this category using category_id
      const categoryMaterials = materials ? materials
        .filter(material => material.category_id === category.id)
        .map(material => {
          // Enrich material with manufacturer and vendor names
          return {
            ...material,
            manufacturerName: material.manufacturer_id ? manufacturerMap.get(material.manufacturer_id) : null,
            vendorName: material.vendor_id ? vendorMap.get(material.vendor_id) : null
          }
        }) : []

      return {
        ...category,
        materials: categoryMaterials
      }
    })

    // Return Materials as a single category with categories as sections
    return [
      {
        name: 'Materials',
        subcategories: categoriesWithMaterials
      }
    ]
  }

  if (loading) {
    return (
      <NewPage>
        <div className="p-4">
          <p>Loading materials...</p>
        </div>
      </NewPage>
    )
  }

  if (error) {
    return (
      <NewPage>
        <div className="p-4">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </NewPage>
    )
  }

  const structuredData = structureMaterials()

  const handleMaterialClick = async (materialData) => {
    const material = materialData.material || materialData
    
    // Extract price - try to fetch from pricing table if material has ID
    let priceValue = '0'
    if (material.id) {
      try {
        const pricingData = await apiService.materialPricing.getByMaterialId(material.id)
        if (pricingData && pricingData.length > 0) {
          // Get the most recent pricing (should be sorted by effective_date desc)
          const latestPrice = pricingData[0]
          // Convert dollars to cents for the input component
          priceValue = String(Math.round((latestPrice.unit_cost || 0) * 100))
        }
      } catch (err) {
        console.error('Error fetching pricing:', err)
      }
    }
    
    // Extract warranty years from warranty_level (e.g., "15yr" -> "15")
    let warrantyYears = ''
    if (material.warranty_level) {
      const match = material.warranty_level.match(/(\d+)/)
      warrantyYears = match ? match[1] : ''
    }
    
    // Find category by ID or slug
    const category = categories.find(cat => cat.id === material.category_id || cat.value === material.category_id)
    
    setFormData({
      name: material.name || materialData.productName || '',
      productNumber: material.product_number || materialData.partNumber || '',
      category: category?.value || material.category_id || '',
      categoryId: material.category_id || category?.id || '',
      supplier: material.vendor_id || '',
      supplierId: material.vendor_id || '',
      manufacturer: material.manufacturer_id || '',
      manufacturerId: material.manufacturer_id || '',
      units: material.unit_type || '',
      price: priceValue,
      warrantyYears: warrantyYears,
      groundShipping: material.requires_ground_shipping === true ? 'required' : (material.requires_ground_shipping === false ? 'not-required' : 'not-required'),
      quote: material.requires_quote === true ? 'required' : (material.requires_quote === false ? 'not-required' : 'not-required'),
      active: material.active === true ? 'active' : (material.active === false ? 'not-active' : 'active'),
    })
    setSelectedMaterial(material)
    setIsPopupOpen(true)
    setSaveError(null)
  }

  const handleSaveMaterial = async () => {
    setSaving(true)
    setSaveError(null)

    try {
      // Find category ID from slug or value
      const selectedCategory = categories.find(cat => 
        cat.value === formData.category || cat.id === formData.category
      )
      const categoryId = selectedCategory?.id || formData.categoryId || formData.category

      // Find manufacturer ID - if formData.manufacturer is a slug, find the ID
      let manufacturerId = formData.manufacturerId
      if (!manufacturerId && formData.manufacturer) {
        const manufacturer = manufacturers.find(m => 
          m.id === formData.manufacturer || 
          m.name?.toLowerCase() === formData.manufacturer?.toLowerCase()
        )
        manufacturerId = manufacturer?.id || formData.manufacturer
      }

      // Find vendor ID - if formData.supplier is a slug, find the ID
      let vendorId = formData.supplierId
      if (!vendorId && formData.supplier) {
        const vendor = vendors.find(v => 
          v.id === formData.supplier || 
          v.name?.toLowerCase() === formData.supplier?.toLowerCase()
        )
        vendorId = vendor?.id || formData.supplier
      }

      // Prepare material data
      const materialPayload = {
        name: formData.name,
        productNumber: formData.productNumber,
        categoryId: categoryId,
        manufacturerId: manufacturerId,
        units: formData.units,
        warrantyYears: formData.warrantyYears,
        groundShipping: formData.groundShipping || 'not-required',
        quote: formData.quote || 'not-required',
        active: formData.active || 'active',
      }
      
      console.log('[SaveMaterial] Material payload:', materialPayload)

      let savedMaterial

      // Update existing material or create new one
      if (selectedMaterial && selectedMaterial.id) {
        // Update existing material
        console.log('Updating material:', {
          id: selectedMaterial.id,
          payload: materialPayload
        })
        savedMaterial = await apiService.materials.update(selectedMaterial.id, materialPayload)
        console.log('Material update response:', savedMaterial)
      } else {
        // Create new material
        console.log('Creating new material:', materialPayload)
        savedMaterial = await apiService.materials.create(materialPayload)
        console.log('Material create response:', savedMaterial)
      }

      // Save pricing if price is provided and vendor is selected
      if (formData.price && vendorId && savedMaterial?.id) {
        try {
          // Convert cents to dollars
          const unitCost = parseFloat(formData.price) / 100
          
          // Check if pricing already exists for this material and vendor
          const existingPricing = await apiService.materialPricing.getByMaterialId(savedMaterial.id)
          const vendorPricing = existingPricing?.find(p => p.vendor_id === vendorId)

          if (vendorPricing) {
            // Update existing pricing
            await apiService.materialPricing.update(vendorPricing.id, {
              unitCost,
              effectiveDate: new Date().toISOString().split('T')[0],
            })
          } else {
            // Create new pricing record
            await apiService.materialPricing.create({
              materialId: savedMaterial.id,
              vendorId: vendorId,
              unitCost,
              effectiveDate: new Date().toISOString().split('T')[0],
            })
          }
        } catch (pricingError) {
          console.error('Error saving pricing:', pricingError)
          // Don't fail the whole save if pricing fails
        }
      }

      // Refresh materials list
      await fetchMaterials()
      
      // Close popup
      setIsPopupOpen(false)
      setSelectedMaterial(null)
      
      // Reset form
      setFormData({
        name: '',
        productNumber: '',
        category: '',
        categoryId: '',
        supplier: '',
        supplierId: '',
        manufacturer: '',
        manufacturerId: '',
        units: '',
        price: '',
        warrantyYears: '',
        groundShipping: 'required',
        quote: 'required',
        active: 'active',
      })
    } catch (error) {
      console.error('Error saving material:', error)
      setSaveError(error.message || 'Failed to save material. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      console.log(`[FormData] Updated ${field}:`, value, 'New formData:', updated)
      return updated
    })
  }

  return (
    <NewPage>
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className="space-y-16">
          {structuredData.map((category) => (
            <div key={category.name}>
              {category.subcategories.map((subcategory) => {
                const sectionId = createSectionId(subcategory.name)
                return (
                  <div
                    key={subcategory.id}
                    id={sectionId}
                    ref={(el) => (sectionRefs.current[sectionId] = el)}
                    className="mb-12 scroll-mt-4"
                  >
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        fontFamily: 'Inter',
                        fontSize: '18px',
                        letterSpacing: '-0.01em',
                        fontWeight: '500',
                        color: '#000000',
                        marginBottom: '16px',
                      }}
                    >
                      {subcategory.name}
                    </div>
                    {subcategory.materials.length > 0 ? (
                      <div className="space-y-4">
                        {subcategory.materials.map((material) => {
                          // Format quantity from unit_type and unit_size
                          let quantity = ''
                          if (material.unit_type && material.unit_size) {
                            quantity = `${material.unit_size} ${material.unit_type}`
                          } else if (material.unit_type) {
                            quantity = material.unit_type
                          } else if (material.unit_size) {
                            quantity = material.unit_size
                          }

                          return (
                            <MaterialsCard
                              key={material.id}
                              productName={material.name}
                              manufacturer={material.manufacturerName || ''}
                              partNumber={material.product_number || ''}
                              quantity={quantity}
                              price="" // Price will come from material_pricing table later
                              description={material.description || ''}
                              onClick={() => handleMaterialClick({
                                productName: material.name,
                                partNumber: material.product_number,
                                price: '', // Will need to fetch from pricing table
                                material: material
                              })}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-sm">
                        No materials in this category yet.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Popup Form */}
      <PopupForm
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false)
          setSelectedMaterial(null)
          setSaveError(null)
        }}
        title={`${selectedMaterial?.id ? 'Edit' : 'Create'} ${formData.name || 'Material'}`}
        onSave={handleSaveMaterial}
        saving={saving}
      >
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {saveError}
          </div>
        )}
        {/* Name Section */}
        <div className="flex flex-col gap-2 p-0">
          <Input
            label="Name"
            description="The name that will be displayed when searching for this material"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter material name"
            fullWidth={true}
          />
        </div>

        {/* Product Number Section */}
        <div className="flex flex-col gap-2 p-0">
          <Input
            label="Product number"
            description="What the supplier has stored on their system to reference exact"
            value={formData.productNumber}
            onChange={(e) => handleInputChange('productNumber', e.target.value)}
            placeholder="Enter product number"
            fullWidth={true}
          />
        </div>

        {/* Category Section */}
        <div className="flex flex-col gap-2 p-0">
          <Select
            label="Category"
            description="Place where this material will be sorted into"
            options={categories}
            value={formData.category}
            onChange={(value) => {
              const category = categories.find(cat => cat.value === value || cat.id === value)
              handleInputChange('category', value)
              handleInputChange('categoryId', category?.id || value)
            }}
            placeholder="Select category"
            fullWidth={true}
          />
        </div>

        {/* Supplier Section */}
        <div className="flex flex-col gap-2 p-0">
          <Select
            label="Supplier"
            description="Company that we order this material from"
            options={vendors.map(v => ({
              value: v.id,
              label: v.name
            }))}
            value={formData.supplier}
            onChange={(value) => {
              const vendor = vendors.find(v => v.id === value)
              handleInputChange('supplier', value)
              handleInputChange('supplierId', vendor?.id || value)
            }}
            placeholder="Select supplier"
            fullWidth={true}
          />
        </div>

        {/* Manufacturer Section */}
        <div className="flex flex-col gap-2 p-0">
          <Select
            label="Manufacturer"
            description="Company that produces this material"
            options={manufacturers.map(m => ({
              value: m.id,
              label: m.name
            }))}
            value={formData.manufacturer}
            onChange={(value) => {
              const manufacturer = manufacturers.find(m => m.id === value)
              handleInputChange('manufacturer', value)
              handleInputChange('manufacturerId', manufacturer?.id || value)
            }}
            placeholder="Select manufacturer"
            fullWidth={true}
          />
        </div>

        {/* Units Section */}
        <div className="flex flex-col gap-2 p-0">
          <Select
            label="Units"
            description="What unit of measurement is used when ordering"
            options={[
              { value: 'each', label: 'Each' },
              { value: 'roll', label: 'Roll' },
              { value: 'square', label: 'Square' },
              { value: 'linear-foot', label: 'Linear Foot' },
            ]}
            value={formData.units}
            onChange={(value) => handleInputChange('units', value)}
            placeholder="Select units"
            fullWidth={true}
          />
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-2 p-0">
          <Input
            type="text"
            price={true}
            label="Price"
            description="How much does this material cost per unit of measurement"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="Enter price"
            fullWidth={true}
          />
        </div>

        {/* Warranty Years Section */}
        <div className="flex flex-col gap-2 p-0">
          <Input
            type="number"
            label="Warranty Years"
            description="How many years of manufacturer warranty does it come with"
            value={formData.warrantyYears}
            onChange={(e) => handleInputChange('warrantyYears', e.target.value)}
            placeholder="Enter warranty years"
            fullWidth={true}
          />
        </div>

        {/* Ground Shipping Section */}
        <div className="flex flex-col gap-2 p-0">
          <RadioGroup
            label="Ground Shipping"
            description="Can this material be flown or only shipped"
            options={[
              { value: 'required', label: 'Required' },
              { value: 'not-required', label: 'Not required' },
            ]}
            value={formData.groundShipping}
            onChange={(value) => handleInputChange('groundShipping', value)}
            name="ground-shipping"
          />
        </div>

        {/* Quote Section */}
        <div className="flex flex-col gap-2 p-0">
          <RadioGroup
            label="Quote"
            description="Does this material require a custom quote"
            options={[
              { value: 'required', label: 'Required' },
              { value: 'not-required', label: 'Not required' },
            ]}
            value={formData.quote}
            onChange={(value) => handleInputChange('quote', value)}
            name="quote"
          />
        </div>

        {/* Active Section */}
        <div className="flex flex-col gap-2 p-0">
          <RadioGroup
            label="Active"
            description="Can you see this material or is it no longer used"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'not-active', label: 'Not active' },
            ]}
            value={formData.active}
            onChange={(value) => handleInputChange('active', value)}
            name="active-status"
          />
        </div>
      </PopupForm>
    </NewPage>
  )
}

export default Library

