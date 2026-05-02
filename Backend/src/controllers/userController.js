import user from '../models/user.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.js';

// REGISTER -- POST /api/users/register
export const createUser = async (req, res) => {
    try {
        const { name, email, password, university, ktm } = req.body;

        const existingUser = await user.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await user.create({
            name,
            email,
            password: hashedPassword,
            university,
            ktm
        });

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                university: newUser.university,
                ktm: newUser.ktm
            }
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

// LOGIN -- POST /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await user.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(existingUser);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                university: existingUser.university,
                ktm: existingUser.ktm
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// READ ALL USERS -- GET /api/users
export const getUser = async (req, res) => {
    try {
        const users = await user.find().select('-password');

        if (!users.length) {
            return res.status(404).json({
                message: 'No users found'
            });
        }

        return res.status(200).json(users);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// READ USER BY ID -- GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const foundUser = await user
            .findById(req.params.id)
            .select('-password');

        if (!foundUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json(foundUser);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// UPDATE USER -- PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(
                updateData.password,
                10
            );
        }

        const updatedUser = await user
            .findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            )
            .select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json(updatedUser);

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

// DELETE USER -- DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await user.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};