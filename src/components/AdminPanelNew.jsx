import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { API_URL } from '../config';

const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];
const STYLES = ['Modern', 'Minimalist', 'Scandinavian', 'Bohemian'];
const MOODS = ['Warm Neutrals', 'Cool Tones', 'Earth Tones', 'Monochrome'];
const PRIORITIES = ['Comfort', 'Aesthetics', 'Functionality', 'Budget'];
const SIZES = ['Small', 'Medium', 'Large'];

const initialFormData = {
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
};

export default function AdminPanel({ isOpen, onClose, user }) {
  const [designs, setDesigns] = useState([]);
  const [isCreating, setIsCreating] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setIsLoaded(false);
    fetchDesigns();
  }, [isOpen]);

  const fetchDesigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/designs`);
      if (!response.ok) {
        throw new Error(`Failed to load designs (${response.status})`);
      }
      const data = await response.json();
      setDesigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError('Unable to load designs. Please try again.');
    } finally {
      setIsLoaded(true);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type } = event.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? Number(value) : value
        }
      }));
      return;
    }

    if (event.target.multiple) {
      const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedOptions }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value, checked) => {
    setFormData((prev) => {
      const values = prev[name] || [];
      return {
        ...prev,
        [name]: checked ? [...values, value] : values.filter((item) => item !== value)
      };
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsCreating(true);
    setError(null);
  };

  const handleEdit = (design) => {
    setFormData({
      name: design.name || '',
      description: design.description || '',
      imageUrl: design.imageUrl || '',
      room: design.room || '',
      styles: Array.isArray(design.styles) ? design.styles : [],
      moods: Array.isArray(design.moods) ? design.moods : [],
      budgetRange: design.budgetRange || { min: 0, max: 100000 },
      priority: Array.isArray(design.priority) ? design.priority : [],
      size: Array.isArray(design.size) ? design.size : [],
      features: Array.isArray(design.features) ? design.features.join(', ') : String(design.features || '')
    });
    setEditingId(design._id);
    setIsCreating(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this design?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/designs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      fetchDesigns();
    } catch (err) {
      console.error('Error deleting design:', err);
      setError('Unable to delete design.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        features: formData.features
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item),
        adminEmail: user?.email || 'admin@aura.com'
      };

      const url = editingId
        ? `${API_URL}/api/admin/designs/${editingId}`
        : `${API_URL}/api/admin/designs`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Save failed');
      }

      await response.json();
      fetchDesigns();
      resetForm();
    } catch (err) {
      console.error('Error saving design:', err);
      setError(err.message || 'Unable to save design.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (!user?.isAdmin) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be an admin to manage designs.</p>
          <button
            onClick={onClose}
            className="bg-[#C26A43] text-white px-6 py-3 rounded-full hover:bg-[#A85734] transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-[#C26A43] to-[#A85734] p-8 flex items-center justify-between rounded-t-3xl">
            <div>
              <h1 className="text-4xl font-serif font-bold text-white">Aura Admin</h1>
              <p className="text-white/80">Manage Interior Designs & Combinations</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-full transition text-white">
              <X size={28} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">{isCreating ? (editingId ? 'Edit Design' : 'Create New Design') : 'Design Library'}</h2>
                  <p className="text-gray-600 mt-2">Manage your interior design combinations from one place.</p>
                </div>
                <button
                  onClick={() => {
                    setIsCreating(true);
                    resetForm();
                  }}
                  className="inline-flex items-center gap-2 bg-[#C26A43] text-white px-6 py-3 rounded-lg hover:bg-[#A85734] transition font-semibold"
                >
                  <Plus size={20} /> New Design
                </button>
              </div>

              {!isLoaded ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-700">Loading designs…</div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
              ) : null}

              {!isCreating ? (
                <div className="space-y-6">
                  {designs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-gradient-to-b from-gray-50 to-white p-12 text-center">
                      <p className="text-xl font-semibold text-gray-800 mb-3">No designs found yet.</p>
                      <p className="text-gray-500 mb-6">Click "New Design" to add your first interior combination.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {designs.map((design) => (
                        <div key={design._id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                          {design.imageUrl && (
                            <img
                              src={design.imageUrl}
                              alt={design.name}
                              className="mb-4 h-48 w-full rounded-3xl object-cover"
                            />
                          )}
                          <h3 className="text-xl font-bold mb-2">{design.name || 'Untitled'}</h3>
                          <p className="text-sm text-gray-600 mb-4">{design.description || 'No description provided.'}</p>
                          <div className="mb-4 text-sm space-y-1 text-gray-700">
                            <p><span className="font-semibold">Room:</span> {design.room || 'N/A'}</p>
                            <p><span className="font-semibold">Styles:</span> {(design.styles || []).join(', ') || 'N/A'}</p>
                            <p><span className="font-semibold">Moods:</span> {(design.moods || []).join(', ') || 'N/A'}</p>
                            <p><span className="font-semibold">Budget:</span> ${design.budgetRange?.min?.toLocaleString?.() ?? 'N/A'} - ${design.budgetRange?.max?.toLocaleString?.() ?? 'N/A'}</p>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() => handleEdit(design)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(design._id)}
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                    <h3 className="text-xl font-bold mb-4">Basic Info</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Design Name *</span>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                          placeholder="Modern Living Room"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Room Type *</span>
                        <select
                          name="room"
                          value={formData.room}
                          onChange={handleInputChange}
                          required
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        >
                          <option value="">Choose room</option>
                          {ROOMS.map((room) => (
                            <option key={room} value={room}>{room}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="font-semibold text-gray-700">Description *</span>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        placeholder="Describe this design..."
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="font-semibold text-gray-700">Image URL *</span>
                      <input
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        required
                        className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </label>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                    <h3 className="text-xl font-bold mb-4">Budget & Tags</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Min Budget</span>
                        <input
                          name="budgetRange.min"
                          type="number"
                          value={formData.budgetRange.min}
                          onChange={handleInputChange}
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Max Budget</span>
                        <input
                          name="budgetRange.max"
                          type="number"
                          value={formData.budgetRange.max}
                          onChange={handleInputChange}
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Style</span>
                        <select
                          name="styles"
                          value={formData.styles}
                          onChange={handleInputChange}
                          multiple
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        >
                          {STYLES.map((style) => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Moods</span>
                        <select
                          name="moods"
                          value={formData.moods}
                          onChange={handleInputChange}
                          multiple
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        >
                          {MOODS.map((mood) => (
                            <option key={mood} value={mood}>{mood}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Priority</span>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          multiple
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        >
                          {PRIORITIES.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Sizes</span>
                        <select
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          multiple
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                        >
                          {SIZES.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-700">Features</span>
                        <input
                          name="features"
                          value={formData.features}
                          onChange={handleInputChange}
                          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:border-[#C26A43] focus:outline-none"
                          placeholder="LED lighting, open shelving, textured walls"
                        />
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C26A43] px-6 py-4 text-white transition hover:bg-[#A85734] disabled:opacity-70"
                    >
                      <Save size={18} /> {editingId ? 'Update Design' : 'Save Design'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 py-4 text-gray-800 transition hover:border-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
