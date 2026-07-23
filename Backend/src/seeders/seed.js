import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Competition from '../models/Competition.js';
import Team from '../models/Team.js';

dotenv.config();

const password = process.env.SEED_USER_PASSWORD;

const userSeeds = [
    {
        name: 'Alya Putri',
        email: 'alya.putri@example.com',
        university: 'Universitas Indonesia',
        nim: '26010001',
        ktm: 'https://example.com/ktm/alya-putri'
    },
    {
        name: 'Bima Pratama',
        email: 'bima.pratama@example.com',
        university: 'Institut Teknologi Bandung',
        nim: '26010002',
        ktm: 'https://example.com/ktm/bima-pratama'
    },
    {
        name: 'Citra Lestari',
        email: 'citra.lestari@example.com',
        university: 'Universitas Gadjah Mada',
        nim: '26010003',
        ktm: 'https://example.com/ktm/citra-lestari'
    },
    {
        name: 'Dimas Saputra',
        email: 'dimas.saputra@example.com',
        university: 'Universitas Airlangga',
        nim: '26010004',
        ktm: 'https://example.com/ktm/dimas-saputra'
    }
];

const competitionSeeds = [
    {
        competitionName: 'Radio Drama Challenge',
        time: new Date('2026-08-10T09:00:00.000Z'),
        place: 'Main Auditorium',
        termsAndConditions: 'Teams create and perform an original radio drama with clear story, audio quality, and teamwork.'
    },
    {
        competitionName: 'Podcast Battle',
        time: new Date('2026-08-12T10:00:00.000Z'),
        place: 'Broadcast Studio',
        termsAndConditions: 'Participants produce a short podcast episode based on the given theme.'
    },
    {
        competitionName: 'News Anchor Sprint',
        time: new Date('2026-08-14T13:00:00.000Z'),
        place: 'Media Lab',
        termsAndConditions: 'Participants read and present breaking news with accuracy, clarity, and confidence.'
    }
];

const teamSeeds = [
    {
        teamName: 'Frequency Force',
        leaderEmail: 'alya.putri@example.com',
        memberEmails: ['bima.pratama@example.com'],
        competitionName: 'Radio Drama Challenge',
        buktiTransfer: 'https://example.com/payment/frequency-force'
    },
    {
        teamName: 'Wave Makers',
        leaderEmail: 'citra.lestari@example.com',
        memberEmails: ['dimas.saputra@example.com'],
        competitionName: 'Podcast Battle',
        buktiTransfer: 'https://example.com/payment/wave-makers'
    },
    {
        teamName: 'Signal Squad',
        leaderEmail: 'bima.pratama@example.com',
        memberEmails: ['alya.putri@example.com', 'citra.lestari@example.com'],
        competitionName: 'News Anchor Sprint',
        buktiTransfer: 'https://example.com/payment/signal-squad'
    }
];

const seedUsers = async () => {
    const hashedPassword = await bcrypt.hash(password, 12);

    for (const user of userSeeds) {
        await User.findOneAndUpdate(
            { email: user.email },
            {
                $setOnInsert: {
                    ...user,
                    password: hashedPassword,
                    role: 'user',
                    tokenVersion: 0
                }
            },
            { upsert: true, new: true, runValidators: true }
        );
    }
};

const seedCompetitions = async () => {
    for (const competition of competitionSeeds) {
        await Competition.findOneAndUpdate(
            { competitionName: competition.competitionName },
            { $setOnInsert: competition },
            { upsert: true, new: true, runValidators: true }
        );
    }
};

const seedTeams = async () => {
    for (const team of teamSeeds) {
        const leader = await User.findOne({ email: team.leaderEmail });
        const members = await User.find({ email: { $in: team.memberEmails } });
        const competition = await Competition.findOne({
            competitionName: team.competitionName
        });

        if (!leader || !competition || members.length !== team.memberEmails.length) {
            throw new Error(`Missing seed dependency for team: ${team.teamName}`);
        }

        await Team.findOneAndUpdate(
            { teamName: team.teamName },
            {
                $setOnInsert: {
                    teamName: team.teamName,
                    leaderId: leader._id,
                    members: members.map((member) => member._id),
                    competitionId: competition._id,
                    buktiTransfer: team.buktiTransfer
                }
            },
            { upsert: true, new: true, runValidators: true }
        );
    }
};

const seed = async () => {
    try {
        if (!password || password.length < 8) {
            throw new Error('SEED_USER_PASSWORD must be configured and at least 8 characters long');
        }

        await connectDB();
        await seedUsers();
        await seedCompetitions();
        await seedTeams();

        console.log('Seed data inserted successfully.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(`Seeder failed: ${error.message}`);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seed();
