import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Shield } from 'lucide-react';
import { Guild, Role, ServerSettings as ServerSettingsType } from '../types';
import { useDiscord } from '../hooks/useDiscord';
import Toggle from './Toggle';
import RoleSelector from './RoleSelector';

interface ServerSettingsProps {
  guild: Guild;
  onBack: () => void;
}

const ServerSettings: React.FC<ServerSettingsProps> = ({ guild, onBack }) => {
  const { fetchGuildRoles, fetchServerSettings, updateServerSettings } = useDiscord();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<ServerSettingsType>({
    prefix: '!',
    currencySymbol: '$',
    guildId: guild.id,
    guildName: guild.name,
    autoRole: { enabled: false, roleIds: [] },
    incomeShop: { enabled: false, roles: [] },
    twoStepVerification: false,
  });

  useEffect(() => {
    loadData();
  }, [guild.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [guildRoles, serverSettings] = await Promise.all([
        fetchGuildRoles(guild.id),
        fetchServerSettings(guild.id),
      ]);
      
      setRoles(guildRoles);
      if (serverSettings) {
        setSettings({ ...serverSettings, guildName: guild.name });
      }
    } catch (error) {
      console.error('Failed to load server data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateServerSettings(guild.id, settings);
      // Show success message or toast
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const addIncomeRole = () => {
    setSettings(prev => ({
      ...prev,
      incomeShop: {
        ...prev.incomeShop,
        roles: [
          ...prev.incomeShop.roles,
          { roleId: '', roleName: '', price: 0, income: 0 }
        ]
      }
    }));
  };

  const removeIncomeRole = (index: number) => {
    setSettings(prev => ({
      ...prev,
      incomeShop: {
        ...prev.incomeShop,
        roles: prev.incomeShop.roles.filter((_, i) => i !== index)
      }
    }));
  };

  const updateIncomeRole = (index: number, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      incomeShop: {
        ...prev.incomeShop,
        roles: prev.incomeShop.roles.map((role, i) => 
          i === index ? { ...role, [field]: value } : role
        )
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C2F33] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#B9BBBE]">Loading server settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2C2F33] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-[#B9BBBE] hover:text-white hover:bg-[#40444B] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              {guild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                  alt={guild.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {guild.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{guild.name}</h1>
                <p className="text-[#B9BBBE]">Server Settings</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#57F287] hover:bg-[#3EA66F] disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="bg-[#36393F] border border-[#40444B] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Settings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#B9BBBE] mb-2">
                  Command Prefix
                </label>
                <input
                  type="text"
                  value={settings.prefix}
                  onChange={(e) => setSettings(prev => ({ ...prev, prefix: e.target.value }))}
                  className="w-full bg-[#2C2F33] border border-[#40444B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                  placeholder="!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B9BBBE] mb-2">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings(prev => ({ ...prev, currencySymbol: e.target.value }))}
                  className="w-full bg-[#2C2F33] border border-[#40444B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                  placeholder="$"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-[#36393F] border border-[#40444B] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security Settings</span>
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Two-Step Verification</h3>
                <p className="text-[#B9BBBE] text-sm">Require additional verification for sensitive commands</p>
              </div>
              <Toggle
                enabled={settings.twoStepVerification}
                onChange={(enabled) => setSettings(prev => ({ ...prev, twoStepVerification: enabled }))}
              />
            </div>
          </div>

          {/* Auto Role Settings */}
          <div className="bg-[#36393F] border border-[#40444B] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Auto Role</h2>
              <Toggle
                enabled={settings.autoRole.enabled}
                onChange={(enabled) => setSettings(prev => ({
                  ...prev,
                  autoRole: { ...prev.autoRole, enabled }
                }))}
              />
            </div>
            <p className="text-[#B9BBBE] text-sm mb-4">
              Automatically assign roles to new members when they join the server.
            </p>
            
            {settings.autoRole.enabled && (
              <div>
                <label className="block text-sm font-medium text-[#B9BBBE] mb-2">
                  Select Roles
                </label>
                <RoleSelector
                  roles={roles}
                  selectedRoleIds={settings.autoRole.roleIds}
                  onChange={(roleIds) => setSettings(prev => ({
                    ...prev,
                    autoRole: { ...prev.autoRole, roleIds }
                  }))}
                  multiple
                />
              </div>
            )}
          </div>

          {/* Income Shop Settings */}
          <div className="bg-[#36393F] border border-[#40444B] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Income Shop</h2>
              <Toggle
                enabled={settings.incomeShop.enabled}
                onChange={(enabled) => setSettings(prev => ({
                  ...prev,
                  incomeShop: { ...prev.incomeShop, enabled }
                }))}
              />
            </div>
            <p className="text-[#B9BBBE] text-sm mb-4">
              Allow users to purchase roles that provide regular income.
            </p>

            {settings.incomeShop.enabled && (
              <div className="space-y-4">
                {settings.incomeShop.roles.map((incomeRole, index) => (
                  <div key={index} className="bg-[#2C2F33] border border-[#40444B] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Role #{index + 1}</h3>
                      <button
                        onClick={() => removeIncomeRole(index)}
                        className="text-[#ED4245] hover:bg-[#ED4245] hover:bg-opacity-20 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#B9BBBE] mb-2">
                          Role
                        </label>
                        <RoleSelector
                          roles={roles}
                          selectedRoleIds={incomeRole.roleId ? [incomeRole.roleId] : []}
                          onChange={(roleIds) => {
                            const selectedRole = roles.find(r => r.id === roleIds[0]);
                            updateIncomeRole(index, 'roleId', roleIds[0] || '');
                            updateIncomeRole(index, 'roleName', selectedRole?.name || '');
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#B9BBBE] mb-2">
                          Price ({settings.currencySymbol})
                        </label>
                        <input
                          type="number"
                          value={incomeRole.price}
                          onChange={(e) => updateIncomeRole(index, 'price', parseInt(e.target.value) || 0)}
                          className="w-full bg-[#40444B] border border-[#40444B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#B9BBBE] mb-2">
                          Income ({settings.currencySymbol}/hour)
                        </label>
                        <input
                          type="number"
                          value={incomeRole.income}
                          onChange={(e) => updateIncomeRole(index, 'income', parseInt(e.target.value) || 0)}
                          className="w-full bg-[#40444B] border border-[#40444B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5865F2] transition-colors"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addIncomeRole}
                  className="w-full border-2 border-dashed border-[#40444B] hover:border-[#5865F2] text-[#B9BBBE] hover:text-white py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Income Role</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;