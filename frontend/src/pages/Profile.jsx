import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileNavigation from '../components/ProfileNavigation';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const inputs = [
  { id: 'name', label: 'Full name', type: 'text', maxLength: 16 },
  { id: 'profile_email', label: 'Profile email', type: 'email' },
  { id: 'birth_date', label: 'Birth date', type: 'date' },
  { id: 'mobile_number', label: 'Mobile number', type: 'tel' },
  { id: 'address', label: 'Address', type: 'text' },
  { id: 'city', label: 'City', type: 'text' },
  { id: 'postal_code', label: 'Postal code', type: 'text' },
];

function Profile() {
  const { user, login, logout } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const baseURL = 'https://hoodshop-project.onrender.com'; // <-- pridaj render URL

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAccountDeletion = () => {
    const token = localStorage.getItem('token');

    fetch(`${baseURL}/user/profile`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          logout();
          navigate('/login');
        } else {
          setError(data.error || 'Nepodarilo sa vymazať účet.');
        }
      })
      .catch(() => setError('Chyba pri komunikácii so serverom.'));
  };


  // Upload Photo
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const uploadPhoto = () => {
    if (!selectedFile) {
      setUploadError("Vyber fotku!");
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('photo', selectedFile);

    fetch(`${baseURL}/user/upload/photo`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Fotka nahraná, cesta:', data.photo);

          // 👉 update user v AuthContext
          login({ ...user, user_photo: data.photo, token });

          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setSuccess('Photo was uploaded successfully.');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setUploadError('Chybný obrázok.');
          setTimeout(() => setUploadError(''), 3000);
        }
      })
      .catch(() => {
        setUploadError('Chybný obrázok.');
        setTimeout(() => setUploadError(''), 3000);
      });
  };



  // Default Photo funkcia pre nastavenie defaultnej fotky pre avatara 
  const setDefaultPhoto = async () => {
    try {
      const response = await fetch(`${baseURL}/user/upload/default-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const data = await response.json();

      if (data.success) {
        console.log('Default photo returned:', data.photo);

        // 👉 update user v AuthContext
        login({ ...user, user_photo: data.photo, token: localStorage.getItem('token') });

        if (fileInputRef.current) fileInputRef.current.value = '';
        setSelectedFile(null);
      } else {
        console.error('Chyba pri nastavovaní default fotky:', data.message);
      }
    } catch (error) {
      console.error('Server error:', error);
    }
  };


  // Formular
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${baseURL}/user/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // 👉 update user v AuthContext
          login({ ...data, token });
        }
      })
      .catch(() => setError('Chyba pri načítaní údajov o používateľovi'));

  }, [navigate]);

  // Handler pre update stavov políčok
  const handleChange = (e) => {
    const { name, value } = e.target;
    login({
      ...user,
      [name]: value,
      token: localStorage.getItem('token'),
    });
  };


  // Handler pre uloženie zmien
  const handleSave = () => {
    const token = localStorage.getItem('token');

    const allowedFields = [
      'name',
      'email',
      'profile_email',
      'birth_date',
      'mobile_number',
      'address',
      'city',
      'postal_code',
    ];

    // Vytvoriť iba objekt s povolenými údajmi
    const filteredUserData = allowedFields.reduce((acc, key) => {
      if (user[key] !== undefined) {
        acc[key] = user[key];
      }
      return acc;
    }, {});

    fetch(`${baseURL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filteredUserData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess('');
        } else {
          setSuccess('Profile was successfully saved.');
          setError('');

          // 👉 update globálneho usera v AuthContext
          login({
            ...user, // zachováš pôvodné údaje (napr. user_photo, role…)
            ...data, // prepíšeš hodnoty, ktoré prišli z backendu
            token,   // nechaj uložený token
          });

          setTimeout(() => {
            setSuccess('');
          }, 3000);
        }
      })
      .catch(() => {
        setError('Error saving profile.');
        setSuccess('');
      });
  };


  if (!user) return <div>Načítavam...</div>;

  return (
    <div
      className="relative text-white flex flex-col items-center bg-fixed bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: "url('/img/bg-profile-1.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40 z-0" />

      {/* ***************** Obsah ********************* */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Profile Navigation */}
        <div className="w-full lg:max-w-2xl">
          <ProfileNavigation />
        </div>

        {/* Admin Panel - zobrazí sa len adminovi */}
        {user.role === 'admin' && (
          <div className=" pb-5 w-[220px] md:m-auto">
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-3 py-3 bg-black text-white hover:text-blue-200 text-[12px] sm:text-[16px] lg:text-[20px] font-bold transition-all duration-300 border-2 border-gray-500 hover:border-blue-200"
            >
              Go to Admin Panel
            </button>
          </div>
        )}

        {/* Personal Info Form */}
        <div className="flex flex-col lg:flex-row justify-center lg:w-[85%] xl:w-[1240px] items-start bg-black bg-opacity-50 md:bg-opacity-80 lg:border-2 border-gray-600 lg:p-2">

          {/* Sekcia na nahranie fotky */}
          <div className="lg:py-6 rounded-lg shadow-lg w-full md:max-w-sm md:m-auto text-white">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-center text-blue-200">Welcome {user.name}</h1>
            <p className='text-center text-xs pb-5'>Upload a photo to use as your profile avatar.</p>

            <div className="flex flex-col items-center gap-5">

              {/* Miesto na zobrazenie fotky */}
              <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-gray-400 shadow-xl shadow-black">
                <img
                  src={
                    user?.user_photo
                      ? user.user_photo
                      : 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1755594977/default-avatar_z3c30l.jpg'
                  }
                  alt="Profilová fotka"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Tlačidlo Default Photo */}
              <button
                onClick={setDefaultPhoto}
                className="bg-gray-700 hover:bg-gray-500 transition-colors text-sm py-2 px-2 rounded-lg font-semibold cursor-pointer"
              >
                Use Default Photo
              </button>

              <div className='flex flex-col text-center items-center gap-2'>
                {/* Input pre výber súboru */}
                <label className="bg-green-800 hover:bg-green-600 transition-colors py-3 px-5 rounded-lg font-semibold cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      setUploadError('');    // reset chyby pri novom výbere
                      setSelectedFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  Select Photo
                </label>

                {/* Zobrazenie názvu vybraného súboru */}
                <div className='h-5'>
                  {selectedFile && (
                    <p className="text-[14px] text-gray-100 italic">{selectedFile.name}</p>
                  )}
                </div>
              </div>


              {/* Tlačidlo na upload fotky */}
              <button
                onClick={uploadPhoto}
                className="bg-green-800 hover:bg-green-600 transition-colors py-3 px-10 rounded-lg font-semibold cursor-pointer"
                disabled={!selectedFile}
              >
                Upload Photo
              </button>

              {/* Chybová hláška a Úspešná hláška po nahratí  pri zlyhaní uploadu */}
              <div className='h-5'>
                {uploadError && (
                  <div className="text-red-500 text-center font-semibold">
                    {uploadError}
                  </div>
                )}
              </div>

            </div>
          </div>


          {/* Formulár s osobnými údajmi (pôvodný kód) */}
          <div className="p-2 lg:p-6 rounded-lg shadow-lg w-[92%] mx-auto md:max-w-2xl lg:max-w-3xl text-white">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-center text-blue-200">Personal Information</h1>
            <p className="text-sm lg:text-[16px] text-white my-5 pl-3">
              Fill out your personal details below. These will be saved to your profile and automatically used during checkout to speed up the ordering process.
            </p>

            <form
              className="flex flex-col space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {inputs.map(({ id, label, type, maxLength }) => (
                <div
                  key={id}
                  className="flex flex-col lg:flex-row lg:items-center gap-2"
                >
                  <label
                    htmlFor={id}
                    className="block pl-3 lg:pl-0 lg:mb-0 lg:w-1/3 xl:w-1/4 text-[14px] lg:text-lg text-blue-100 font-semibold"
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    placeholder={label}
                    value={
                      type === 'date'
                        ? user[id] ? new Date(user[id]).toISOString().split('T')[0] : ''
                        : user[id] || ''
                    }
                    onChange={handleChange}
                    maxLength={maxLength}
                    className="w-full lg:w-2/3 p-3 pl-5  bg-gray-800 text-white border border-gray-500"
                  />

                </div>
              ))}

              <div className='py-2 w-full md:w-[220px] md:m-auto'>
                <button
                  type="submit"
                  className="w-full bg-green-800 hover:bg-green-600 transition-colors py-3 rounded-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>

              {/* ✅ Tu je rezervovaný priestor na success hlášku */}
              <div className="h-5 flex items-center justify-center">
                {success && (
                  <div className="text-green-500 text-center text-xl transition-opacity duration-300">
                    {success}
                  </div>
                )}
              </div>

            </form>
          </div>

        </div>

        {/* Delete Form */}
        <div className="p-6 my-10 flex flex-col md:flex-row md:items-center md:justify-center w-full md:w-[90%] lg:w-[85%] xl:w-[1240px] text-white lg:border-2 border-gray-600 bg-black bg-opacity-50 md:bg-opacity-70 gap-4">
          <p className="text-sm xl:text-[16px] text-gray-100 max-w-md mx-auto text-center md:text-left">
            You can delete your account here, but be aware – all saved data associated with your account will be permanently lost.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-[90%] md:w-[220px] bg-red-700 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition- mx-auto"
          >
            Delete Account
          </button>
        </div>


        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
              <h2 className="text-xl font-bold mb-4 text-red-500">Delete Account</h2>
              <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleAccountDeletion();
                  }}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
export default Profile;
