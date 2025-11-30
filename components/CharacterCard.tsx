import React from 'react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onClick: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl p-4 transition-all duration-300 border
        flex items-center gap-4 hover:bg-slate-800
        ${isSelected 
          ? `bg-slate-800 border-[${character.color}] shadow-lg shadow-[${character.color}]/20` 
          : 'bg-slate-900 border-slate-700 hover:border-slate-600'}
      `}
      style={{ borderColor: isSelected ? character.color : undefined }}
    >
      <div className="relative">
        <img 
          src={character.avatarUrl} 
          alt={character.name} 
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
        />
        {isSelected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{character.name}</h3>
        <p className="text-xs text-slate-400 truncate">{character.description}</p>
      </div>
    </div>
  );
};

export default CharacterCard;