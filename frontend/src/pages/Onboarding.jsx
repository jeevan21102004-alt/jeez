import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Flame, Sparkles } from 'lucide-react';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Step1Personal from '../components/onboarding/Step1Personal';
import Step2Goals from '../components/onboarding/Step2Goals';
import Step3BodyScan from '../components/onboarding/Step3BodyScan';
import Step3Activity from '../components/onboarding/Step3Activity';
import Step4BodyComp from '../components/onboarding/Step4BodyComp';
import Step4Target from '../components/onboarding/Step4Target';
import Step6TargetComp from '../components/onboarding/Step6TargetComp';
import Step5Results from '../components/onboarding/Step5Results';
import { useUserStore } from '../store/userStore';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateProfile, setOnboarded } = useUserStore();
  const navigate = useNavigate();

  // Form state (no zod/react-hook-form — simpler and avoids silent validation failures)
  const [form, setForm] = useState({
    name: 'Jeevan',
    age: 22,
    gender: 'Male',
    heightCm: 175,
    weightKg: 78,
    goal: 'Lose Weight',
    activityLevel: 'Moderately Active',
    body_fat_pct: '',
    muscle_mass_pct: '',
    targetWeightKg: 72,
    target_body_fat_pct: '',
    target_muscle_mass_pct: '',
    timelineWeeks: 16,
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const progress = useMemo(() => (step / 8) * 100, [step]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter your name in Step 1');
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        age: form.age,
        gender: form.gender,
        height_cm: form.heightCm,
        weight_kg: form.weightKg,
        goal: form.goal,
        activity_level: form.activityLevel,
        body_fat_pct: form.body_fat_pct ? Number(form.body_fat_pct) : null,
        muscle_mass_pct: form.muscle_mass_pct ? Number(form.muscle_mass_pct) : null,
        target_weight_kg: form.targetWeightKg,
        target_body_fat_pct: form.target_body_fat_pct ? Number(form.target_body_fat_pct) : null,
        target_muscle_mass_pct: form.target_muscle_mass_pct ? Number(form.target_muscle_mass_pct) : null,
        timeline_weeks: form.timelineWeeks,
      };

      const res = await fetch('http://127.0.0.1:8000/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResults(data.calculations);

      updateProfile({
        name: form.name,
        age: form.age,
        gender: form.gender,
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        targetWeightKg: form.targetWeightKg,
        timelineWeeks: form.timelineWeeks,
        goal: form.goal,
        activityLevel: form.activityLevel,
        calorieGoal: data.calculations.daily_calorie_goal,
        protein: data.calculations.macro_split.protein_g,
        carbs: data.calculations.macro_split.carbs_g,
        fats: data.calculations.macro_split.fats_g,
      });
      setStep(8);
      toast.success('Your personalized plan is ready! 🎯');
    } catch (err) {
      console.error('Onboarding error:', err);
      toast.error('Unable to calculate plan – check if backend is running');
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (step === 1 && !form.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setStep((s) => Math.min(8, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const stepTitles = ['About You', 'Your Goal', 'AI Body Scan', 'Activity Level', 'Current Body Comp', 'Target Weight', 'Target Body Comp', 'Your Plan'];

  return (
    <div className="mx-auto max-w-xl p-4 pt-8">
      {/* Logo */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-from to-[var(--copper-main)]">
          <Flame size={20} className="text-txt-main" />
        </div>
        <span className="text-2xl font-bold text-txt-main">CalAI</span>
        <span className="rounded-full bg-[var(--copper-main)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--copper-main)]">PRO</span>
      </div>

      <Card className="space-y-6 p-6">
        {/* Progress */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-medium text-txt-main/80">{stepTitles[step - 1]}</div>
            <div className="text-xs text-txt-main/50">Step {step} of 8</div>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-accent-from to-[var(--copper-main)]"
            />
          </div>
        </div>

        <div className="space-y-4 text-txt-main">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              {step === 1 && <Step1Personal form={form} update={update} />}
              {step === 2 && <Step2Goals form={form} update={update} />}
              {step === 3 && <Step3BodyScan form={form} update={update} onNext={next} />}
              {step === 4 && <Step3Activity form={form} update={update} />}
              {step === 5 && <Step4BodyComp form={form} update={update} />}
              {step === 6 && <Step4Target form={form} update={update} />}
              {step === 7 && <Step6TargetComp form={form} update={update} />}
              {step === 8 && <Step5Results results={results} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 1}>Back</Button>
            {step === 3 && <Button type="button" onClick={next} variant="ghost" className="opacity-70">Skip</Button>}
            {step < 7 && step !== 3 && <Button type="button" onClick={next}>Continue →</Button>}
            {step === 7 && (
              <Button type="button" onClick={submit} disabled={loading}>
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="mr-1" /> Generate Plan
                  </>
                )}
              </Button>
            )}
            {step === 8 && (
              <Button
                type="button"
                onClick={() => {
                  setOnboarded(true);
                  navigate('/dashboard');
                }}
              >
                Enter CalAI 🚀
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
