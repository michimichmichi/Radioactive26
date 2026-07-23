import Competition from '../models/Competition.js';
import { normalizeString, isValidObjectId } from '../utils/security.js';

// CREATE -- POST /api/competitions
export const createCompetition = async (req, res) => {
    try {
        const { competitionName, time, place, termsAndConditions } = req.body;

        const normalizedName = normalizeString(competitionName, { max: 120, required: true });
        const normalizedPlace = normalizeString(place, { max: 200, required: true });
        const normalizedTerms = normalizeString(termsAndConditions, { max: 5000, required: true });
        const parsedTime = new Date(time);

        if (!normalizedName || !normalizedPlace || !normalizedTerms || Number.isNaN(parsedTime.getTime())) {
            return res.status(400).json({ message: 'Invalid competition data' });
        }

        const newCompetition = await Competition.create({
            competitionName: normalizedName,
            time: parsedTime,
            place: normalizedPlace,
            termsAndConditions: normalizedTerms
        });
        res.status(201).json(newCompetition);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// READ -- GET /api/competitions
export const getCompetition = async (req, res) => { 
    try {
        const comps = await Competition.find().limit(100);
        res.status(200).json(comps);

    } catch (error) { 
        res.status(500).json({ message: error.message });
    }
}

// UPDATE -- PUT /api/competitions/:id
export const updateCompetition = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid competition id' });
        }

        const allowedFields = ['competitionName', 'time', 'place', 'termsAndConditions'];
        const updateData = Object.fromEntries(
            allowedFields
                .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
                .map((field) => [field, req.body[field]])
        );

        if (updateData.competitionName !== undefined) {
            updateData.competitionName = normalizeString(updateData.competitionName, { max: 120, required: true });
        }
        if (updateData.place !== undefined) {
            updateData.place = normalizeString(updateData.place, { max: 200, required: true });
        }
        if (updateData.termsAndConditions !== undefined) {
            updateData.termsAndConditions = normalizeString(updateData.termsAndConditions, { max: 5000, required: true });
        }
        if (updateData.time !== undefined) {
            updateData.time = new Date(updateData.time);
        }

        if (!Object.keys(updateData).length || Object.values(updateData).some((value) => value === null || (value instanceof Date && Number.isNaN(value.getTime())))) {
            return res.status(400).json({ message: 'Invalid competition data' });
        }

        const updatedComp = await Competition.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedComp) return res.status(404).json({ message: 'Competition not found' });
        res.status(200).json(updatedComp);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// DELETE -- DELETE /api/competitions/:id
export const deleteCompetition = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid competition id' });
        }

        const deleted = await Competition.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Competition not found' });
        res.status(200).json({ message: 'Competition deleted successfully' });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
