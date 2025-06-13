import React from 'react';
import { Shield, Settings, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/Footer';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#2C2F33] via-[#36393F] to-[#2C2F33] text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 border-b border-[#40444B] bg-[#2C2F33]">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512"
            alt="Bot Logo"
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-xl font-bold">Dyse Bot</h1>
        </div>
        <div className="space-x-4">
          <a
            href="https://discord.com/api/oauth2/authorize?client_id=1322592306670338129&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Invite
          </a>
          <a
            href="https://dyse.vercel.app/usage"
            className="bg-[#40444B] hover:bg-[#4e525b] text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Commands
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center py-20 px-4 text-center">
        {/* Logo */}
        <img
          src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512"
          alt="Dyse Bot"
          className="w-24 h-24 mb-6 rounded-full"
        />

        {/* Title & Description */}
        <h1 className="text-4xl font-bold mb-2">Dyse Bot Dashboard</h1>
        <p className="text-xl text-[#B9BBBE] max-w-xl mb-6">
          Configure bot settings, manage auto roles, income roles, and more — all from one intuitive dashboard.
        </p>

        {/* Login Button */}
        <div className="mb-12">
          <button
            onClick={login}
            className="bg-[#43B581] hover:bg-[#389e6c] text-white font-medium px-8 py-4 rounded-lg text-lg transition-colors inline-flex items-center space-x-3"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png"
              alt="Discord Logo"
              className="w-6 h-6"
            />
            <span>Go to Dashboard</span>
          </button>
          <p className="text-sm text-[#B9BBBE] mt-4">
            Secure OAuth2 login • Only servers you manage are accessible
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-5xl">
          <div className="bg-[#36393F] p-6 rounded-lg border border-[#40444B]">
            <div className="w-12 h-12 bg-[#5865F2] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-[#5865F2]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Server Management</h3>
            <p className="text-[#B9BBBE]">Set prefixes, currency symbols, and manage your server's basic configuration.</p>
          </div>

          <div className="bg-[#36393F] p-6 rounded-lg border border-[#40444B]">
            <div className="w-12 h-12 bg-[#57F287] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[#57F287]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Auto Roles</h3>
            <p className="text-[#B9BBBE]">Automatically assign roles to new members upon joining.</p>
          </div>

          <div className="bg-[#36393F] p-6 rounded-lg border border-[#40444B]">
            <div className="w-12 h-12 bg-[#FEE75C] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#FEE75C]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Security</h3>
            <p className="text-[#B9BBBE]">Future-ready options for verification and role-based restrictions.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login;
