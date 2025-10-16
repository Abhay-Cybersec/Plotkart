import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import RoleCard from '../components/RoleCard'

const RoleSelection = () => {
  const { selectRole, user } = useAuth()
  const navigate = useNavigate()

  const handleRoleSelection = (role) => {
    selectRole(role)
    navigate(`/${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you'd like to use PlotKart
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RoleCard
            role="Buyer"
            description="Browse verified properties, check blockchain records, and purchase with confidence"
            icon={
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            }
            onClick={() => handleRoleSelection('buyer')}
          />

          <RoleCard
            role="Seller"
            description="List your properties, verify documents on blockchain, and manage ownership transfers"
            icon={
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            }
            onClick={() => handleRoleSelection('seller')}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            You can switch between roles anytime from your profile
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
