const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let mongoServer;
let Plant;

async function startServer() {
    try {
        // Spin up in-memory MongoDB instance
        mongoServer = await MongoMemoryServer.create();
        const MONGO_URI = mongoServer.getUri();

        await mongoose.connect(MONGO_URI);
        console.log('Connected to In-Memory MongoDB successfully!');

        // Define Schema & Model
        const plantSchema = new mongoose.Schema({
            name: { type: String, required: true },
            scientificName: { type: String, required: true },
            sunlight: String,
            soil: String,
            heightInches: Number,
            bloomSeason: String
        });

        Plant = mongoose.model('Plant', plantSchema);

        // Seed initial records if empty
        const count = await Plant.countDocuments();
        if (count === 0) {
            await Plant.insertMany([
                { name: 'Purple Coneflower', scientificName: 'Echinacea purpurea', sunlight: 'Full Sun', soil: 'Loam', heightInches: 36, bloomSeason: 'Summer' },
                { name: 'Butterfly Weed', scientificName: 'Asclepias tuberosa', sunlight: 'Full Sun', soil: 'Sand', heightInches: 24, bloomSeason: 'Summer' },
                { name: 'Wild Bergamot', scientificName: 'Monarda fistulosa', sunlight: 'Part Shade', soil: 'Clay', heightInches: 30, bloomSeason: 'Summer' },
                { name: 'Black-Eyed Susan', scientificName: 'Rudbeckia hirta', sunlight: 'Full Sun', soil: 'Loam', heightInches: 28, bloomSeason: 'Summer' },
                { name: 'Joe Pye Weed', scientificName: 'Eutrochium purpureum', sunlight: 'Full Sun', soil: 'Moist Loam', heightInches: 72, bloomSeason: 'Late Summer' }
            ]);
            console.log('Seeded initial plant records.');
        }

        // API Routes
        app.get('/plants', async (req, res) => {
            try {
                const plants = await Plant.find({});
                res.json(plants);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/plants/:id', async (req, res) => {
            try {
                const plant = await Plant.findById(req.params.id);
                if (!plant) return res.status(404).json({ message: 'Plant not found' });
                res.json(plant);
            } catch (err) {
                res.status(400).json({ error: 'Invalid ID' });
            }
        });

        app.post('/plants', async (req, res) => {
            try {
                const newPlant = new Plant(req.body);
                const savedPlant = await newPlant.save();
                res.status(201).json(savedPlant);
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        });

        app.put('/plants/:id', async (req, res) => {
            try {
                const updatedPlant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedPlant) return res.status(404).json({ message: 'Plant not found' });
                res.json(updatedPlant);
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        });

        app.delete('/plants/:id', async (req, res) => {
            try {
                const deletedPlant = await Plant.findByIdAndDelete(req.params.id);
                if (!deletedPlant) return res.status(404).json({ message: 'Plant not found' });
                res.json(deletedPlant);
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        });

        app.listen(PORT, () => {
            console.log(`Express server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Database connection error:', err);
    }
}

startServer();
