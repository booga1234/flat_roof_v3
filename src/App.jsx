function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to React + Tailwind CSS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your React app is set up with Tailwind CSS and ready to go!
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Getting Started
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Run <code className="bg-gray-100 px-2 py-1 rounded">npm install</code> to install dependencies
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Run <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> to start the development server
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.jsx</code> to start building
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Refresh</h3>
              <p className="text-gray-600 text-sm">Instant feedback with Vite's HMR</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tailwind CSS</h3>
              <p className="text-gray-600 text-sm">Utility-first CSS framework</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">React 18</h3>
              <p className="text-gray-600 text-sm">Latest React features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

