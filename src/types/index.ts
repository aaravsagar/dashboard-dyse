export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  guilds: Guild[];
}

export interface Guild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface Role {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

export interface ServerSettings {
  prefix: string;
  currencySymbol: string;
  guildId: string;
  guildName: string;
  autoRole: {
    enabled: boolean;
    roleIds: string[];
  };
  incomeShop: {
    enabled: boolean;
    roles: {
      roleId: string;
      roleName: string;
      price: number;
      income: number;
    }[];
  };
  twoStepVerification: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}