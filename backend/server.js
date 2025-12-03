// ===== server.js =====

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { get } = require('http');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'SECRET_KEY'; // ⚠️ Use .env in production!
const SALT_ROUNDS = 8; // was 10 → slightly faster hashing

// ===== Middleware =====
app.use(
  cors({
    origin: [
      'https://loan-bizz-3wsd.vercel.app',
      'http://localhost:4200',
      'http://192.168.1.134:4200'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(bodyParser.json());

// ===== MongoDB Connection =====
const mongoURI =
  'mongodb+srv://shrikarjagtap2_db_user:shrikar0707@loanbizzcluster.cceh8an.mongodb.net/?retryWrites=true&w=majority&appName=LoanBizzCluster';

// Optional: remove deprecation warnings
mongoose.set('strictQuery', false);

mongoose
  .connect(mongoURI, {
    dbName: 'loanbizz',            // choose a specific DB name
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,               // connection pool
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
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

// Explicit index (in case schema was modified later)
userSchema.index({ email: 1 }, { unique: true });

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
  userEmail: String, // linked to user's email
});

const User = mongoose.model('User', userSchema);
const Loan = mongoose.model('Loan', loanSchema);

// Ensure indexes are created at startup (non-blocking)
(async () => {
  try {
    await User.createCollection();
    await User.syncIndexes();
    console.log('✅ User indexes ensured');
  } catch (err) {
    console.error('❌ Error ensuring User indexes:', err);
  }
})();

// ===== JWT Verification Middleware =====
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ message: 'Access denied. No token provided.' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // user info from token
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ================== ROUTES ==================

// ----- REGISTER -----
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await User.findOne({ email }).lean().exec();
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ name, phone, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- LOGIN -----
app.post('/api/login', async (req, res) => {
  console.time('loginTotal');
  try {
    const { email, password } = req.body;

    console.time('dbUserLookup');
    const user = await User.findOne({ email }).lean().exec();
    console.timeEnd('dbUserLookup');

    if (!user) {
      console.timeEnd('loginTotal');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.time('passwordCompare');
    const validPass = await bcrypt.compare(password, user.password);
    console.timeEnd('passwordCompare');

    if (!validPass) {
      console.timeEnd('loginTotal');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.time('jwtSign');
    const token = jwt.sign(
      { name: user.name, email: user.email, phone: user.phone },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
    console.timeEnd('jwtSign');

    console.timeEnd('loginTotal');
    return res.status(200).json({ token });
  } catch (err) {
    console.timeEnd('loginTotal');
    console.error('❌ Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ----- ADD Loan (Protected Route) -----
app.post('/api/loans', verifyToken, async (req, res) => {
  try {
    const loanData = req.body;

    // Validate minimum fields
    if (!loanData.borrowerName || !loanData.startDate || !loanData.endDate) {
      return res
        .status(400)
        .json({ message: 'Missing required loan fields' });
    }

    // Add user's email from token if not provided
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

    // Only allow user to access their own loans
    if (req.user.email !== userEmail)
      return res.status(403).json({ message: 'Forbidden' });

    const loans = await Loan.find({ userEmail }).exec();
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

// ----- Health Check -----
app.get('/', (req, res) => {
  res.send('✅ LoanBizz Backend is running successfully!');
});

// ===== Start Server =====
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
