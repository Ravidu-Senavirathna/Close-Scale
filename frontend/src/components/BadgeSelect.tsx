import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './BadgeSelect.css';

interface Option {
  value: string;
  label: string;
}

interface BadgeSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  badgeClass: string;
}

export default function BadgeSelect({ value, options, onChange, badgeClass }: BadgeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (e: React.MouseEvent, newValue: string) => {
    e.stopPropagation();
    onChange(newValue);
    setIsOpen(false);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="badge-select-container" ref={containerRef}>
      <button 
        className={`badge-select-trigger ${badgeClass}`} 
        onClick={toggleOpen}
        type="button"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={14} className={`badge-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="badge-select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`badge-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={(e) => handleSelect(e, option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
