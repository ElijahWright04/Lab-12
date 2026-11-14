import React, { useState, useEffect } from 'react';

export default function PlantApiData() {
    const [plants, setPlants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ name: '', scientificName: '', sunlight: '', soil: '', heightInches: '', bloomSeason: '' });
    const [editingId, setEditingId] = useState(null);

    const API_URL = 'http://localhost:5000/plants';

    useEffect(() => {
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setPlants(data);
        } catch (err) {
            console.error('Error fetching plants:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Edit / Update existing plant
                const res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const updated = await res.json();
                setPlants(plants.map(p => p._id === editingId ? updated : p));
                setEditingId(null);
            } else {
                // Add new plant
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const newPlant = await res.json();
                setPlants([...plants, newPlant]);
            }
            setFormData({ name: '', scientificName: '', sunlight: '', soil: '', heightInches: '', bloomSeason: '' });
        } catch (err) {
            console.error('Error saving plant:', err);
        }
    };

    const handleEdit = (plant) => {
        setEditingId(plant._id);
        setFormData({
            name: plant.name || '',
            scientificName: plant.scientificName || '',
            sunlight: plant.sunlight || '',
            soil: plant.soil || '',
            heightInches: plant.heightInches || '',
            bloomSeason: plant.bloomSeason || ''
        });
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            setPlants(plants.filter(p => p._id !== id));
        } catch (err) {
            console.error('Error deleting plant:', err);
        }
    };

    // Live search filter across name and scientific name
    const filteredPlants = plants.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Native Plant Manager (React ↔ Express ↔ MongoDB)</h2>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search plants by name or scientific name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '8px', width: '100%', fontSize: '16px', boxSizing: 'border-box' }}
                />
            </div>

            {/* Add / Edit Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', background: '#f9f9f9' }}>
                <h3>{editingId ? 'Edit Plant Record' : 'Add New Plant Record'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{padding: '8px'}} />
                    <input type="text" placeholder="Scientific Name" value={formData.scientificName} onChange={e => setFormData({...formData, scientificName: e.target.value})} required style={{padding: '8px'}} />
                    <input type="text" placeholder="Sunlight" value={formData.sunlight} onChange={e => setFormData({...formData, sunlight: e.target.value})} style={{padding: '8px'}} />
                    <input type="text" placeholder="Soil" value={formData.soil} onChange={e => setFormData({...formData, soil: e.target.value})} style={{padding: '8px'}} />
                    <input type="number" placeholder="Height (Inches)" value={formData.heightInches} onChange={e => setFormData({...formData, heightInches: e.target.value})} style={{padding: '8px'}} />
                    <input type="text" placeholder="Bloom Season" value={formData.bloomSeason} onChange={e => setFormData({...formData, bloomSeason: e.target.value})} style={{padding: '8px'}} />
                </div>
                <div style={{ marginTop: '15px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        {editingId ? 'Update Plant' : 'Add Plant'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', scientificName: '', sunlight: '', soil: '', heightInches: '', bloomSeason: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            
            {/* Plant List Display */}
            <h3>Plant Catalog ({filteredPlants.length})</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {filteredPlants.map(plant => (
                    <li key={plant._id} style={{ border: '1px solid #ddd', margin: '10px 0', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                        <div>
                            <strong>{plant.name}</strong> <em>({plant.scientificName})</em><br />
                            <small>Sunlight: {plant.sunlight} | Soil: {plant.soil} | Height: {plant.heightInches} in | Bloom: {plant.bloomSeason}</small>
                        </div>
                        <div>
                            <button onClick={() => handleEdit(plant)} style={{ marginRight: '8px', padding: '6px 12px', background: '#ffc107', border: 'none', cursor: 'pointer', borderRadius: '3px' }}>Edit</button>
                            <button onClick={() => handleDelete(plant._id)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
