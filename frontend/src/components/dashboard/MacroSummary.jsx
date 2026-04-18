import MacroBar from '../ui/MacroBar';

export default function MacroSummary({ macros, goals }) {
  return (
    <div className="space-y-4">
      <MacroBar label="Protein" current={macros.protein} goal={goals.protein} color="#60A5FA" />
      <MacroBar label="Carbs" current={macros.carbs} goal={goals.carbs} color="#FB923C" />
      <MacroBar label="Fats" current={macros.fats} goal={goals.fats} color="#FACC15" />
    </div>
  );
}
