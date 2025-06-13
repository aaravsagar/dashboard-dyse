import { useState, useEffect } from 'react';
import axios from 'axios';
import { Guild, Role, ServerSettings } from '../types';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://dyse-dashboard.onrender.com';

export const useDiscord = () => {
  const [botGuilds, setBotGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBotGuilds = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/discord/bot-guilds');
      setBotGuilds(response.data);
    } catch (error) {
      console.error('Failed to fetch bot guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuildRoles = async (guildId: string): Promise<Role[]> => {
    try {
      const response = await axios.get(`/api/discord/guilds/${guildId}/roles`);
      return response.data.filter((role: Role) => role.name !== '@everyone');
    } catch (error) {
      console.error('Failed to fetch guild roles:', error);
      return [];
    }
  };

  const getInviteLink = async (guildId: string) => {
    try {
      const response = await axios.get(`/api/discord/invite/${guildId}`);
      return response.data.inviteUrl;
    } catch (error) {
      console.error('Failed to get invite link:', error);
      return null;
    }
  };

  const fetchServerSettings = async (guildId: string): Promise<ServerSettings | null> => {
    try {
      const response = await axios.get(`/api/servers/${guildId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch server settings:', error);
      return null;
    }
  };

  const updateServerSettings = async (guildId: string, settings: Partial<ServerSettings>) => {
    try {
      await axios.put(`/api/servers/${guildId}/settings`, settings);
      return true;
    } catch (error) {
      console.error('Failed to update server settings:', error);
      return false;
    }
  };

  return {
    botGuilds,
    loading,
    fetchBotGuilds,
    fetchGuildRoles,
    getInviteLink,
    fetchServerSettings,
    updateServerSettings,
  };
};