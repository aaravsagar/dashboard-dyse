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
const PORT = process.env.PORT || 3001;

// Environment-based URLs
const isDevelopment = process.env.NODE_ENV !== 'production';
const FRONTEND_URL = isDevelopment 
  ? 'http://localhost:5173' 
  : 'https://dyse-dashboard.vercel.app';
const BACKEND_URL = isDevelopment 
  ? `http://localhost:${PORT}` 
  : 'https://dyse-dashboard.onrender.com';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = `${BACKEND_URL}/api/auth/callback`;
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

// CORS configuration
app.use(cors({ 
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'discord-dashboard-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDevelopment, // Only secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isDevelopment ? 'lax' : 'none'
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// OAuth2 Login
app.get('/api/auth/login', (req, res) => {
  const state = Math.random().toString(36).substring(2, 15);
  req.session.oauthState = state;
  
  const authUrl = `https://discord.com/oauth2/authorize?` +
    `client_id=${CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=identify+guilds+email&` +
    `state=${state}`;
  
  console.log('Redirecting to Discord OAuth:', authUrl);
  res.redirect(authUrl);
});

// OAuth2 Callback
app.get('/api/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  console.log('OAuth callback received:', { code: !!code, state, error });
  
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`${FRONTEND_URL}?error=oauth_error`);
  }
  
  if (!code) {
    console.error('No authorization code provided');
    return res.redirect(`${FRONTEND_URL}?error=no_code`);
  }
  
  // Verify state parameter
  if (state !== req.session.oauthState) {
    console.error('State mismatch:', { received: state, expected: req.session.oauthState });
    return res.redirect(`${FRONTEND_URL}?error=state_mismatch`);
  }

  try {
    console.log('Exchanging code for token...');
    
    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { 
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DiscordBot (https://dyse-dashboard.vercel.app, 1.0.0)'
        },
        timeout: 10000
      }
    );

    const accessToken = tokenRes.data.access_token;
    console.log('Token exchange successful');

    // Fetch user data and guilds
    const [userRes, guildsRes] = await Promise.all([
      axios.get('https://discord.com/api/users/@me', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'DiscordBot (https://dyse-dashboard.vercel.app, 1.0.0)'
        },
        timeout: 10000
      }),
      axios.get('https://discord.com/api/users/@me/guilds', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'DiscordBot (https://dyse-dashboard.vercel.app, 1.0.0)'
        },
        timeout: 10000
      }),
    ]);

    const user = userRes.data;
    // Filter guilds where user has admin permissions (ADMINISTRATOR = 0x8)
    user.guilds = guildsRes.data.filter(guild => (parseInt(guild.permissions) & 0x8) === 0x8);
    
    console.log('User authenticated:', user.username, 'Guilds:', user.guilds.length);
    
    // Store user data in session
    req.session.user = user;
    req.session.accessToken = accessToken;
    
    // Clear OAuth state
    delete req.session.oauthState;
    
    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${FRONTEND_URL}?error=session_error`);
      }
      
      console.log('Redirecting to frontend:', FRONTEND_URL);
      res.redirect(`${FRONTEND_URL}?auth=success`);
    });

  } catch (err) {
    console.error('OAuth callback error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});

// Current Authenticated User
app.get('/api/auth/me', (req, res) => {
  console.log('Auth check - Session ID:', req.sessionID, 'User:', !!req.session.user);
  
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Get Guilds where the bot is present
app.get('/api/discord/bot-guilds', async (req, res) => {
  try {
    const botGuilds = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { 
        Authorization: `Bot ${BOT_TOKEN}`,
        'User-Agent': 'DiscordBot (https://dyse-dashboard.vercel.app, 1.0.0)'
      },
      timeout: 10000
    });
    res.json(botGuilds.data);
  } catch (err) {
    console.error('Bot guilds fetch failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch bot guilds' });
  }
});

// Get guild roles
app.get('/api/discord/guilds/:guildId/roles', async (req, res) => {
  try {
    const { guildId } = req.params;
    const rolesRes = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
      headers: { 
        Authorization: `Bot ${BOT_TOKEN}`,
        'User-Agent': 'DiscordBot (https://dyse-dashboard.vercel.app, 1.0.0)'
      },
      timeout: 10000
    });
    res.json(rolesRes.data);
  } catch (err) {
    console.error('Roles fetch failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch roles' });
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
    res.status(500).json({ error: 'Failed to fetch settings' });
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
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
});