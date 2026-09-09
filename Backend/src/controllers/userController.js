import { sendError } from '../middleware/errorHandler.js';
import User from '../models/User.js'
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import Team from '../models/Team.js';
import { isValidObjectId, normalizeEmail, normalizeString, escapeRegex } from '../utils/security.js';

//helper buat hapus KTM
const deleteKtmFile = async (ktmPath) => {
    if (!ktmPath || !/^\/uploads\/ktm\/[^/]+$/.test(ktmPath)) return;

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
    if (!filename || !/^(?:\d{10,}-)?[a-f\d-]{16,}\.(?:jpg|jpeg|png)$/i.test(filename)) return;

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
        const name = normalizeString(req.body.name, { max: 120, required: true });
        const email = normalizeEmail(req.body.email);
        const password = typeof req.body.password === 'string' ? req.body.password : '';
        const university = normalizeString(req.body.university, { max: 160, required: true });
        const nim = normalizeString(req.body.nim, { max: 50, required: true });

        if (!name || !email || password.length < 8 || password.length > 128 || !university || !nim) {
            if (req.file) await deleteUploadedKtm(req.file.filename);
            const errors = {};
            if (!name) errors.name = 'Enter your name (1 to 120 characters).';
            if (!email) errors.email = 'Enter a valid email address, such as name@example.com (up to 254 characters).';
            if (password.length < 8 || password.length > 128) errors.password = 'Your password must contain 8 to 128 characters.';
            if (!university) errors.university = 'Enter your university (1 to 160 characters).';
            if (!nim) errors.nim = 'Enter your NIM (1 to 50 characters).';
            return res.status(400).json({ message: Object.values(errors).join(' '), errors });
        }

        const ktm = req.file //upload ktm
            ? `/uploads/ktm/${req.file.filename}`
            : null;
        
        const role = req.user?.role === 'admin' && req.body.role ? req.body.role : 'user';

        if (!['user', 'admin'].includes(role)) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }
            return res.status(400).json({
                message: 'Choose a valid role: user or admin.'
            });
        }

        //cek uniqueness
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }
            return res.status(400).json({
                message: "This email address is already registered. Log in or use a different email address."
            });
        }
        const existingNim = await User.findOne({ nim });
        if (existingNim) {  
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }
            return res.status(400).json({
                message: "This NIM is already registered. Check your NIM or log in to your existing account."
            });
        }

        //proses buat user
        const hashedPassword = await bcrypt.hash(password, 12);
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
        return sendError(error, req, res);
    }
};

// LOGIN -- POST /api/users/login
export const loginUser = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const password = req.body?.password;
        if (!email) return res.status(400).json({ message: 'Enter a valid email address, such as name@example.com.' });
        if (typeof password !== 'string' || !password.length) return res.status(400).json({ message: 'Enter your password to log in.' });
        if (password.length > 128) return res.status(400).json({ message: 'Your password must be 128 characters or fewer.' });

        const existingUser = await User.findOne({ email }).select('+password');

        if (!existingUser) return res.status(401).json({ message: 'The email address or password is incorrect. Check both and try again.' });

        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'The email address or password is incorrect. Check both and try again.'
            });
        }

        const token = generateToken(existingUser);
        setAuthCookie(res, token);

        return res.status(200).json({
            message: 'Login successful',
            user: sanitizeUser(existingUser)
        });

    } catch (error) {
        return sendError(error, req, res);
    }
};

// LOGOUT -- POST /api/users/logout
export const logoutUser = async (req, res) => {
    try {
        clearAuthCookie(res);

        // Revoke all tokens when the current token is still verifiable.
        // Cookie removal still succeeds for expired or malformed tokens.
        if (req.user?.id) {
            await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
        }

        return res.status(200).json({
            message: 'Logout successful'
        });

    } catch (error) {
        return sendError(error, req, res);
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
        return sendError(error, req, res);
    }
};

// READ ALL USERS -- GET /api/users
export const getUser = async (req, res) => {
    try {
        const users = await User.find().select('-password -tokenVersion').limit(1000);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        } 
        return res.status(200).json(users);

    } catch (error) {
        return sendError(error, req, res);
    }
};

// READ PARTICIPANTS -- GET /api/users/participants
export const getParticipants = async (req, res) => {
    try {
        const { competitionId, excludeTeamId, nim } = req.query;

        if (typeof nim !== 'string' || nim.trim().length < 3 || nim.trim().length > 50) {
            return res.status(200).json([]);
        }

        if (competitionId && !isValidObjectId(competitionId)) {
            return res.status(400).json({ message: 'Invalid competition id' });
        }

        if (excludeTeamId && !isValidObjectId(excludeTeamId)) {
            return res.status(400).json({ message: 'Invalid team id' });
        }

        const unavailableUserIds = [];

        if (competitionId) {
            const teamQuery = { competitionId };

            if (excludeTeamId) {
                teamQuery._id = { $ne: excludeTeamId };
            }

            const teams = await Team.find(teamQuery).select('leaderId members');

            teams.forEach((team) => {
                if (team.leaderId) {
                    unavailableUserIds.push(team.leaderId.toString());
                }

                team.members.forEach((memberId) => {
                    unavailableUserIds.push(memberId.toString());
                });
            });
        }

        const userQuery = {
            nim: { $regex: escapeRegex(nim.trim().slice(0, 50)), $options: 'i' }
        };

        if (unavailableUserIds.length > 0) {
            userQuery._id = { $nin: unavailableUserIds };
        }

        const users = await User.find(userQuery)
            .select('name email university nim')
            .limit(5)
            .sort({ name: 1 });

        return res.status(200).json(users);

    } catch (error) {
        return sendError(error, req, res);
    }
};

// READ USER BY ID -- GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
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
        return sendError(error, req, res);
    }
};

// UPDATE USER -- PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            if (req.file) await deleteUploadedKtm(req.file.filename);
            return res.status(400).json({ message: 'Invalid user id' });
        }

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
        const allowedFields = ['name', 'email', 'password', 'university', 'nim', 'role'];
        const updateData = Object.fromEntries(
            allowedFields
                .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
                .map((field) => [field, req.body[field]])
        );

        if (updateData.name !== undefined) updateData.name = normalizeString(updateData.name, { max: 120, required: true });
        if (updateData.email !== undefined) updateData.email = normalizeEmail(updateData.email);
        if (updateData.university !== undefined) updateData.university = normalizeString(updateData.university, { max: 160, required: true });
        if (updateData.nim !== undefined) updateData.nim = normalizeString(updateData.nim, { max: 50, required: true });

        if (Object.values(updateData).some((value) => value === null)) {
            if (req.file) await deleteUploadedKtm(req.file.filename);
            const hints = { name: 'Name must contain 1 to 120 characters.', email: 'Enter a valid email address up to 254 characters.', university: 'University must contain 1 to 160 characters.', nim: 'NIM must contain 1 to 50 characters.', password: 'Password must contain 8 to 128 characters.', role: 'Choose a valid role: user or admin.' };
            return res.status(400).json({ message: Object.keys(updateData).filter((key) => updateData[key] === null).map((key) => hints[key]).join(' ') });
        }

        if (req.file) { //kalau user upload ktm baru
            updateData.ktm = `/uploads/ktm/${req.file.filename}`;
        }

        const shouldRevokeTokens = Boolean(updateData.password);

        if (updateData.password && (typeof updateData.password !== 'string' || updateData.password.length < 8 || updateData.password.length > 128)) {
            if (req.file) await deleteUploadedKtm(req.file.filename);
            return res.status(400).json({ message: 'Password must be 8 to 128 characters' });
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12);
        }

        if (updateData.role && !["user", "admin"].includes(updateData.role)) {
            if (req.file) {
                await deleteUploadedKtm(req.file.filename);
            }

            return res.status(400).json({
                message: "Choose a valid role: user or admin."
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

        return sendError(error, req, res);
    }
};

// DELETE USER -- DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
       if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

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
        return sendError(error, req, res);
    }
};
