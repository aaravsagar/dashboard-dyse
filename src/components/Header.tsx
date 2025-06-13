import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#2C2F33] border-b border-[#40444B] px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn.discordapp.com/app-icons/1322592306670338129/daab4e79fea4d0cb886b1fc92e8560e3.png?size=512"
            alt="Dyse Bot Logo"
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-xl font-bold text-white">Dyse Bot</h1>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
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

          {user && (
            <div className="flex items-center space-x-3">
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt={user.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-right">
                <p className="text-white font-medium leading-tight">{user.username}</p>
                <p className="text-xs text-[#B9BBBE] leading-none">#{user.discriminator}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-[#B9BBBE] hover:text-white hover:bg-[#40444B] rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
