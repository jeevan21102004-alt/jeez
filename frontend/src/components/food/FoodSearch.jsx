import { useEffect, useState } from 'react';
import { Search, Loader2, Sparkles, AlertTriangle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const API = 'http://127.0.0.1:8000';

export default function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/food/categories`);
        const data = await res.json();
        setCategories(data || []);
      } catch { /* offline */ }
    })();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/food/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data || []);
        setShowCategories(false);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  const handleCategoryClick = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/food/by-category?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      setResults(data || []);
      setShowCategories(false);
      setQuery(category);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleAiDescribe = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/api/food/ai-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish_name: aiQuery, weight_grams: 100 }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setResults([{ ...data.data, source: 'ai' }]);
        setShowAiInput(false);
        setAiQuery('');
        toast.success('AI found a match!');
      } else {
        toast.error(data.detail || 'AI could not identify the dish. Check API Key.');
      }
    } catch {
      toast.error('Failed to reach AI service. Is the server running?');
    }
    setAiLoading(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-txt-main/40" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => !query && setShowCategories(true)}
          placeholder="Search 200+ foods or regional dishes..."
          className="w-full rounded-xl border border-border-line bg-bg-card py-2.5 pl-10 pr-3 text-sm text-txt-main outline-none transition focus:border-[var(--accent-from)]/50 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)]"
        />
        {loading && <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-[var(--accent-from)]" />}
      </div>

      {/* Category chips when focused and no query */}
      {showCategories && !query && categories.length > 0 && (
        <div className="mt-2 rounded-xl border border-border-line bg-bg-card p-3">
          <p className="mb-2 text-[10px] font-medium text-txt-main/40">BROWSE BY CATEGORY</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.category}
                onClick={() => handleCategoryClick(c.category)}
                className="rounded-lg border border-border-line bg-bg-card px-2.5 py-1.5 text-xs text-txt-main/70 transition hover:bg-[var(--accent-from)]/15 hover:text-txt-main"
              >
                {c.category} <span className="text-txt-main/30">({c.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {!!results.length && (
        <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-border-line bg-bg-card p-2">
          {results.map((r, idx) => (
            <div key={`${r.name}-${idx}`}>
              {/* Low confidence warning */}
              {r.confidence === 'low' && (
                <div className="mx-2 my-1 flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-500" />
                  <p className="text-[10px] text-yellow-500/90">
                    Nutrition values for this dish are approximate. Consider weighing ingredients for accuracy.
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  onSelect(r);
                  setQuery('');
                  setResults([]);
                }}
                className="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-txt-main">{r.name}</p>
                    {(r.source === 'ai' || r.source === 'ai_generated') && (
                      <span className="flex items-center gap-0.5 rounded-full bg-[var(--accent-from)]/15 px-1.5 py-0.5 text-[8px] font-bold text-[var(--accent-from)] uppercase tracking-wider">
                        <Sparkles size={8} /> AI estimated
                      </span>
                    )}
                  </div>
                  {r.category && (
                    <span className="rounded-full bg-bg-card px-2 py-0.5 text-[9px] text-txt-main/40">{r.category}</span>
                  )}
                </div>
                {r.brand && <p className="text-[10px] text-txt-main/40">{r.brand}</p>}
                {r.description && r.source === 'ai' && (
                  <p className="text-[10px] text-txt-main/30 italic mt-0.5">{r.description}</p>
                )}
                <p className="mt-0.5 text-xs text-txt-main/50">
                  {Math.round(r.calories || 0)} kcal • P:{Math.round(r.protein_g || 0)}g C:{Math.round(r.carbs_g || 0)}g F:{Math.round(r.fats_g || 0)}g
                  <span className="text-txt-main/30"> / {r.serving_size || 100}{r.serving_unit || 'g'}</span>
                </p>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI fallback button */}
      {query.trim().length >= 2 && !loading && (
        <div className="mt-2">
          {!showAiInput ? (
            <button
              onClick={() => setShowAiInput(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--accent-from)]/30 bg-[var(--accent-from)]/5 py-2.5 text-xs text-[var(--accent-from)]/80 transition hover:bg-[var(--accent-from)]/10 hover:text-[var(--accent-from)]"
            >
              <MessageSquare size={14} />
              Can't find it? Describe it to AI
            </button>
          ) : (
            <div className="space-y-2 rounded-xl border border-[var(--accent-from)]/20 bg-[var(--accent-from)]/5 p-3">
              <p className="text-[10px] font-medium text-txt-main/50 uppercase tracking-wide">Describe your food to AI</p>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder={"e.g. one bowl of my mom's sambar with drumstick and tomato, about 300g"}
                className="w-full rounded-lg border border-border-line bg-bg-card p-2.5 text-sm text-txt-main placeholder-txt-main/25 outline-none resize-none h-20 focus:border-[var(--accent-from)]/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAiInput(false); setAiQuery(''); }}
                  className="rounded-lg px-3 py-1.5 text-xs text-txt-main/50 hover:text-txt-main"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiDescribe}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="flex-1 rounded-lg bg-gradient-to-r from-accent-from to-[var(--copper-main)] px-3 py-1.5 text-xs font-semibold text-txt-main shadow-md disabled:opacity-50"
                >
                  {aiLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" /> Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <Sparkles size={12} /> Get AI Nutrition Estimate
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
