import React from 'react';
import { Badge } from '@/components/ui/badge';

const categoryColors = {
  'Bicicletas': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  'Ferramentas': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  'Equipamentos esportivos': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  'Camping': 'bg-green-100 text-green-800 hover:bg-green-100',
  'Eletrônicos': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  'Videogames': 'bg-pink-100 text-pink-800 hover:bg-pink-100',
  'Roupas': 'bg-rose-100 text-rose-800 hover:bg-rose-100',
  'Fantasias': 'bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-100',
  'Instrumentos musicais': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
  'Itens para festas': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  'Veículos': 'bg-slate-100 text-slate-800 hover:bg-slate-100',
  'Utensílios domésticos': 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  'Equipamentos de fotografia': 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100'
};

export default function CategoryBadge({ category }) {
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  
  return (
    <Badge variant="secondary" className={colorClass}>
      {category}
    </Badge>
  );
}