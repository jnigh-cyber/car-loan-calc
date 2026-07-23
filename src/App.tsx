import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalculatePage from './pages/CalculatePage';


function App() {
  return (
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage  />} />
        <Route path='/' element={<CalculatePage />} />
      </Routes>
  )
}

export default App
