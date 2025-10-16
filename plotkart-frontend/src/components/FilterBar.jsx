import { useState } from 'react'

const FilterBar = ({ onFilterChange }) => {
  const [location, setLocation] = useState('')
  const [minArea, setMinArea] = useState('')
  const [approvedOnly, setApprovedOnly] = useState(false)

  const handleFilterChange = () => {
    onFilterChange({ location, minArea, approvedOnly })
  }

  const handleReset = () => {
    setLocation('')
    setMinArea('')
    setApprovedOnly(false)
    onFilterChange({ location: '', minArea: '', approvedOnly: false })
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Properties</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-cyan focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Area (sq ft)
          </label>
          <input
            type="number"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            placeholder="1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-cyan focus:border-transparent"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={approvedOnly}
              onChange={(e) => setApprovedOnly(e.target.checked)}
              className="w-5 h-5 text-primary-cyan rounded focus:ring-primary-cyan"
            />
            <span className="text-sm font-medium text-gray-700">
              CMDA Approved Only
            </span>
          </label>
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={handleFilterChange}
            className="flex-1 px-4 py-2 bg-primary-cyan text-white rounded-lg hover:bg-opacity-90 transition-smooth"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-smooth"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
