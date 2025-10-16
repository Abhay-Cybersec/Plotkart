const RoleCard = ({ role, icon, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform hover:scale-105 hover:shadow-2xl transition-smooth border-2 border-transparent hover:border-primary-cyan"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-cyan to-primary-blue rounded-full flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Continue as {role}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
        <button className="mt-4 px-8 py-3 bg-gradient-to-r from-primary-cyan to-primary-blue text-white rounded-lg font-semibold hover:shadow-lg transition-smooth">
          Select {role}
        </button>
      </div>
    </div>
  )
}

export default RoleCard
