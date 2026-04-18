import { ShieldAlert, Fingerprint } from 'lucide-react';
import Button from './Button';

export default function BodyScanResult({ data, onUseEstimates }) {
  if (!data) return null;

  const midpointBf = ((data.bf_estimate_low + data.bf_estimate_high) / 2).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--accent-from)]/30 bg-[var(--accent-from)]/5 p-4 relative overflow-hidden">
        <Fingerprint size={120} className="absolute -bottom-6 -right-6 text-[var(--accent-from)]/10" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-semibold text-txt-main">AI Physique Analysis</h4>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
              data.confidence === 'High' ? 'bg-[#43D9AD]/20 text-[#43D9AD]' :
              data.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {data.confidence} Confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-txt-main/50 mb-1">Estimated Body Fat</p>
              <p className="text-lg font-bold text-txt-main">
                {data.bf_estimate_low}% - {data.bf_estimate_high}%
              </p>
            </div>
            <div>
              <p className="text-xs text-txt-main/50 mb-1">Muscle Mass Est.</p>
              <p className="text-lg font-bold text-txt-main">
                ~{data.muscle_estimate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-txt-main/50 mb-1">Physique Type</p>
              <p className="text-sm font-medium text-[var(--copper-main)]">
                {data.physique_type}
              </p>
            </div>
            <div>
              <p className="text-xs text-txt-main/50 mb-1">Visible Definition</p>
              <p className="text-sm font-medium text-txt-main/80">
                {data.visible_definition}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-txt-main/70 italic leading-relaxed">
              "{data.notes}"
            </p>
          </div>

          {onUseEstimates && (
            <Button
              className="w-full mt-4"
              onClick={() => onUseEstimates({
                body_fat_pct: midpointBf,
                muscle_mass_pct: data.muscle_estimate
              })}
            >
              Use these estimates
            </Button>
          )}
        </div>
      </div>

      <p className="text-[10px] text-txt-main/40 flex items-start gap-1.5 px-2">
        <ShieldAlert size={12} className="shrink-0 mt-0.5" />
        This is an AI estimate for reference only, not a medical measurement. DEXA scan is the gold standard for accurate results.
      </p>
    </div>
  );
}
