import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AdminlogoutThunk } from '../store/thunks/authThunk';

export default function SidebarMenu({ currentSection, onSectionChange }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //Logout Admin //
  const handleLogout = async () => {
    try {
      const res = await dispatch(AdminlogoutThunk()).unwrap();
      toast.success(`${res?.message}`);
      navigate("/", { state: { from: location.pathname } });
    } catch (error) {
      toast.error(`${error?.message}` || "Logout not performed!");
    }
  };

  const sections = ['dashboard', 'pending', 'current', 'completed'];
  return (
    <ul className="space-y-4">
      {sections.map((label) => (
        <li
          key={label}
          className={`flex items-center gap-3 cursor-pointer hover:text-indigo-600 text-gray-700 ${currentSection === label ? 'font- text-indigo-600' : ''}`}
          onClick={() => onSectionChange(label)}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="capitalize">{label}</span>
        </li>
      ))}
      <li>
        <button className="flex items-center gap-3 cursor-pointer hover:text-indigo-600 text-gray-700" onClick={handleLogout}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Logout</span>
          </button>
      </li>
    </ul>
  );
}