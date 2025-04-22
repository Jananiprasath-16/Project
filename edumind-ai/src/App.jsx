import { Outlet } from 'react-router-dom'
import NavBar from './components/Reusable/NavBar'
import Footer from './components/Reusable/Footer'


function App() {
  
  return (
    <>
    
      <NavBar />
      <div>
        <Outlet />
      </div>
      <Footer />
    </>
  )
}

export default App
