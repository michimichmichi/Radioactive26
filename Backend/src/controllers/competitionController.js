import Competition from '../models/competition.js';

// CREATE -- POST /api/competitions
export const createCompetition = async (req, res) => {
    try {
        const { competitionName, time, place, termsAndConditions } = req.body;

        const newCompetition = await Competition.create({
            competitionName, time, place, termsAndConditions
        });
        res.status(201).json(newCompetition);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// READ -- GET /api/competitions
export const getCompetition = async (req, res) => { 
    try {
        const comps = await Competition.find();
        res.status(200).json(comps);

    } catch (error) { 
        res.status(500).json({ message: error.message });
    }
}

// UPDATE -- PUT /api/competitions/:id
export const updateCompetition = async (req, res) => {
    try {
        const updatedComp = await Competition.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json(updatedComp);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// DELETE -- DELETE /api/competitions/:id
export const deleteCompetition = async (req, res) => {
    try {
        await Competition.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Competition deleted successfully' });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};