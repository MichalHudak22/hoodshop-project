import React, { useState } from 'react';
import axios from 'axios';

const typeOptions = {
  football: ['jersey', 'ball', 'cleats', 'shinguards'],
  hockey: ['jersey', 'sticks', 'skates', 'helmets'],
  cycling: ['clothes', 'bikes', 'helmets', 'gloves'],
};

const baseURL = import.meta.env.VITE_API_BASE_URL;
const cloudinaryUploadURL = 'https://api.cloudinary.com/v1_1/' + import.meta.env.VITE_CLOUDINARY_CLOUD_NAME + '/upload';
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '', category: '', brand: '', price: '', type: '',
    description: '', slug: '', carousel_group: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [includeCarouselGroup, setIncludeCarouselGroup] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const generateSlug = (text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = {
      ...formData,
      [name]: value,
      ...(name === 'name' ? { slug: generateSlug(value) } : {}),
      ...(name === 'category' ? { type: '' } : {}),
    };

    if ((name === 'category' || name === 'type') && (updatedForm.category && updatedForm.type)) {
      updatedForm.carousel_group = `${updatedForm.category}_${updatedForm.type}`;
    }

    setFormData(updatedForm);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Funkcia na upload do Cloudinary
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', cloudinaryUploadPreset);

    const res = await axios.post(cloudinaryUploadURL, data);
    return res.data.secure_url; // vracia hotovú URL obrázka
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setImageError(null);

  const { name, category, brand, price, type, description, slug } = formData;
  if (!name || !category || !brand || !price || !type || !description || !slug) {
    setError('Please fill in all required fields.');
    setMessage(null);
    return;
  }

  if (!imageFile) {
    setImageError('Please upload an image before saving the product.');
    setMessage(null);
    return;
  }

  setUploading(true);

  try {
    // 1️⃣ Upload obrázku priamo na Cloudinary (unsigned preset)
    const data = new FormData();
    data.append('file', imageFile);
    data.append('upload_preset', cloudinaryUploadPreset);

    const cloudRes = await axios.post(cloudinaryUploadURL, data);
    const imageURL = cloudRes.data.secure_url;

    // 2️⃣ Odoslanie dát produktu na backend ako JSON
    const token = localStorage.getItem('token');
    const productData = { ...formData, image: imageURL };
    if (!includeCarouselGroup) delete productData.carousel_group;

    const res = await axios.post(`${baseURL}/products`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMessage(res.data.message);
    setError(null);
    setImageError(null);
    setFormData({
      name: '', category: '', brand: '', price: '', type: '',
      description: '', slug: '', carousel_group: ''
    });
    setImageFile(null);
    setIncludeCarouselGroup(false);

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.error || 'An error occurred');
    setMessage(null);
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="bg-black bg-opacity-70 md:rounded-xl py-10 px-4 text-white border border-gray-700">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-8 text-center text-blue-200">Add New Product</h3>

      <ul className="text-sm lg:text-[16px] text-gray-100 mb-6 space-y-2 mx-auto lg:max-w-3xl px-2 pb-3">
        <li><strong className="text-blue-200">Name:</strong> Enter the full product name.</li>
        <li><strong className="text-blue-200">Brand:</strong> Must exactly match an existing brand.</li>
        <li><strong className="text-blue-200">Price:</strong> Enter the price (e.g., <code>49.90</code>).</li>
        <li><strong className="text-blue-200">Description:</strong> Detailed information about the product.</li>
        <li><strong className="text-blue-200">Category & Type:</strong> Determines where the product appears.</li>
        <li><strong className="text-blue-200">Carousel Group:</strong> Optional. Include in main carousel if checked.</li>
        <li><strong className="text-blue-200">Upload Image:</strong> Upload a front-facing product image.</li>
      </ul>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-gray-800 xl:border-2 border-gray-500 bg-opacity-50 p-8 rounded-lg shadow-md">

        {/* Grid layout for inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['name', 'brand', 'price', 'description'].map((field) => (
            <div key={field}>
              <label className="block font-semibold mb-1">
                {field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                <span className="text-red-400 ml-1">*</span>
              </label>
              {field === 'description' ? (
                <textarea
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter a detailed product description"
                  className="w-full p-2 bg-blue-100 text-black border border-blue-800 rounded outline-none"
                  required
                />
              ) : (
                <input
                  type={field === 'price' ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  min={field === 'price' ? '0' : undefined}
                  step={field === 'price' ? '0.01' : undefined}
                  placeholder={field === 'name' ? 'Enter product name' :
                               field === 'brand' ? 'Enter brand' :
                               field === 'price' ? 'Enter price in €' : ''}
                  className="w-full p-2 bg-blue-100 text-black border border-blue-800 rounded outline-none"
                  required
                />
              )}
            </div>
          ))}
        </div>

        {/* Category & Type */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Category<span className="text-red-400">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 bg-blue-100 text-black border border-blue-800 rounded"
              required
            >
              <option value="">-- Select Category --</option>
              {Object.keys(typeOptions).map((cat) => (
                <option key={cat} value={cat}>{cat[0].toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Type<span className="text-red-400">*</span></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 bg-blue-100 text-black border border-blue-800 rounded"
              required
              disabled={!formData.category}
            >
              <option value="">-- Select Type --</option>
              {formData.category && typeOptions[formData.category].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Carousel & Image container */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mt-6">
          <div className="md:w-1/2 px-2">
            <label className="block font-semibold mb-1">Carousel Group</label>
            <input
              type="text"
              name="carousel_group"
              value={formData.carousel_group}
              readOnly
              disabled
              className="w-full p-2 bg-gray-300 text-black border border-blue-800 rounded outline-none cursor-not-allowed"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="includeCarouselGroup"
                checked={includeCarouselGroup}
                onChange={() => setIncludeCarouselGroup(!includeCarouselGroup)}
                className="accent-green-500 w-6 h-6"
              />
              <label htmlFor="includeCarouselGroup" className="text-[16px] text-blue-100">
                Include <code>carousel_group</code> in product
              </label>
            </div>
          </div>

          <div className="md:w-1/2 min-h-56 md:min-h-36 px-2 bg-gray-700 p-3 bg-opacity-70 rounded-lg">
            <label className="block font-semibold mb-1 text-center md:text-left">
              Image<span className="text-red-400 ml-1">*</span>
            </label>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                >
                  Upload Image
                </label>
                {imageFile && <span className="text-sm text-green-200 mt-2 md:mt-1">{imageFile.name}</span>}
              </div>
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-20 h-20 border rounded mx-auto md:mx-0"
                />
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="w-[190px] bg-green-700 hover:bg-green-600 text-white py-2 px-4 text-sm md:text-lg rounded-lg transition"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add Product'}
          </button>
        </div>

        {/* Message / Error */}
        <div className="mt-4 h-6 md:h-8 flex justify-center items-center">
          {message && <p className="text-green-400 font-medium text-center">{message}</p>}
          {error && <p className="text-red-400 font-medium text-center">{error}</p>}
          {imageError && <p className="text-red-400 font-medium text-center">{imageError}</p>}
        </div>

      </form>
    </div>
  );
};

export default AddProductForm;
