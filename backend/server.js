// ===== server.js =====

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'SECRET_KEY'; // ⚠️ Use .env in production!

// ===== Middleware =====
const allowedOrigins = [
  'https://loan-bizz-3wsd.vercel.app',
  'http://localhost:4200',
  'http://192.168.1.134:4200',
  'https://localhost',       // Capacitor Android WebView
  'http://localhost',        // Capacitor Android WebView
  'capacitor://localhost'    // Capacitor scheme
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log('❌ CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(bodyParser.json());

// ===== MongoDB Connection =====
const mongoURI =
  'mongodb+srv://shrikarjagtap2_db_user:shrikar0707@loanbizzcluster.cceh8an.mongodb.net/test?retryWrites=true&w=majority&appName=LoanBizzCluster';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===== Schemas =====
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true, index: true },
  password: String,
});

const loanSchema = new mongoose.Schema({
  borrowerName: String,
  principalAMT: Number,
  int: Number,
  totalAmount: Number,
  startDate: Date,
  endDate: Date,
  borrowerContact: String,
  securityAsset: String,
  investor: String,
  investorPercentage: Number,
  totalTenure: Number,
  isClosed: { type: Boolean, default: false },
  userEmail: String,
});

const User = mongoose.model('User', userSchema);
const Loan = mongoose.model('Loan', loanSchema);

// ===== Helpers =====
function buildEmailQuery(rawEmail) {
  const email = (rawEmail || '').trim();
  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { email: new RegExp('^' + escaped + '$', 'i') }; // case-insensitive
}

// ===== JWT Verification Middleware =====
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ message: 'Access denied. No token provided.' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ================== ROUTES ==================

// ----- HEALTH CHECK (used to warm up backend) -----
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// ----- REGISTER -----
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailQuery = buildEmailQuery(email);
    const exists = await User.findOne(emailQuery);

    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = (email || '').trim();

    const newUser = new User({
      name,
      phone,
      email: normalizedEmail,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ----- LOGIN -----
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailQuery = buildEmailQuery(email);
    const user = await User.findOne(emailQuery);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let passwordMatches = false;

    if (user.password && user.password.startsWith('$2')) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = user.password === password;

      if (passwordMatches) {
        const newHash = await bcrypt.hash(password, 10);
        user.password = newHash;
        await user.save();
        console.log(`✅ Upgraded password hash for user ${user.email}`);
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { name: user.name, email: user.email, phone: user.phone },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ----- ADD Loan (Protected Route) -----
app.post('/api/loans', verifyToken, async (req, res) => {
  try {
    const loanData = req.body;

    if (!loanData.borrowerName || !loanData.startDate || !loanData.endDate) {
      return res
        .status(400)
        .json({ message: 'Missing required loan fields' });
    }

    if (!loanData.userEmail) loanData.userEmail = req.user.email;

    const loan = new Loan(loanData);
    await loan.save();
    res.status(201).json({ message: 'Loan added successfully', loan });
  } catch (err) {
    console.error('❌ Error adding loan:', err);
    res.status(500).json({ message: 'Server error while adding loan' });
  }
});

// ----- GET all Loans for Logged-in User (Protected) -----
app.get('/api/loans/:userEmail', verifyToken, async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (req.user.email !== userEmail)
      return res.status(403).json({ message: 'Forbidden' });

    const loans = await Loan.find({ userEmail });
    res.status(200).json(loans);
  } catch (err) {
    console.error('❌ Fetch loans error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- DELETE Loan (Protected) -----
app.delete('/api/loans/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Loan.findByIdAndDelete(id);
    res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (err) {
    console.error('❌ Delete loan error:', err);
    res.status(500).json({ message: 'Server error while deleting loan' });
  }
});

app.put('/api/loans/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLoan = await Loan.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLoan) return res.status(404).json({ message: 'Loan not found' });

    res.status(200).json({ message: 'Loan updated successfully', loan: updatedLoan });
  } catch (err) {
    console.error('❌ Update loan error:', err);
    res.status(500).json({ message: 'Server error while updating loan' });
  }
});

// ----- Health Check (root) -----
app.get('/', (req, res) => {
  res.send('✅ LoanBizz Backend is running successfully!');
});

// ===== Start Server =====
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
