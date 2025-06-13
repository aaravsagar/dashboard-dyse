import express from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'querystring';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

dotenv.config();

const app = express();
const PORT = 3001;
const FRONTEND_URL = 'https://dyse-dashboard.vercel.app';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = 'https://dyse-dashboard.onrender.com/api/auth/callback';
const BOT_TOKEN = process.env.DISCORD_TOKEN;

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DB_URL,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'discord-dashboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  },
}));

// OAuth2 Login
app.get('/api/auth/login', (req, res) => {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}` +
                  `&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                  `&scope=identify+guilds+email`;
  res.redirect(authUrl);
});

// OAuth2 Callback
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    const [userRes, guildsRes] = await Promise.all([
      axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const user = userRes.data;
    user.guilds = guildsRes.data.filter(guild => (guild.permissions & 0x8) === 0x8); // Admin only
    req.session.user = user;
    req.session.accessToken = accessToken;

    res.redirect(FRONTEND_URL);
  } catch (err) {
    console.error('Callback Error:', err.response?.data || err.message);
    res.status(500).send('Authentication Failed');
  }
});

// Current Authenticated User
app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.sendStatus(200);
  });
});

// Get Guilds where the bot is present
app.get('/api/discord/bot-guilds', async (req, res) => {
  try {
    const botGuilds = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
    res.json(botGuilds.data);
  } catch (err) {
    console.error('Bot guilds fetch failed:', err.response?.data || err.message);
    res.status(500).send('Failed to fetch bot guilds');
  }
});

// Get guild roles
app.get('/api/discord/guilds/:guildId/roles', async (req, res) => {
  try {
    const { guildId } = req.params;
    const rolesRes = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });
    res.json(rolesRes.data);
  } catch (err) {
    console.error('Roles fetch failed:', err.response?.data || err.message);
    res.status(500).send('Failed to fetch roles');
  }
});

// Generate Invite Link
app.get('/api/discord/invite/:guildId', (req, res) => {
  const { guildId } = req.params;
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot&guild_id=${guildId}`;
  res.json({ inviteUrl });
});

// Get server settings
app.get('/api/servers/:guildId/settings', async (req, res) => {
  try {
    const { guildId } = req.params;
    const serverDoc = doc(db, 'servers', guildId);
    const serverSnap = await getDoc(serverDoc);
    
    if (serverSnap.exists()) {
      const data = serverSnap.data();
      
      // Get settings subdocuments
      const autoRoleDoc = doc(db, 'servers', guildId, 'settings', 'autoRole');
      const incomeShopDoc = doc(db, 'servers', guildId, 'settings', 'incomeShop');
      
      const [autoRoleSnap, incomeShopSnap] = await Promise.all([
        getDoc(autoRoleDoc),
        getDoc(incomeShopDoc)
      ]);
      
      const settings = {
        ...data,
        autoRole: autoRoleSnap.exists() ? autoRoleSnap.data() : { enabled: false, roleIds: [] },
        incomeShop: incomeShopSnap.exists() ? incomeShopSnap.data() : { enabled: false, roles: [] },
        twoStepVerification: data.twoStepVerification || false
      };
      
      res.json(settings);
    } else {
      // Return default settings
      res.json({
        prefix: '!',
        currencySymbol: '$',
        guildId,
        guildName: '',
        autoRole: { enabled: false, roleIds: [] },
        incomeShop: { enabled: false, roles: [] },
        twoStepVerification: false
      });
    }
  } catch (err) {
    console.error('Settings fetch failed:', err.message);
    res.status(500).send('Failed to fetch settings');
  }
});

// Update server settings
app.put('/api/servers/:guildId/settings', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { prefix, currencySymbol, guildName, autoRole, incomeShop, twoStepVerification } = req.body;
    
    // Update main server document
    const serverDoc = doc(db, 'servers', guildId);
    await setDoc(serverDoc, {
      prefix,
      currencySymbol,
      guildId,
      guildName,
      twoStepVerification,
      updatedAt: new Date()
    }, { merge: true });
    
    // Update autoRole settings
    if (autoRole) {
      const autoRoleDoc = doc(db, 'servers', guildId, 'settings', 'autoRole');
      await setDoc(autoRoleDoc, autoRole);
    }
    
    // Update incomeShop settings
    if (incomeShop) {
      const incomeShopDoc = doc(db, 'servers', guildId, 'settings', 'incomeShop');
      await setDoc(incomeShopDoc, incomeShop);
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Settings update failed:', err.message);
    res.status(500).send('Failed to update settings');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running`);
});