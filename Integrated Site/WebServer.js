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

// const db = new sqlite3.Database("project.db");

const db = new sqlite3.Database("project.db", sqlite3.OPEN_READWRITE);
db.serialize();


const getAsync = promisify(db.get).bind(db);
const allAsync = promisify(db.all).bind(db);
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

const getIDFromToken = async function(token) {
  if(!token) {
    return "error";
  }
  try {
    const userID = await getAsync(`SELECT user_id FROM user_tokens WHERE token = ?`, [token]);
    if(userID !== undefined) {
      return userID["user_id"];
    }
    else {
      return "error";
    }
  } catch (err) {
    return "error";
  }
}

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

app.get('/api/fetch-profile', async (req,res) => {
  const token = req.cookies.token;
  const userID = await getIDFromToken(token);
  if(userID == "error") {
    return res.status(400).json({message: "Failed to fetch user data."});
  }
  console.log(`User ID: ${userID}`);
  const profile = await getAsync(`SELECT fullname, addressone, addresstwo, city, state, zipcode, preferences FROM profile WHERE user_id = ?`, [userID]);
  if(!profile) {
    return res.status(404).json({message: "Profile not found"});
  }
  return res.status(200).json(profile);
});

app.get('/api/fetch-skills', async (req,res) => {
  const skillList = await allAsync(`SELECT skill_name FROM skills`, []);
  return res.status(200).json(skillList);
});

app.get('/api/fetch-events', async (req,res) => {
  const eventsList = await allAsync(`SELECT * FROM events`, []);
  return res.status(200).json(eventsList);
});

app.post('/api/create-event', async (req,res) => {
  const token = req.cookies.token;
  console.log(token);
  const userID = await getIDFromToken(token);
  if(userID == "error") {
    return res.status(400).json({message: "Failed to create event."});
  }
  console.log(userID);

  const eventData = req.body.eventData;
  console.log(eventData);
});

app.post('/api/fetch-single-event', async (req,res) => {
  const eventID = req.body.id;
  const eventData = await getAsync(`SELECT id, name, description, location, urgency, date FROM events WHERE id = ?`, [eventID]);
  const eventSkills = await allAsync(`SELECT skill_name FROM event_skills WHERE event_id = ?`, [eventID]);
  return res.status(200).json({data: eventData, skills: eventSkills});
});
app.get('/api/fetch-user-skills', async (req,res) => {
  const token = req.cookies.token;
  console.log(token);
  const userID = await getIDFromToken(token);
  if(userID == "error") {
    return res.status(400).json({message: "Failed to update profile."});
  }
  console.log(userID);
  const userSkillsList = await allAsync(`SELECT skill_name FROM user_skills WHERE user_id = ?`, [userID]);
  console.log(userSkillsList);
  return res.status(200).json(userSkillsList);
});

app.post('/api/update-skills', async (req,res) => {
  const token = req.cookies.token;
  console.log(token);
  const userID = await getIDFromToken(token);
  if(userID == "error") {
    return res.status(400).json({message: "Failed to update profile."});
  }
  console.log(userID);
  console.log(req.body);
  const skillsList = req.body.selectedSkillsText;
  console.log(skillsList);
  const splitSkillsList = skillsList.split(",");
  console.log(splitSkillsList);
  await runAsync(`DELETE FROM user_skills WHERE user_id = ?`, [userID]);
  for(let i = 0; i < splitSkillsList.length; i++) {
    console.log(splitSkillsList[i]);
    await runAsync(`INSERT INTO user_skills (user_id, skill_name) VALUES (?,?)`, [userID, splitSkillsList[i]]);
  }
  return res.status(200).json({message: "Skills successfully updated."});
});

app.post('/api/update-profile', async (req,res) => {
  const token = req.cookies.token;
  const userID = await getIDFromToken(token);
  if(userID == "error") {
    return res.status(400).json({message: "Failed to update profile."});
  }
  const i = req.body;
  const existingProfile = await getAsync(`SELECT fullname, addressone, addresstwo, city, state, zipcode, preferences FROM profile WHERE user_id = ?`, [userID]);
  if(!existingProfile) {
    // create profile
    await runAsync(`INSERT INTO profile (user_id, fullname, addressone, addresstwo, city, state, zipcode, preferences) VALUES (?,?,?,?,?,?,?,?)`, [userID, i.fullname, i.addressone, i.addresstwo, i.city, i.state, i.zipcode, i.preferences]);
  }
  else {
    await runAsync(`UPDATE profile SET fullname = ?, addressone = ?, addresstwo = ?, city = ?, state = ?, zipcode = ?, preferences = ? WHERE user_id = ?`, [i.fullname, i.addressone, i.addresstwo, i.city, i.state, i.zipcode, i.preferences, userID]);
  }
  return res.status(200).json({message: "Profile successfully updated."});




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

app.post('/api/logout', async (req,res) => {
  const token = req.cookies.token;
  console.log(`Received logout request from token ${token}`);
  if(await checkToken(token)) {
    await runAsync(`DELETE FROM user_tokens WHERE token = ?`, [token]);
    return res.status(200).json({redirect: '/login'});
  }
  return res.status(200).json({redirect: '/login'});
});

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
  res.status(200).json({redirect: '/profile'});
  // res.status(200).json({message: 'Logged in successfully'});
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
  await runAsync(`INSERT INTO profile (user_id, addressone, addresstwo, city, state, zipcode, preferences, fullname) VALUES (?,?,?,?,?,?,?,?)`, [newID, "", "", "", "", "", "", ""]);

  res.status(201).json({ message: 'Registered successfully' });
});

