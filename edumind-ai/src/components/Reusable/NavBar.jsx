import React from 'react'

const NavBar = () => {
  const links = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'Virtual Professor',
      path: '/virtual-professor'
    },
    {
      name: 'Concept Visualizer',
      path: '/concept-visualizer'
    }
  ]

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-6 py-3">
      <div className="backdrop-blur-md bg-white/30 rounded-full border border-blue-100 shadow-lg px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className=" font-bold text-xl">
            EduMind <span className="text-blue-500">AI</span>
          </a>
        </div>
        
        <div className="flex items-center space-x-8">
          {links.map((link) => (
            <div key={link.name}>
              <a 
                href={link.path} 
                className=" hover:text-blue-500 transition-colors duration-200 font-medium"
              >
                {link.name}
              </a>
            </div>
          ))}
          
          <div className="ml-6">
            <a 
              href="/signin" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition-colors duration-200 shadow-md flex items-center justify-center"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBar