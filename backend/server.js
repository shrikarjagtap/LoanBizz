// ===== server.js =====

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path'); // ✅ For serving Angular build in production
require('dotenv').config(); // ✅ For environment variables

const app = express();

// ===== PORT & SECRET_KEY =====
// Use environment variables for deployment; fallback to local values
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'fallback_secret_key';

// ===== Middleware =====
app.use(
  cors({
    origin: '*', // ✅ Allow all origins for now; replace with frontend URL in production
    credentials: true,
  })
);
app.use(bodyParser.json());

// ===== MongoDB Connection =====
// Use environment variable if available
const mongoURI =
  process.env.MONGO_URI ||
  'mongodb+srv://shrikarjagtap2_db_user:shrikar0707@loanbizzcluster.cceh8an.mongodb.net/?retryWrites=true&w=majority&appName=LoanBizzCluster';

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===== Schemas =====
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, unique: true },
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

// ===== JWT Verification Middleware =====
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(403).json({ message: 'Access denied. No token provided.' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // ✅ user info from token
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

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
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
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { name: user.name, email: user.email, phone: user.phone },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----- ADD Loan (Protected Route) -----
app.post('/api/loans', verifyToken, async (req, res) => {
  try {
    const loanData = req.body;
    if (!loanData.borrowerName || !loanData.startDate || !loanData.endDate) {
      return res.status(400).json({ message: 'Missing required loan fields' });
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

// ----- GET Loans for Logged-in User -----
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

// ----- DELETE Loan -----
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

// ----- UPDATE Loan -----
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
app.get('/api/health', (req, res) => {
  res.send('✅ LoanBizz Backend is running successfully!');
});

// ===== Serve Angular Build in Production =====
app.use(express.static(path.join(__dirname, 'dist/LoanBizzV18')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/LoanBizzV18/index.html'));
});

// ===== Start Server =====
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
