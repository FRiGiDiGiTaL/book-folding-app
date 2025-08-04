
import React from 'react';

interface NumberInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  step?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, name, value, onChange, placeholder, step = "0.1" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-stone-700">
      {label}
    </label>
    <div className="mt-1">
      <input
        type="number"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="block w-full shadow-sm sm:text-sm border-orange-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
        placeholder={placeholder}
        step={step}
        min="0"
      />
    </div>
  </div>
);