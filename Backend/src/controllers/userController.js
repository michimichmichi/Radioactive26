import user from '../models/user.js'

// CREATE -- POST /api/users 
export const createUser = async (req, res) => {
    try {
        const { name, email, password, university, ktm } = req.body;
        
        const newUser = await user.create({
            name, email, password, university, ktm
        });
        res.status(201).json(newUser);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// READ -- GET /api/users
export const getUser = async (req, res) => {
    try {
        const users = await user.find().select('-password');;
        if (users.length === 0) {
            res.status(404).json({ message: 'No users found' });
        } else {
            res.status(200).json(users);
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        const userId = await user.findById(req.params.id).select('-password');;
        if (!userId) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(userId);
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// UPDATE -- PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await user.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// DELETE -- DELETE /api/users/:id
export const deleteUser = async (req, res) => { 
    try {
        await user.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}