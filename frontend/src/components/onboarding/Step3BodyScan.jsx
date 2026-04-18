import BodyScanUpload from '../ui/BodyScanUpload';

export default function Step3BodyScan({ form, update, onNext }) {
  const handleUseEstimates = (estimates) => {
    update({
      body_fat_pct: estimates.body_fat_pct,
      muscle_mass_pct: estimates.muscle_mass_pct
    });
    // Auto-advance since they accepted the estimates
    if (onNext) {
      setTimeout(() => onNext(), 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-txt-main/60">Upload a photo for AI analysis</p>
      </div>
      
      <BodyScanUpload onUseEstimates={handleUseEstimates} />
      
      <p className="text-xs text-txt-main/40 italic">
        You can securely skip this and enter values manually on the next screen if you prefer.
      </p>
    </div>
  );
}
