import { useState, useEffect } from 'react';
import axios from 'axios';
import { Guild, Role, ServerSettings } from '../types';

// Use the same axios configuration as useAuth
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://dyse-dashboard.onrender.com';

axios.defaults.baseURL = API_BASE_URL;

export const useDiscord = () => {
  const [botGuilds, setBotGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBotGuilds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching bot guilds...');
      const response = await axios.get('/api/discord/bot-guilds');
      setBotGuilds(response.data);
      console.log('Bot guilds fetched:', response.data.length);
    } catch (error: any) {
      console.error('Failed to fetch bot guilds:', error);
      setError('Failed to fetch bot guilds. Please try again.');
      setBotGuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuildRoles = async (guildId: string): Promise<Role[]> => {
    try {
      console.log('Fetching roles for guild:', guildId);
      const response = await axios.get(`/api/discord/guilds/${guildId}/roles`);
      const roles = response.data.filter((role: Role) => role.name !== '@everyone');
      console.log('Guild roles fetched:', roles.length);
      return roles;
    } catch (error) {
      console.error('Failed to fetch guild roles:', error);
      throw new Error('Failed to fetch guild roles');
    }
  };

  const getInviteLink = async (guildId: string) => {
    try {
      console.log('Getting invite link for guild:', guildId);
      const response = await axios.get(`/api/discord/invite/${guildId}`);
      return response.data.inviteUrl;
    } catch (error) {
      console.error('Failed to get invite link:', error);
      throw new Error('Failed to generate invite link');
    }
  };

  const fetchServerSettings = async (guildId: string): Promise<ServerSettings | null> => {
    try {
      console.log('Fetching server settings for guild:', guildId);
      const response = await axios.get(`/api/servers/${guildId}/settings`);
      console.log('Server settings fetched');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch server settings:', error);
      throw new Error('Failed to fetch server settings');
    }
  };

  const updateServerSettings = async (guildId: string, settings: Partial<ServerSettings>) => {
    try {
      console.log('Updating server settings for guild:', guildId);
      await axios.put(`/api/servers/${guildId}/settings`, settings);
      console.log('Server settings updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update server settings:', error);
      throw new Error('Failed to update server settings');
    }
  };

  return {
    botGuilds,
    loading,
    error,
    fetchBotGuilds,
    fetchGuildRoles,
    getInviteLink,
    fetchServerSettings,
    updateServerSettings,
    clearError: () => setError(null)
  };
};