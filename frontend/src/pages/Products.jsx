import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Filter, X, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import { productsAPI, categoriesAPI } from '../services/api'
import { cn } from '../lib/utils'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [gridCols, setGridCols] = useState(4)

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
  })

  const page = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll()
        setCategories(response.data.data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = {
          page,
          limit: 12,
          ...filters,
        }
        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })

        const response = await productsAPI.getAll(params)
        setProducts(response.data.data.products)
        setPagination(response.data.data.pagination)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [page, filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
    setSearchParams({})
  }

  const sortOptions = [
    { value: 'createdAt-DESC', label: 'En Yeni' },
    { value: 'createdAt-ASC', label: 'En Eski' },
    { value: 'price-ASC', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price-DESC', label: 'Fiyat: Yüksekten Düşüğe' },
    { value: 'name-ASC', label: 'A-Z' },
    { value: 'name-DESC', label: 'Z-A' },
  ]

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-')
    handleFilterChange('sortBy', sortBy)
    handleFilterChange('sortOrder', sortOrder)
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'createdAt' && v !== 'DESC').length

  return (
    <>
      <Helmet>
        <title>Ürünler - Perdecim</title>
        <meta name="description" content="Kaliteli perde çeşitleri. Tül, fon, blackout ve stor perdeler." />
      </Helmet>

      <div className="min-h-screen bg-charcoal-50">
        {/* Header */}
        <div className="bg-white border-b border-charcoal-100">
          <div className="container-custom py-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-700">
              {filters.search ? `"${filters.search}" için sonuçlar` : 'Tüm Ürünler'}
            </h1>
            {pagination.total > 0 && (
              <p className="text-charcoal-500 mt-2">
                {pagination.total} ürün bulundu
              </p>
            )}
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-charcoal-700">Filtreler</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gold-500 hover:text-gold-600"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium text-charcoal-600 mb-3">Kategori</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        !filters.category
                          ? 'bg-gold-100 text-gold-700'
                          : 'hover:bg-charcoal-50'
                      )}
                    >
                      Tümü
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleFilterChange('category', cat.slug)}
                        className={cn(
                          'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          filters.category === cat.slug
                            ? 'bg-gold-100 text-gold-700'
                            : 'hover:bg-charcoal-50'
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-charcoal-600 mb-3">Fiyat Aralığı</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input py-2 text-sm"
                    />
                    <span className="text-charcoal-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-charcoal-200 rounded-lg"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtreler</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 bg-gold-400 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-charcoal-500">Sırala:</span>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input py-2 pr-8 text-sm w-auto"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Toggle */}
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => setGridCols(3)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      gridCols === 3 ? 'bg-gold-100 text-gold-600' : 'hover:bg-charcoal-100'
                    )}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      gridCols === 4 ? 'bg-gold-100 text-gold-600' : 'hover:bg-charcoal-100'
                    )}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className={cn(
                  'grid gap-4 md:gap-6',
                  gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                )}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden">
                      <div className="aspect-square bg-charcoal-200 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-charcoal-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-charcoal-200 rounded animate-pulse" />
                        <div className="h-6 w-1/3 bg-charcoal-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-charcoal-500 mb-4">Ürün bulunamadı</p>
                  <button onClick={clearFilters} className="btn-outline">
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <div className={cn(
                  'grid gap-4 md:gap-6',
                  gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                )}>
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set('page', i + 1)
                        setSearchParams(params)
                      }}
                      className={cn(
                        'w-10 h-10 rounded-lg font-medium transition-colors',
                        page === i + 1
                          ? 'bg-gold-400 text-white'
                          : 'bg-white hover:bg-charcoal-100'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filtreler</h3>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-charcoal-600 mb-3">Kategori</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleFilterChange('category', '')
                      setIsFilterOpen(false)
                    }}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !filters.category
                        ? 'bg-gold-100 text-gold-700'
                        : 'hover:bg-charcoal-50'
                    )}
                  >
                    Tümü
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleFilterChange('category', cat.slug)
                        setIsFilterOpen(false)
                      }}
                      className={cn(
                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        filters.category === cat.slug
                          ? 'bg-gold-100 text-gold-700'
                          : 'hover:bg-charcoal-50'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-charcoal-600 mb-3">Fiyat Aralığı</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input py-2 text-sm"
                  />
                  <span className="text-charcoal-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    clearFilters()
                    setIsFilterOpen(false)
                  }}
                  className="flex-1 btn-outline"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 btn-primary"
                >
                  Uygula
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}
