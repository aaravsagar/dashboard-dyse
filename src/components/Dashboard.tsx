import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDiscord } from '../hooks/useDiscord';
import { Guild } from '../types';
import ServerCard from './ServerCard';
import ServerSettings from './ServerSettings';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { botGuilds, loading, fetchBotGuilds, getInviteLink } = useDiscord();
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);

  useEffect(() => {
    if (user) {
      fetchBotGuilds();
    }
  }, [user]);

  const handleManageServer = (guild: Guild) => {
    setSelectedGuild(guild);
  };

  const handleInviteBot = async (guild: Guild) => {
    const inviteUrl = await getInviteLink(guild.id);
    if (inviteUrl) {
      window.open(inviteUrl, '_blank');
    }
  };

  const isBotInGuild = (guildId: string) => {
    return botGuilds.some(botGuild => botGuild.id === guildId);
  };

  if (selectedGuild) {
    return (
      <ServerSettings
        guild={selectedGuild}
        onBack={() => setSelectedGuild(null)}
      />
    );
  }

  const guildsWithBot = user?.guilds?.filter(guild => isBotInGuild(guild.id)) || [];
  const guildsWithoutBot = user?.guilds?.filter(guild => !isBotInGuild(guild.id)) || [];

  return (
    <div className="min-h-screen bg-[#2C2F33] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Server Dashboard</h1>
          <p className="text-[#B9BBBE]">
            Manage your Discord bot settings across all your servers. You have admin access to {user?.guilds?.length || 0} servers.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#B9BBBE]">Loading servers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Servers With Bot */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">Servers With Bot</h2>
              {guildsWithBot.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                  {guildsWithBot.map(guild => (
                    <ServerCard
                      key={guild.id}
                      guild={guild}
                      isBotPresent={true}
                      onManage={handleManageServer}
                      onInvite={handleInviteBot}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[#B9BBBE]">No servers found with the bot added.</p>
              )}
            </div>

            {/* Servers Without Bot */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Servers Without Bot</h2>
              {guildsWithoutBot.length > 0 ? (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                  {guildsWithoutBot.map(guild => (
                    <ServerCard
                      key={guild.id}
                      guild={guild}
                      isBotPresent={false}
                      onManage={handleManageServer}
                      onInvite={handleInviteBot}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[#B9BBBE]">All your servers already have the bot added.</p>
              )}
            </div>
          </>
        )}

        {!loading && user?.guilds?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#40444B] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Servers Found</h3>
            <p className="text-[#B9BBBE] max-w-md mx-auto">
              You don't have administrator permissions on any Discord servers. Make sure you have admin rights to manage bot settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
