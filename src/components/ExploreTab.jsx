import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, RefreshCw } from 'lucide-react';

export default function ExploreTab() {
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState(new Set(JSON.parse(localStorage.getItem('aura_favorites') || '[]')));

  // Fetch designs on mount
  useEffect(() => {
    fetchDesigns();
    // Refresh every 3 seconds to get latest designs
    const interval = setInterval(fetchDesigns, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter designs when search or filter changes
  useEffect(() => {
    filterDesigns();
  }, [designs, searchTerm, selectedFilter]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/designs');
      const data = await response.json();
      // Sort by newest first (most recent at top)
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDesigns(sorted);
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDesigns = () => {
    let filtered = [...designs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(design =>
        design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'favorites') {
        filtered = filtered.filter(design => favorites.has(design._id));
      } else {
        filtered = filtered.filter(design => design.room.toLowerCase() === selectedFilter.toLowerCase());
      }
    }

    setFilteredDesigns(filtered);
  };

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('aura_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const uniqueRooms = ['all', 'favorites', ...new Set(designs.map(d => d.room.toLowerCase()))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Explore Designs</h1>
          <p className="text-xl text-gray-600">Discover curated interior design inspirations</p>
        </div>
        <button 
          onClick={fetchDesigns}
          className="flex items-center gap-2 bg-[#C26A43] text-white px-4 py-2 rounded-lg hover:bg-[#A85734] transition"
        >
          <RefreshCw size={20} /> Refresh
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search designs, rooms, styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-[#C26A43] transition text-lg"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {uniqueRooms.map(room => (
            <button
              key={room}
              onClick={() => setSelectedFilter(room)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                selectedFilter === room
                  ? 'bg-[#C26A43] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {room === 'all'
                ? 'All Designs'
                : room === 'favorites'
                ? '❤️ Favorites'
                : room.charAt(0).toUpperCase() + room.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Designs Grid */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin">
            <div className="h-12 w-12 border-4 border-[#C26A43] border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600 text-lg">Loading designs...</p>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No designs found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDesigns.map((design) => (
            <div
              key={design._id}
              className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-[#C26A43] transition shadow-lg hover:shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden h-64 bg-gray-200">
                {design.imageUrl ? (
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      console.error('Failed to load image:', design.imageUrl);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => console.log('Image loaded in explore:', design.imageUrl)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(design._id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition shadow-lg z-10"
                >
                  <Heart
                    size={20}
                    className={favorites.has(design._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                  />
                </button>

                {/* "New" Badge */}
                {new Date(design.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                  <div className="absolute top-4 left-4 bg-[#C26A43] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    New
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{design.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{design.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Room:</span>
                    <span className="text-gray-600">{design.room}</span>
                  </div>

                  {design.styles && design.styles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {design.styles.slice(0, 2).map((style, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {style}
                        </span>
                      ))}
                      {design.styles.length > 2 && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          +{design.styles.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {design.moods && design.moods.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {design.moods.slice(0, 2).map((mood, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {mood}
                        </span>
                      ))}
                    </div>
                  )}

                  {design.budgetRange && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Budget:</span>
                      <span className="text-gray-600">
                        ${design.budgetRange.min?.toLocaleString() || 0} - ${design.budgetRange.max?.toLocaleString() || 0}
                      </span>
                    </div>
                  )}
                </div>

                {/* Priority Tags */}
                {design.priority && design.priority.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {design.priority.map((p, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
