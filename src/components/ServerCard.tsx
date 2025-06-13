import React from 'react';
import { Settings, Plus, Crown } from 'lucide-react';
import { Guild } from '../types';

interface ServerCardProps {
  guild: Guild;
  isBotPresent: boolean;
  onManage: (guild: Guild) => void;
  onInvite: (guild: Guild) => void;
}

const ServerCard: React.FC<ServerCardProps> = ({ guild, isBotPresent, onManage, onInvite }) => {
  const getGuildIcon = () => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
    }
    return null;
  };

  const getGuildInitials = () => {
    return guild.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-[#36393F] border border-[#40444B] rounded-lg p-6 hover:border-[#5865F2] transition-all duration-300 hover:shadow-lg hover:shadow-[#5865F2]/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {getGuildIcon() ? (
              <img
                src={getGuildIcon()!}
                alt={guild.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-[#5865F2] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{getGuildInitials()}</span>
              </div>
            )}
            {guild.owner && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FEE75C] rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-[#2C2F33]" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{guild.name}</h3>
            <p className="text-[#B9BBBE] text-sm">
              {guild.owner ? 'Owner' : 'Administrator'}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isBotPresent 
            ? 'bg-[#57F287] bg-opacity-20 text-[#57F287]'
            : 'bg-[#ED4245] bg-opacity-20 text-[#ED4245]'
        }`}>
          {isBotPresent ? 'Bot Present' : 'Not Added'}
        </div>
      </div>

      <div className="flex space-x-2">
        {isBotPresent ? (
          <button
            onClick={() => onManage(guild)}
            className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Manage</span>
          </button>
        ) : (
          <button
            onClick={() => onInvite(guild)}
            className="flex-1 bg-[#57F287] hover:bg-[#3EA66F] text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bot</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ServerCard;