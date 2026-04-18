export default function FoodCard({ item }) {
  return (
    <div className="rounded-xl border border-border-line bg-bg-card p-3">
      <p className="text-sm font-medium text-txt-main">{item.food_name}</p>
      <p className="mt-1 text-xs text-txt-main/60">{item.meal_type}</p>
      <p className="mt-2 text-xs text-txt-main/70">
        {Math.round(item.calories)} kcal | P {Math.round(item.protein_g)} C {Math.round(item.carbs_g)} F {Math.round(item.fats_g)}
      </p>
    </div>
  );
}
