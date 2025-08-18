import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// ... všetky importy ostávajú rovnaké

export default function UserListWithDelete() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

const fetchUsers = () => {
  if (!token) {
    setError('Nie ste prihlásený');
    return;
  }

  setLoading(true);

  fetch(`${import.meta.env.VITE_API_BASE_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Nepodarilo sa načítať používateľov');
      return res.json();
    })
    .then((data) => {
      setUsers(Array.isArray(data) ? data : []); // ochrana pred neplatným formátom
      setError(null);
      setLoading(false);
    })
    .catch((e) => {
      setUsers([]); // bezpečné vyprázdnenie v prípade chyby
      setError(e.message);
      setLoading(false);
    });
};


  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = () => {
    if (!selectedUserId) return;
    setShowConfirmModal(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUserId || !token) {
      setError('Nie ste prihlásený');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/admin/user/${selectedUserId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || 'Error deleting user');
        }
        return res.json();
      })
      .then(() => {
        setLoading(false);
        setSelectedUserId(null);
        setShowConfirmModal(false);
        fetchUsers();
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
        setShowConfirmModal(false);
      });
  };

  const handleSelectUser = () => {
    if (!selectedUserId) return;
    navigate(`/admin/user/${selectedUserId}`);
  };

  const handleToggleRole = (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!token) {
      setError('Nie ste prihlásený');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/admin/user/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.error || 'Chyba pri zmene roly'); });
        }
        return res.json();
      })
      .then(() => {
        setLoading(false);
        fetchUsers();
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  };

  // Bezpečne aplikujeme filter a map len ak users je pole
  const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const adminCount = Array.isArray(users)
    ? users.filter(u => u.role === 'admin').length
    : 0;

  const userCount = Array.isArray(users)
    ? users.filter(u => u.role === 'user').length
    : 0;

  const selectedUser = Array.isArray(users)
    ? users.find(u => u.id === selectedUserId)
    : null;

  return (
    <div className=''>
      {error && (
        <p className="text-red-500 mb-4 text-center" role="alert">
          {error}
        </p>
      )}

      <div className="max-w-3xl mx-auto mb-4 text-center">
        <p className="text-white font-semibold text-lg lg:text-xl">
          Registered users:{' '}
          <span className="text-yellow-400">{users.length}</span>{' '}
          <span className="hidden md:inline">
            (Admins:{' '}
            <span className="text-yellow-400">{adminCount}</span>, Users:{' '}
            <span className="text-yellow-400">{userCount}</span>)
          </span>
        </p>
        <p className="text-white font-semibold text-lg lg:text-xl md:hidden">
          (Admins:{' '}
          <span className="text-yellow-400">{adminCount}</span>, Users:{' '}
          <span className="text-yellow-400">{userCount}</span>)
        </p>
      </div>

      <p className="text-left lg:text-center text-sm md:text-[16px] lg:text-lg text-blue-100 mb-5 max-w-3xl m-auto">
        Choose a user from the list. Click <strong className='text-gray-100'>Select</strong> to see their profile and orders, use <strong className='text-white'>Set as Admin</strong> to change their permissions, or click <strong className='text-white'>Delete</strong> to remove the user from the system.
      </p>

      <div className="mb-7 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search user by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white text-center placeholder-gray-400 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="max-w-3xl min-h-[500px] mx-auto max-h-[500px] overflow-y-scroll scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-800 rounded-lg">
        <ul className="space-y-3 px-3">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-lg text-red-500">No users found.</p>
          ) : (
            filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`cursor-pointer bg-gray-800 hover:bg-gray-900 p-4 rounded-lg shadow border-2 ${selectedUserId === user.id ? 'border-blue-400 bg-gray-900' : 'border-blue-100'
                  }`}
              >
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-gray-300">{user.email}</p>
                <p className="text-sm text-white">
                  Role:{' '}
                  <span
                    className={
                      user.role === 'admin' ? 'text-green-500 font-semibold' : 'text-gray-400'
                    }
                  >
                    {user.role}
                  </span>
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="max-w-3xl mx-auto mt-6 flex justify-center items-center gap-3 md:gap-5">
        <button
          onClick={handleSelectUser}
          disabled={!selectedUserId}
          className="w-[80px] md:w-[140px] text-center bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 text-sm md:text-lg rounded-lg transition"
        >
          Select
        </button>

        <button
          onClick={() => {
            if (!selectedUserId) return;
            const selectedUser = users.find(u => u.id === selectedUserId);
            if (selectedUser) {
              handleToggleRole(selectedUser.id, selectedUser.role);
            }
          }}
          disabled={!selectedUserId || loading}
          className="w-[120px] md:w-[165px] text-center bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 text-sm md:text-lg rounded-lg transition"
        >
          {selectedUserId
            ? users.find(u => u.id === selectedUserId)?.role === 'admin'
              ? 'Set as User'
              : 'Set as Admin'
            : 'Set as Admin'}
        </button>

        <button
          onClick={handleDeleteClick}
          disabled={!selectedUserId || loading}
          className="w-[80px] md:w-[140px] text-center bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 text-sm md:text-lg rounded-lg transition"
        >
          {loading ? 'Mažem...' : 'Delete'}
        </button>
      </div>

      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-center">
            <p className="mb-4 text-white text-lg">
              Are you sure you want to delete the user <span className='font-bold'>{selectedUser.name}</span>?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
