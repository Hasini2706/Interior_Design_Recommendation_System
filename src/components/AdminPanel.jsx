import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];
const STYLES = ['Modern', 'Minimalist', 'Scandinavian', 'Bohemian'];
const MOODS = ['Warm Neutrals', 'Cool Tones', 'Earth Tones', 'Monochrome'];
const PRIORITIES = ['Comfort', 'Aesthetics', 'Functionality', 'Budget'];
const SIZES = ['Small', 'Medium', 'Large'];

export default function AdminPanel({ isOpen, onClose, user }) {
  const [designs, setDesigns] = useState([]);
  const [isCreating, setIsCreating] = useState(true); // Start with form open
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    room: '',
    styles: [],
    moods: [],
    budgetRange: { min: 0, max: 100000 },
    priority: [],
    size: [],
    features: ''
  });

  // Debug logging
  console.log('AdminPanel render:', { isOpen, user, isAdmin: user?.isAdmin });

  if (!isOpen) return null;

  // TEMPORARY: Allow access for debugging - remove this later
  // if (!user?.isAdmin) {
  //   return (
  //     <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
  //       <div className="bg-white p-8 rounded-2xl max-w-md text-center">
  //         <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
  //         <p className="text-gray-600 mb-6">You need admin privileges to access this panel.</p>
  //         <p className="text-sm text-gray-500">Current user: {user?.email || 'No user'}</p>
  //         <p className="text-sm text-gray-500">isAdmin: {user?.isAdmin ? 'true' : 'false'}</p>
  //         <button 
  //           onClick={onClose}
  //           className="mt-4 bg-[#C26A43] text-white px-6 py-2 rounded-lg"
  //         >
  //           Close
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Fetch designs once
  useEffect(() => {
    if (isOpen) {
      fetchDesigns();
    }
  }, [isOpen]);

  const fetchDesigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/designs`);
      const data = await response.json();
      setDesigns(data);
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested objects like budgetRange.min
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else if (e.target.multiple) {
      // Handle multi-select
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (name, value, isChecked) => {
    setFormData(prev => {
      const array = prev[name] || [];
      return {
        ...prev,
        [name]: isChecked ? [...array, value] : array.filter(item => item !== value)
      };
    });
  };

  const handleSaveDesign = async () => {
    console.log('Save clicked');
    
    if (!formData.name.trim()) {
      alert('Please enter a Design Name');
      return;
    }
    if (!formData.room) {
      alert('Please select a Room Type');
      return;
    }
    
    setLoading(true);
    try {
      const url = editingId
        ? `${API_URL}/api/admin/designs/${editingId}`
        : `${API_URL}/api/admin/designs`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
          adminEmail: user?.email || 'admin@aura.com'
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Show success popup
        setSuccessMessage('✓ Design saved successfully!');
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
        
        // Refresh designs and reset form
        await fetchDesigns();
        resetForm();
      } else {
        alert('Error: ' + (result.error || 'Failed to save design'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (design) => {
    setFormData({
      name: design.name,
      description: design.description,
      imageUrl: design.imageUrl,
      room: design.room,
      styles: design.styles,
      moods: design.moods,
      budgetRange: design.budgetRange,
      priority: design.priority,
      size: design.size,
      features: (design.features || []).join(', ')
    });
    setEditingId(design._id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this design?')) {
      try {
        const response = await fetch(`${API_URL}/api/admin/designs/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchDesigns();
        }
      } catch (error) {
        console.error('Error deleting design:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      room: '',
      styles: [],
      moods: [],
      budgetRange: { min: 0, max: 100000 },
      priority: [],
      size: [],
      features: ''
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[99999]">
          <div className="bg-green-600 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-green-700">
            <CheckCircle size={24} />
            <span className="font-bold text-lg">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-[200] bg-black/60 overflow-y-auto" onClick={onClose}>
        <div className="min-h-screen flex items-center justify-center p-4 py-10">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#C26A43] to-[#A85734] p-8 flex items-center justify-between rounded-t-3xl">
              <div>
                <h1 className="text-4xl font-serif font-bold text-white">Aura Admin</h1>
                <p className="text-white/80">Manage Interior Designs & Combinations</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition text-white">
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              {!isCreating ? (
                <>
                  {/* Designs List View */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Design Library</h2>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex items-center gap-2 bg-[#C26A43] text-white px-6 py-3 rounded-lg hover:bg-[#A85734] transition font-semibold"
                    >
                      <Plus size={20} /> Add New Design
                    </button>
                  </div>

                  {designs.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                      <Plus size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg mb-4">No designs yet</p>
                      <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#C26A43] text-white px-8 py-3 rounded-lg hover:bg-[#A85734] transition font-semibold"
                      >
                        Create Your First Design
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {designs.map(design => (
                        <div key={design._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[#C26A43] transition">
                          {design.imageUrl && (
                            <img src={design.imageUrl} alt={design.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                          )}
                          <h3 className="font-bold text-lg mb-2">{design.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{design.description}</p>
                          <div className="mb-4 text-sm space-y-1">
                            <p><span className="font-semibold">Room:</span> {design.room}</p>
                            <p><span className="font-semibold">Styles:</span> {design.styles.join(', ')}</p>
                            <p><span className="font-semibold">Moods:</span> {design.moods.join(', ')}</p>
                            <p><span className="font-semibold">Budget:</span> ${design.budgetRange.min.toLocaleString()} - ${design.budgetRange.max.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(design)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(design._id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Form View */
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold">{editingId ? 'Edit Design' : 'Create New Design'}</h2>
                  <p className="text-gray-600 mt-2">Add image and set design combinations</p>
                </div>

                <div className="space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 font-semibold">Error: {error}</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-600">Saving design...</p>
                    </div>
                  )}
                  {/* Basic Info */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-semibold mb-3 text-gray-700">Design Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#C26A43] transition"
                          placeholder="e.g., Modern Living Room"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-3 text-gray-700">Room Type *</label>
                        <select
                          name="room"
                          value={formData.room}
                          onChange={handleInputChange}
                          required
                          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#C26A43] transition"
                        >
                          <option value="">Select a room</option>
                          {ROOMS.map(room => (
                            <option key={room} value={room}>{room}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block font-semibold mb-3 text-gray-700">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:border-[#C26A43] transition resize-none"
                        placeholder="Describe this design..."
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block font-semibold mb-3 text-gray-700">Image URL *</label>
                      <p className="text-xs text-blue-600 mb-2 bg-blue-50 p-2 rounded">
                        💡 <strong>How to get image URL:</strong> Right-click image on Unsplash/Pexels → "Copy image address" (should contain .jpg or .png)
                      </p>
                      <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#C26A43] transition"
                        placeholder="https://images.unsplash.com/photo-...?w=400"
                      />
                      {formData.imageUrl && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          {formData.imageUrl.includes('.jpg') || formData.imageUrl.includes('.png') || formData.imageUrl.includes('.webp') ? (
                            <>
                              <img 
                                src={formData.imageUrl} 
                                alt="Preview" 
                                className="w-full max-h-64 object-cover rounded-lg bg-gray-100" 
                                onError={(e) => {
                                  console.error('Image load error:', formData.imageUrl);
                                  e.target.style.display = 'none';
                                }}
                                onLoad={() => console.log('Image loaded:', formData.imageUrl)}
                              />
                            </>
                          ) : (
                            <p className="text-xs text-red-600 p-3 bg-red-50 rounded">
                              ❌ Invalid image URL. Must end with .jpg, .png, or .webp. Right-click image → "Copy image address"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Budget Range</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block font-semibold mb-3 text-gray-700">Minimum Budget ($)</label>
                        <input
                          type="number"
                          name="budgetRange.min"
                          value={formData.budgetRange.min}
                          onChange={handleInputChange}
                          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#C26A43] transition"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-3 text-gray-700">Maximum Budget ($)</label>
                        <input
                          type="number"
                          name="budgetRange.max"
                          value={formData.budgetRange.max}
                          onChange={handleInputChange}
                          className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#C26A43] transition"
                          placeholder="100000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Styles */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Design Styles (Select Multiple)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {STYLES.map(style => (
                        <label key={style} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-[#C26A43] transition">
                          <input
                            type="checkbox"
                            checked={formData.styles.includes(style)}
                            onChange={(e) => handleMultiSelect('styles', style, e.target.checked)}
                            className="w-5 h-5 accent-[#C26A43]"
                          />
                          <span className="font-medium">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Moods */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Color Moods (Select Multiple)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {MOODS.map(mood => (
                        <label key={mood} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-[#C26A43] transition">
                          <input
                            type="checkbox"
                            checked={formData.moods.includes(mood)}
                            onChange={(e) => handleMultiSelect('moods', mood, e.target.checked)}
                            className="w-5 h-5 accent-[#C26A43]"
                          />
                          <span className="font-medium">{mood}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priorities */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Design Priorities (Select Multiple)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {PRIORITIES.map(priority => (
                        <label key={priority} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-[#C26A43] transition">
                          <input
                            type="checkbox"
                            checked={formData.priority.includes(priority)}
                            onChange={(e) => handleMultiSelect('priority', priority, e.target.checked)}
                            className="w-5 h-5 accent-[#C26A43]"
                          />
                          <span className="font-medium">{priority}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Room Sizes (Select Multiple)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {SIZES.map(size => (
                        <label key={size} className="flex items-center gap-3 cursor-pointer p-3 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-[#C26A43] transition">
                          <input
                            type="checkbox"
                            checked={formData.size.includes(size)}
                            onChange={(e) => handleMultiSelect('size', size, e.target.checked)}
                            className="w-5 h-5 accent-[#C26A43]"
                          />
                          <span className="font-medium">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Features</h3>
                    <label className="block font-semibold mb-3 text-gray-700">Comma-separated list</label>
                    <input
                      type="text"
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#C26A43] transition"
                      placeholder="e.g., LED lighting, spacious, minimal furniture, natural materials"
                    />
                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={handleSaveDesign}
                      disabled={loading}
                      className={`flex-1 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-[#C26A43] hover:bg-[#A85734]'} text-white px-6 py-4 rounded-lg transition font-bold text-lg`}
                    >
                      <Save size={20} /> {loading ? 'Saving...' : (editingId ? 'Update Design' : 'Save Design')}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-400 transition font-bold text-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}