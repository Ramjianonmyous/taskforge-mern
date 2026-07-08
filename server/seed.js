require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  avatar: String,
  department: String,
  isActive: Boolean,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Project = mongoose.model('Project', new mongoose.Schema({
  name: String,
  description: String,
  status: String,
  startDate: Date,
  endDate: Date,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  dueDate: String,
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

const seedUsers = async () => {
  try {
    console.log('SEED SCRIPT MONGODB_URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB:', mongoose.connection.host, mongoose.connection.port, mongoose.connection.name);

    // Clear existing data
    const before = await Project.find({});
    console.log('PROJECTS BEFORE CLEARING:', before.map(p => p.name));
    await User.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create demo users
    const demoUsers = [
      {
        name: 'Alex Morgan',
        email: 'alex@taskforge.io',
        password: 'admin123',
        role: 'admin',
        avatar: '#e85d3a',
        department: 'Management',
        isActive: true,
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@taskforge.io',
        password: 'pass123',
        role: 'manager',
        avatar: '#a78bfa',
        department: 'Engineering',
        isActive: true,
      },
      {
        name: 'James Wilson',
        email: 'james@taskforge.io',
        password: 'pass123',
        role: 'member',
        avatar: '#60a5fa',
        department: 'Engineering',
        isActive: true,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@taskforge.io',
        password: 'pass123',
        role: 'member',
        avatar: '#34d399',
        department: 'Engineering',
        isActive: true,
      },
      {
        name: 'Marcus Lee',
        email: 'marcus@taskforge.io',
        password: 'pass123',
        role: 'member',
        avatar: '#fbbf24',
        department: 'Engineering',
        isActive: true,
      },
    ];

    // Hash passwords before insertMany since it bypasses pre-save hooks
    for (let u of demoUsers) {
      const salt = await bcrypt.genSalt(10);
      u.password = await bcrypt.hash(u.password, salt);
    }

    const createdUsers = await User.insertMany(demoUsers);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Map user emails to IDs
    const userMap = {};
    createdUsers.forEach(u => { userMap[u.email] = u._id; });

    // Create projects
    const demoProjects = [
      {
        name: 'TaskForge Dashboard Redesign',
        description: 'Overhaul the core web dashboard with modern UI/UX principles, glassmorphism, and responsive components.',
        status: 'ongoing',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-01-15'),
        members: [userMap['alex@taskforge.io'], userMap['james@taskforge.io'], userMap['priya@taskforge.io']],
      },
      {
        name: 'SSO Enterprise Integration',
        description: 'Add single sign-on (SSO) support via SAML and OpenID Connect for corporate team deployments.',
        status: 'upcoming',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-03-01'),
        members: [userMap['alex@taskforge.io'], userMap['sarah@taskforge.io']],
      },
      {
        name: 'Mobile App Phase 1',
        description: 'Build responsive views and core dashboard layouts optimized for native mobile wrappers.',
        status: 'completed',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-20'),
        members: [userMap['sarah@taskforge.io'], userMap['james@taskforge.io'], userMap['marcus@taskforge.io']],
      },
    ];

    const createdProjects = await Project.insertMany(demoProjects);
    console.log(`✓ Created ${createdProjects.length} projects`);

    const projectMap = {};
    createdProjects.forEach(p => { projectMap[p.name] = p._id; });

    // Create demo tasks and link them to projects
    const demoTasks = [
      {
        title: 'Design system token audit',
        description: 'Review and update all design tokens for consistency across the platform',
        status: 'in-progress',
        priority: 'high',
        assignee: userMap['james@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['TaskForge Dashboard Redesign'],
        dueDate: '2024-12-15',
      },
      {
        title: 'API rate limiting implementation',
        description: 'Implement rate limiting middleware for all public endpoints',
        status: 'todo',
        priority: 'high',
        assignee: userMap['sarah@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['SSO Enterprise Integration'],
        dueDate: '2024-12-20',
      },
      {
        title: 'User onboarding flow redesign',
        description: 'Redesign the onboarding experience to improve activation rate',
        status: 'in-review',
        priority: 'medium',
        assignee: userMap['priya@taskforge.io'],
        createdBy: userMap['sarah@taskforge.io'],
        project: projectMap['TaskForge Dashboard Redesign'],
        dueDate: '2024-12-10',
      },
      {
        title: 'Database query optimization',
        description: 'Profile and optimize slow queries in the analytics module',
        status: 'todo',
        priority: 'medium',
        assignee: userMap['marcus@taskforge.io'],
        createdBy: userMap['sarah@taskforge.io'],
        project: projectMap['SSO Enterprise Integration'],
        dueDate: '2024-12-25',
      },
      {
        title: 'Mobile responsive dashboard',
        description: 'Ensure dashboard is fully responsive on all mobile devices',
        status: 'done',
        priority: 'low',
        assignee: userMap['james@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['Mobile App Phase 1'],
        dueDate: '2024-11-15',
      },
      {
        title: 'WebSocket real-time notifications',
        description: 'Implement WebSocket-based real-time notification system',
        status: 'in-progress',
        priority: 'high',
        assignee: userMap['marcus@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['TaskForge Dashboard Redesign'],
        dueDate: '2024-12-30',
      },
      {
        title: 'Write E2E tests for auth flow',
        description: 'Cover login, signup, password reset with Playwright tests',
        status: 'todo',
        priority: 'low',
        assignee: userMap['priya@taskforge.io'],
        createdBy: userMap['sarah@taskforge.io'],
        project: projectMap['TaskForge Dashboard Redesign'],
        dueDate: '2025-01-05',
      },
      {
        title: 'Dark mode color refinements',
        description: 'Fine-tune contrast ratios and color harmonies in dark theme',
        status: 'done',
        priority: 'low',
        assignee: userMap['james@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['Mobile App Phase 1'],
        dueDate: '2024-11-10',
      },
      {
        title: 'CSV export for reports',
        description: 'Add CSV export functionality to the analytics reports page',
        status: 'in-review',
        priority: 'medium',
        assignee: userMap['marcus@taskforge.io'],
        createdBy: userMap['sarah@taskforge.io'],
        project: projectMap['TaskForge Dashboard Redesign'],
        dueDate: '2024-12-18',
      },
      {
        title: 'SSO integration with SAML',
        description: 'Integrate SAML-based Single Sign-On for enterprise clients',
        status: 'todo',
        priority: 'high',
        assignee: userMap['sarah@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['SSO Enterprise Integration'],
        dueDate: '2025-01-15',
      },
      {
        title: 'Review user authentication flow',
        description: 'Conduct security and usability review of the new OAuth2 flow',
        status: 'in-review',
        priority: 'high',
        assignee: userMap['priya@taskforge.io'],
        createdBy: userMap['alex@taskforge.io'],
        project: projectMap['SSO Enterprise Integration'],
        dueDate: '2024-12-05',
      },
      {
        title: 'Performance testing on staging',
        description: 'Load testing the new API endpoints before production deployment',
        status: 'in-review',
        priority: 'medium',
        assignee: userMap['james@taskforge.io'],
        createdBy: userMap['sarah@taskforge.io'],
        project: projectMap['TaskForge Dashboard Redesign'],
        dueDate: '2024-12-12',
      },
    ];

    const createdTasks = await Task.insertMany(demoTasks);
    console.log(`✓ Created ${createdTasks.length} tasks`);

    const dbProjects = await Project.find({});
    console.log('PROJECTS IMMEDIATELY AFTER INSERTION:', dbProjects.map(p => p.name));

    console.log('\n✅ Demo data seeded successfully!');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Projects: ${createdProjects.length}`);
    console.log(`   - Tasks: ${createdTasks.length}`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
  }
};

seedUsers();