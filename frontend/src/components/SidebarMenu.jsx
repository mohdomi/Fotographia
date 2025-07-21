import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AdminlogoutThunk } from '../store/thunks/authThunk';
AdminlogoutThunk
export default function SidebarMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //Logout Admin //
  const handleLogout = async() => {

    try {
        const res= await dispatch(AdminlogoutThunk()).unwrap();
           toast.success(`${res?.message}`);
         navigate("/", { state: { from: location.pathname } });
    } catch (error) {
        toast.error(`${error?.message}` || "Logout not performed!");
    }
  };

  return (
    <ul className="space-y-4">
      {['Dashboard', 'Settings', 'Profile', 'Logout'].map((label) => (
        <li key={label} className="flex items-center gap-3 cursor-pointer hover:text-indigo-600 text-gray-700">
          <LayoutDashboard className="w-5 h-5"/>
          {label==='Logout'? <button onClick={handleLogout}>{label}</button>: <a href={`/${label}`} className='outline-none'>{label}</a>
          }
        </li>
      ))}
    </ul>
  );
}