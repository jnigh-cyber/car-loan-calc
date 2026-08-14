import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalculatePage from './pages/CalculatePage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import SavedCalculationsPage from './pages/SavedCalculationsPage';


function App() {
  return (
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<CalculatePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage  />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path='/saved' element={<SavedCalculationsPage />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
  )
}

export default App
