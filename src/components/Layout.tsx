import { Outlet } from 'react-router-dom';
 
function Layout() {
  return (
    <div className='bg-paper'>
      <main>
          <Outlet />
      </main>
    </div>
  )
}

export default Layout