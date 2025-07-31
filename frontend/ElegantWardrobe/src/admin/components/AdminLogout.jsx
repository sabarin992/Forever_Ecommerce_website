// AdminLogout.jsx
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ADMIN_ACCESS_TOKEN, ADMIN_REFRESH_TOKEN } from '@/constants';
import api from '@/api';

const AdminLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async() => {
    try {
      const res = await api.post('/logout/')
        toast.success('Logged out successfully');
        navigate('/admin-login');
    } catch (error) {
      console.log(error);
      
    }
   
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default AdminLogout;
