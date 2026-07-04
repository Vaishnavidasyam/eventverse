import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 27, 75, 0.9)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </>
  );
};

export default Layout;
