const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();
// const bodyParser = require('body-parser');
app.use(express.json());
const sqlite3 = require('sqlite3');
const { promisify } = require('util');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

const db = new sqlite3.Database("project.db");


const getAsync = promisify(db.get).bind(db);
const allAsync = promisify(db.get).bind(db);
const runAsync = promisify(db.run).bind(db);





const users = []; // 模拟数据库（内存）

// Joi验证规则定义
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userType: Joi.string().valid('volunteer', 'admin').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

app.use(cors());
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

const checkToken = async function(token) {
  if(!token) {
    return false;
  }
  try {
    const userID = await getAsync(`SELECT user_id FROM user_tokens WHERE token = ?`, [token]);
    return userID !== undefined;
  } catch (err) {
    return false;
  }
};

// BACKEND CODE ALL BELOW THIS LINE

app.get('/', async (req,res) =>{

  // let cookie = req.cookies.token;
  // if(cookie === undefined) {
  //   res.redirect('/login');
  //   return;
  // }

  // const userID = await getAsync(`SELECT user_id FROM user_tokens WHERE token = ?`, [cookie]);
  // if(userID) {
  //   res.redirect('/profile');
  // }
  // else {
  //   res.redirect('/login');
  // }
  const token = req.cookies.token;
  if(await checkToken(token)) {
    return res.redirect('/profile');
  }
  else {
    return res.redirect('/login');
  }
});

app.get('/login', async (req,res, next) => {
  const token = req.cookies.token;
  if(await checkToken(token)) {
    return res.redirect('/profile');
  }
  next();
});

app.get('/profile', async (req,res, next) => {
  const token = req.cookies.token;
  if(!(await checkToken(token))) {
    return res.redirect('/login');
  }
  next();
});

app.use(express.static(`${__dirname}`));

app.post('/api/login', async (req,res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  console.log("Checkpoint 1");
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);
  // console.log(await fetchFirst(db, `SELECT * FROM users WHERE email = ${email}`));

  // result = await getAsync('SELECT * FROM USERS WHERE email = ?', [email]);
  // if(result) console.log(result);
  // else console.log("nada");


  // if (!user) {
  //   return res.status(400).json({ error: 'User not found' });
  // }
  // console.log(user.password);
  const thisUser = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
  if(!thisUser) {
    return res.status(400).json({ error: 'User not found' });
  }
  console.log("Checkpoint 2");

  // const validPassword = await bcrypt.compare(password, user.password);
  const validPassword = await bcrypt.compare(password, thisUser.passhash);
  if (!validPassword) {
    return res.status(400).json({ error: 'Incorrect password' });
  }
  
  console.log("Checkpoint 3");

  const token = jwt.sign(
    { email: thisUser.email, userType: thisUser.usertype },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  console.log("Checkpoint 4");

  // res.json({ message: 'Login successful', token });
  await runAsync(`DELETE FROM user_tokens WHERE user_id = ?`, [thisUser.id]);
  
  console.log("Checkpoint 5");
  await runAsync(`INSERT INTO user_tokens (token, user_id) VALUES (?,?)`, [token, thisUser.id]);
  res.cookie('token', token, {maxAge: 3600 * 1000, httpOnly: true, sameSite: 'Lax'});
  return res.redirect('/profile');
});

app.post('/api/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password, userType } = req.body;
  // if (users.find(user => user.email === email)) {
  //   return res.status(400).json({ error: 'User already exists' });
  // }
  if(await getAsync('SELECT * FROM users WHERE email = ?', [email])) {
    console.log("exists");
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const lastID = await getAsync(`SELECT MAX(id) AS maxid FROM users`);
  const newID = lastID ? lastID.maxid + 1 : 1;  // Default to 1 if no user exists
  // users.push({ email, password: hashedPassword, userType });
  // db.run(db.prepare('INSERT INTO users (id, email, passhash) VALUES (?,?,?)', 1, email, hashedPassword));
  await runAsync(`INSERT INTO users (id, email, passhash, usertype) VALUES (?,?,?,?)`, [newID, email, hashedPassword, userType]);

  res.status(201).json({ message: 'Registered successfully' });
});

