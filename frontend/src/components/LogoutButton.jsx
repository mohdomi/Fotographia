import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk} from '../store/thunks/authThunk'; // adjust path
import { toast } from 'react-toastify';

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async() => {
    try {
        const res= await dispatch(logoutThunk()).unwrap();
        console.log(res);
           toast.success(`${res?.message}`);
        navigate('/login');
    } catch (error) {
        toast.error(`${error?.message}` || "Logout not performed!");
    }
    // redirect to login page
  };

  return (
    <button onClick={handleLogout} className="text-red-500 hover:underline">
      Logout
    </button>
  );
}

export default LogoutButton;
