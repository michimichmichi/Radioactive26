import User from '../models/User.js'
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.js';

//helper buat hapus KTM
const deleteKtmFile = async (ktmPath) => {
    if (!ktmPath) return;

    const filePath = path.join(
        process.cwd(),
        "src",
        ktmPath.replace(/^\//, "")
    );

    try {
        await fs.unlink(filePath);
    } catch (err) {
        console.warn("Failed to delete KTM:", err.message);
    }
};
const deleteUploadedKtm = async (filename) => {
    if (!filename) return;

    const filePath = path.join(
        process.cwd(),
        "src",
        "uploads",
        "ktm",
        filename
    );

    try {
        await fs.unlink(filePath);
    } catch (err) {
        console.warn("Failed to delete uploaded KTM:", err.message);
    }
};

const sanitizeUser = (user) => {
    const response = user.toObject ? user.toObject() : { ...user };
    delete response.password;
    delete response.tokenVersion;
    response.role = response.role || 'user';
    return response;
};

// REGISTER -- POST /api/users/register
export const createUser = async (req, res) => {
    try {
        const { name, email, password, university, nim } = req.body;

        const ktm = req.file //upload ktm
            ? `/uploads/ktm/${req.file.filename}`
            : null;
        
        const role = req.user?.role === 'admin' && req.body.role ? req.body.role : 'user';

        if (!['user', 'admin'].includes(role)) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }
            return res.status(400).json({
                message: 'Invalid user role'
            });
        }

        //cek uniqueness
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        const existingNim = await User.findOne({ nim });
        if (existingNim) {  
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }
            return res.status(400).json({
                message: "NIM already exists"
            });
        }

        //proses buat user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name, email, password: hashedPassword, university, ktm, nim, role
        });

        if (req.user?.role === 'admin') {
            return res.status(201).json(sanitizeUser(newUser));
        }

        return res.status(201).json({
            message: 'Registration successful',
            user: sanitizeUser(newUser)
        });

    } catch (error) {
        if (req.file) {
            await deleteUploadedKtm(req.file.filename);
        }
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email atau NIM sudah digunakan"
            });
        }
        return res.status(400).json({ message: error.message });
    }
};

// LOGIN -- POST /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

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
            user: sanitizeUser(existingUser)
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// LOGOUT -- POST /api/users/logout
export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });

        return res.status(200).json({
            message: 'Logout successful'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// CURRENT USER -- GET /api/users/me
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -tokenVersion');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// READ ALL USERS -- GET /api/users
export const getUser = async (req, res) => {
    try {
        const users = await User.find().select('-password -tokenVersion');
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
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
        const foundUser = await User
            .findById(req.params.id)
            .select('-password -tokenVersion');

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
        const existingUser = await User.findById(req.params.id); // cari user lama
        if (!existingUser) { // hapus file kalo gaada usernya
           if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }

            return res.status(404).json({
                message: "User not found"
            });
        }

        const oldKtm = existingUser.ktm;
        const updateData = { ...req.body };

        if (req.file) { //kalau user upload ktm baru
            updateData.ktm = `/uploads/ktm/${req.file.filename}`;
        }

        const shouldRevokeTokens = Boolean(updateData.password);

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        if (updateData.role && !["user", "admin"].includes(updateData.role)) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }

            return res.status(400).json({
                message: "Invalid user role"
            });
        }

        delete updateData.tokenVersion;

        const updateOperation = shouldRevokeTokens
            ? {
                  $set: updateData,
                  $inc: { tokenVersion: 1 }
              }
            : {
                  $set: updateData
              };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateOperation,
            {
                new: true,
                runValidators: true
            }
        ).select("-password -tokenVersion");

        if (!updatedUser) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }

            return res.status(404).json({
                message: "User not found"
            });
        }

        if (req.file && oldKtm) { //hapus ktm lama kalo berhasil update ktm baru
            await deleteKtmFile(oldKtm);
        }

        return res.status(200).json(updatedUser);

    } catch (error) {
        if (req.file) {
            await deleteUploadedKtm(req.file.filename);
        }

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email or NIM is already used"
            });
        }

        return res.status(400).json({
            message: error.message
        });
    }
};

// DELETE USER -- DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
       const deletedUser = await User.findById(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await deleteKtmFile(deletedUser.ktm);

        await User.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};