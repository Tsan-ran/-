
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { Taxon, formatScientificName } from '../types';
import { db } from '../services/db';

interface TaxonSearchProps {
  onSelect: (taxon: Taxon) => void;
  placeholder?: string;
}

const TaxonSearch: React.FC<TaxonSearchProps> = ({ onSelect, placeholder = '搜尋 科 / 屬 / 種 / 中文名 / 學名...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Taxon[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = db.getTaxonIndex();
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = index.filter(t => 
      t.scientific_name.toLowerCase().includes(q) ||
      t.chinese_name.toLowerCase().includes(q) ||
      t.family.toLowerCase().includes(q) ||
      t.genus.toLowerCase().includes(q) ||
      t.rank.toLowerCase().includes(q)
    ).slice(0, 50);

    setResults(filtered);
    setIsOpen(true);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-sm"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-96 overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((taxon) => (
            <button
              key={taxon.taxon_id}
              onClick={() => {
                onSelect(taxon);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex flex-col gap-1 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  {taxon.chinese_name || formatScientificName(taxon.genus, taxon.species, taxon.subspecies)}
                  {taxon.chinese_name && (
                    <span className="text-slate-400 font-normal italic text-sm">
                      {formatScientificName(taxon.genus, taxon.species, taxon.subspecies)}
                    </span>
                  )}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                  taxon.rank.toLowerCase() === 'species' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'
                }`}>
                  {taxon.rank}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Tag size={12} className="shrink-0" />
                <span className="truncate">{taxon.family} {'>'} {taxon.genus}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxonSearch;
