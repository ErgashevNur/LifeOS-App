import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'uz', name: "O'zbek", native: "O'zbek" },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const currentLang = i18n.language || 'uz';

  const filteredLanguages = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return LANGUAGES;
    return LANGUAGES.filter(l => 
      l.name.toLowerCase().includes(s) || 
      l.native.toLowerCase().includes(s) ||
      l.code.toLowerCase().includes(s)
    );
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
          isOpen 
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-110" 
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        )}
        title="Tilni tanlash"
      >
        <Globe className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 z-[100] w-[280px] overflow-hidden rounded-[1.5rem] bg-white shadow-2xl ring-1 ring-slate-100"
          >
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tilni qidirish..."
                  className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm"
                />
              </div>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2 custom-scrollbar">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                      currentLang === lang.code 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight">{lang.name}</span>
                      <span className="text-[10px] uppercase font-black tracking-widest opacity-50">{lang.native}</span>
                    </div>
                    {currentLang === lang.code && <Check className="h-4 w-4" />}
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topilmadi</p>
                </div>
              )}
            </div>

            {filteredLanguages.length > 0 && (
              <div className="p-3 border-t border-slate-50 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  {filteredLanguages.length} ta til mavjud
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
