import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, RefreshCw } from 'lucide-react';
import { API_URL } from '../config';

export default function ExploreTab() {
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [favorites, setFavorites] = useState(
    new Set(JSON.parse(localStorage.getItem('aura_favorites') || '[]'))
  );

  // Fetch designs on mount
  useEffect(() => {
    fetchDesigns();

    const interval = setInterval(fetchDesigns, 3000);

    return () => clearInterval(interval);
  }, []);

  // Filter when values change
  useEffect(() => {
    filterDesigns();
  }, [designs, searchTerm, selectedFilter]);



  // UPDATED API URL (Render backend)
  const fetchDesigns = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/admin/designs`);

      const data = await response.json();

      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setDesigns(sorted);

    } catch (error) {
      console.error("Error fetching designs:", error);
    } finally {
      setLoading(false);
    }
  };



  const filterDesigns = () => {
    let filtered = [...designs];

    // search filter
    if (searchTerm) {
      filtered = filtered.filter(design =>
        design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // category filter
    if (selectedFilter !== "all") {

      if (selectedFilter === "favorites") {
        filtered = filtered.filter(design =>
          favorites.has(design._id)
        );

      } else {

        filtered = filtered.filter(design =>
          design.room.toLowerCase() === selectedFilter.toLowerCase()
        );

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

    localStorage.setItem(
      "aura_favorites",
      JSON.stringify(Array.from(newFavorites))
    );

  };



  const uniqueRooms = [
    "all",
    "favorites",
    ...new Set(designs.map(d => d.room.toLowerCase()))
  ];



  return (

    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* heading */}

      <div className="mb-12 flex justify-between items-center">

        <div>

          <h1 className="text-5xl font-bold mb-4">
            Explore Designs
          </h1>

          <p className="text-xl text-gray-600">
            Discover interior inspirations
          </p>

        </div>



        <button

          onClick={fetchDesigns}

          className="bg-[#C26A43] text-white px-4 py-2 rounded-lg flex gap-2 items-center"

        >

          <RefreshCw size={18} />

          Refresh

        </button>

      </div>



      {/* search */}

      <div className="mb-6">

        <input

          type="text"

          placeholder="Search designs"

          value={searchTerm}

          onChange={e => setSearchTerm(e.target.value)}

          className="border p-3 w-full rounded-lg"

        />

      </div>



      {/* filter buttons */}

      <div className="flex gap-3 flex-wrap mb-8">

        {uniqueRooms.map(room => (

          <button

            key={room}

            onClick={() => setSelectedFilter(room)}

            className={`px-4 py-2 rounded-full ${
              selectedFilter === room
                ? "bg-[#C26A43] text-white"
                : "bg-gray-200"
            }`}

          >

            {room}

          </button>

        ))}

      </div>



      {/* loading */}

      {loading && (

        <p>Loading...</p>

      )}



      {/* no data */}

      {!loading && filteredDesigns.length === 0 && (

        <p>No designs found</p>

      )}



      {/* cards */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredDesigns.map(design => (

          <div

            key={design._id}

            className="border rounded-xl overflow-hidden shadow"

          >

            {design.imageUrl && (

              <img

                src={design.imageUrl}

                alt={design.name}

                className="h-60 w-full object-cover"

              />

            )}



            <div className="p-4">

              <h3 className="font-bold text-lg">

                {design.name}

              </h3>



              <p className="text-gray-600 text-sm">

                {design.description}

              </p>



              <p className="text-sm mt-2">

                Room: {design.room}

              </p>



              <button

                onClick={() => toggleFavorite(design._id)}

                className="mt-3"

              >

                <Heart

                  className={

                    favorites.has(design._id)

                      ? "text-red-500"

                      : "text-gray-400"

                  }

                />

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}