import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Role } from '../types';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ 
  roles, 
  selectedRoleIds, 
  onChange, 
  multiple = false,
  placeholder = "Select a role..."
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRoles = roles.filter(role => selectedRoleIds.includes(role.id));

  const handleRoleSelect = (roleId: string) => {
    if (multiple) {
      if (selectedRoleIds.includes(roleId)) {
        onChange(selectedRoleIds.filter(id => id !== roleId));
      } else {
        onChange([...selectedRoleIds, roleId]);
      }
    } else {
      onChange([roleId]);
      setIsOpen(false);
    }
  };

  const removeRole = (roleId: string) => {
    onChange(selectedRoleIds.filter(id => id !== roleId));
  };

  const getRoleColor = (color: number) => {
    if (color === 0) return '#B9BBBE';
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#2C2F33] border border-[#40444B] rounded-lg px-3 py-2 text-white cursor-pointer flex items-center justify-between min-h-[40px]"
      >
        <div className="flex flex-wrap gap-1">
          {selectedRoles.length > 0 ? (
            selectedRoles.map(role => (
              <div
                key={role.id}
                className="inline-flex items-center space-x-1 bg-[#40444B] rounded px-2 py-1 text-sm"
                style={{ color: getRoleColor(role.color) }}
              >
                <span>{role.name}</span>
                {multiple && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRole(role.id);
                    }}
                    className="ml-1 hover:bg-[#ED4245] hover:bg-opacity-20 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <span className="text-[#B9BBBE]">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#B9BBBE] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#2C2F33] border border-[#40444B] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {roles.length > 0 ? (
            roles.map(role => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`px-3 py-2 hover:bg-[#40444B] cursor-pointer transition-colors ${
                  selectedRoleIds.includes(role.id) ? 'bg-[#40444B]' : ''
                }`}
                style={{ color: getRoleColor(role.color) }}
              >
                <div className="flex items-center justify-between">
                  <span>{role.name}</span>
                  {selectedRoleIds.includes(role.id) && (
                    <div className="w-2 h-2 bg-[#57F287] rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-[#B9BBBE]">No roles available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleSelector;