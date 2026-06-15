import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'TO', label: 'Tocantins' }
];

export default function LocationSelector({ onChange }) {
  const [selectedState, setSelectedState] = useState('PR');

  useEffect(() => {
    const savedState = localStorage.getItem('ecorent_state');
    if (savedState) {
      setSelectedState(savedState);
      if (onChange) onChange(savedState);
    } else {
      localStorage.setItem('ecorent_state', 'PR');
      if (onChange) onChange('PR');
    }
  }, [onChange]);

  const handleStateChange = (value) => {
    setSelectedState(value);
    localStorage.setItem('ecorent_state', value);
    if (onChange) onChange(value);
    // Dispatch custom event so other components can listen if needed
    window.dispatchEvent(new Event('ecorent_state_changed'));
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 hover:bg-muted transition-colors rounded-full px-3 py-1.5 border border-border/50">
      <MapPin className="w-4 h-4 text-primary shrink-0" />
      <Select value={selectedState} onValueChange={handleStateChange}>
        <SelectTrigger className="h-auto py-0 px-0 border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-auto gap-1">
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[300px]">
          {BRAZILIAN_STATES.map((state) => (
            <SelectItem key={state.value} value={state.value}>
              {state.label} ({state.value})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}