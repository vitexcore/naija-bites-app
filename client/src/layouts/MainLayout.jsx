import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Navbar />}
      <main className={`flex-1 ${!isAdminPage ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

export default MainLayout;
