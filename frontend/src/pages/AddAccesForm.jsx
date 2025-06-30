import { useDispatch, useSelector } from 'react-redux';
import { addAccess} from '../store/thunks/addAcess.js';
import { resetAccessStatus } from '../store/slice/accessSlice.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const AddAccessForm = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.access);
  const userId = useSelector((state) => state.auth.user?._id);
console.log(userId);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res= await dispatch(addAccess({ userId, email, role })).unwrap();
        console.log("Success",res);
        navigate("/user");
    } catch (err) {
        console.error('access failed:', err);
    }
   
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => dispatch(resetAccessStatus()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <input
        className="w-full border rounded-lg p-2"
        placeholder="User Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <select
        className="w-full border rounded-lg p-2"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Access'}
      </button>

      {success && <p className="text-green-600">Access added successfully!</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
};

export default AddAccessForm;
