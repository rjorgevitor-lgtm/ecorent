import React from 'react';
import { Badge } from '@/components/ui/badge';

const conditionStyles = {
  'Novo': 'bg-green-100 text-green-800 hover:bg-green-100',
  'Como novo': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  'Bom': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  'Razoável': 'bg-amber-100 text-amber-800 hover:bg-amber-100'
};

export default function ConditionBadge({ condition }) {
  const styleClass = conditionStyles[condition] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  
  return (
    <Badge variant="outline" className={styleClass}>
      {condition}
    </Badge>
  );
}