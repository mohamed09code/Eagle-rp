const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Get port from environment variable, default to 3000 if not set
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'localhost';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Enhanced User Schema with more detailed fields
const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'يرجى إدخال بريد إلكتروني صحيح']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    profile: {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        phoneNumber: String,
        address: {
            street: String,
            city: String,
            country: String
        }
    },
    roles: {
        type: [{ 
            type: String, 
            enum: ['user', 'admin', 'moderator', 'support', 'developer']
        }],
        default: ['user']
    },
    permissions: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'banned'],
        default: 'inactive'
    },
    accountMetrics: {
        loginCount: { type: Number, default: 0 },
        lastLogin: Date,
        registrationDate: { type: Date, default: Date.now },
        reputation: { type: Number, default: 0 }
    },
    socialConnections: {
        discord: {
            id: String,
            username: String,
            verified: { type: Boolean, default: false }
        },
        gameProfiles: [{
            game: String,
            username: String,
            verified: { type: Boolean, default: false }
        }]
    },
    notifications: [{
        type: {
            type: String,
            enum: ['system', 'application', 'message', 'update']
        },
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: String,
        failedLoginAttempts: { type: Number, default: 0 },
        lastFailedLogin: Date
    }
});

const User = mongoose.model('User', UserSchema);

// Application Schema and Model
const ApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gameName: { type: String, required: true },
    discordLink: { type: String, required: true },
    age: { type: Number, required: true },
    rpExperience: { type: String, required: true },
    joinReason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'under_review', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    submissionDate: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', ApplicationSchema);

// Support Ticket Schema and Model
const SupportTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    playerName: { type: String, required: true },
    discordLink: { type: String, required: true },
    issueType: { type: String, required: true },
    issueDetails: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['processing', 'resolved', 'rejected'], 
        default: 'processing' 
    },
    adminResponse: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

// Notification Schema and Model
const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['ticket', 'application', 'update', 'general'], 
        default: 'general' 
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Authentication Routes
app.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, username: newUser.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Application Routes
app.post('/applications/submit', authenticateToken, async (req, res) => {
    try {
        const { gameName, discordLink, age, rpExperience, joinReason } = req.body;
        
        const newApplication = new Application({
            userId: req.user.id,
            gameName,
            discordLink,
            age,
            rpExperience,
            joinReason
        });

        await newApplication.save();

        // Create notification for admin
        const adminNotification = new Notification({
            title: 'New Application Received',
            message: `New application from ${gameName}`,
            type: 'application'
        });
        await adminNotification.save();

        res.status(201).json({ 
            message: 'Application submitted successfully', 
            applicationId: newApplication._id 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});

// Support Ticket Routes
app.post('/support/tickets', authenticateToken, async (req, res) => {
    try {
        const { playerName, discordLink, issueType, issueDetails } = req.body;
        
        const newTicket = new SupportTicket({
            userId: req.user.id,
            playerName,
            discordLink,
            issueType,
            issueDetails
        });

        await newTicket.save();

        // Create notification for admin
        const adminNotification = new Notification({
            title: 'New Support Ticket',
            message: `New ticket from ${playerName} - ${issueType}`,
            type: 'ticket'
        });
        await adminNotification.save();

        res.status(201).json({ 
            message: 'Ticket submitted successfully', 
            ticketId: newTicket._id 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting ticket', error: error.message });
    }
});

// Notification Routes
app.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            userId: req.user.id 
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
});

// Admin Routes
app.get('/admin/applications', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.roles !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const applications = await Application.find().sort({ submissionDate: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

app.put('/admin/applications/:id/status', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.roles !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Create notification for user
        const notification = new Notification({
            userId: application.userId,
            title: 'Application Status Update',
            message: `Your application status has been updated to ${status}`,
            type: 'application'
        });
        await notification.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
});

// User Management Routes
app.get('/admin/users', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (!user || !user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Retrieve users with filtered sensitive information
        const users = await User.find({}, {
            password: 0, 
            'security.twoFactorSecret': 0
        }).sort({ 'accountMetrics.registrationDate': -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching users', 
            error: error.message 
        });
    }
});

// User Profile Update Route
app.put('/users/profile', authenticateToken, async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            phoneNumber, 
            address,
            socialConnections 
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { 
                $set: {
                    'profile.firstName': firstName,
                    'profile.lastName': lastName,
                    'profile.phoneNumber': phoneNumber,
                    'profile.address': address,
                    'socialConnections': socialConnections
                }
            },
            { new: true, select: '-password -security' }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
});

// Admin User Management Routes
app.put('/admin/users/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status, reason } = req.body;
        
        // Verify admin permissions
        const adminUser = await User.findById(req.user.id);
        if (!adminUser.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { 
                status, 
                $push: { 
                    notifications: {
                        type: 'system',
                        message: `حالة حسابك تم تحديثها: ${status}. ${reason || ''}`
                    }
                } 
            },
            { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating user status', 
            error: error.message 
        });
    }
});

// Mass User Actions
app.post('/admin/users/bulk-action', authenticateToken, async (req, res) => {
    try {
        const { userIds, action, reason } = req.body;
        
        // Verify admin permissions
        const adminUser = await User.findById(req.user.id);
        if (!adminUser.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        let updateResult;
        switch(action) {
            case 'activate':
                updateResult = await User.updateMany(
                    { _id: { $in: userIds } },
                    { 
                        status: 'active',
                        $push: { 
                            notifications: {
                                type: 'system',
                                message: `تم تفعيل حسابك. ${reason || ''}`
                            }
                        }
                    }
                );
                break;
            case 'suspend':
                updateResult = await User.updateMany(
                    { _id: { $in: userIds } },
                    { 
                        status: 'suspended',
                        $push: { 
                            notifications: {
                                type: 'system',
                                message: `تم تعليق حسابك. ${reason || ''}`
                            }
                        }
                    }
                );
                break;
            case 'ban':
                updateResult = await User.updateMany(
                    { _id: { $in: userIds } },
                    { 
                        status: 'banned',
                        $push: { 
                            notifications: {
                                type: 'system',
                                message: `تم حظر حسابك. ${reason || ''}`
                            }
                        }
                    }
                );
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        res.json({
            message: `تم ${action} لـ ${updateResult.modifiedCount} مستخدم`,
            modifiedCount: updateResult.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'خطأ في تنفيذ الإجراء الجماعي', 
            error: error.message 
        });
    }
});

// User Search Route
app.get('/admin/users/search', authenticateToken, async (req, res) => {
    try {
        const { query, status, role } = req.query;
        
        // Verify admin permissions
        const adminUser = await User.findById(req.user.id);
        if (!adminUser.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const searchConditions = {};

        if (query) {
            searchConditions.$or = [
                { username: { $regex: query, $options: 'i' } },
                { 'email': { $regex: query, $options: 'i' } },
                { 'profile.firstName': { $regex: query, $options: 'i' } },
                { 'profile.lastName': { $regex: query, $options: 'i' } }
            ];
        }

        if (status) {
            searchConditions.status = status;
        }

        if (role) {
            searchConditions.roles = role;
        }

        const users = await User.find(
            searchConditions, 
            { password: 0, 'security.twoFactorSecret': 0 }
        ).limit(50);

        res.json(users);
    } catch (error) {
        res.status(500).json({ 
            message: 'خطأ في البحث عن المستخدمين', 
            error: error.message 
        });
    }
});

// User Detailed Statistics Route
app.get('/admin/users/statistics', authenticateToken, async (req, res) => {
    try {
        // Verify admin permissions
        const adminUser = await User.findById(req.user.id);
        if (!adminUser.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    averageReputation: { $avg: '$accountMetrics.reputation' }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    averageReputation: { $round: ['$averageReputation', 2] }
                }
            }
        ]);

        const totalUsers = await User.countDocuments();
        const recentRegistrations = await User.countDocuments({
            'accountMetrics.registrationDate': { 
                $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
            }
        });

        res.json({
            totalUsers,
            recentRegistrations,
            statusBreakdown: stats
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'خطأ في جلب إحصائيات المستخدمين', 
            error: error.message 
        });
    }
});

// Server start
app.listen(PORT, DOMAIN, () => {
    console.log(`🚀 Server running on ${DOMAIN}:${PORT}`);
    console.log(`🔗 Connected to MongoDB`);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, User };