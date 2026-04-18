import FoodCard from './FoodCard';

export default function MealLog({ logs }) {
  if (!logs.length) {
    return <p className="text-sm text-txt-main/60">No meals logged today. Tap quick-add to begin.</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((item, idx) => (
        <FoodCard key={`${item.food_name}-${idx}`} item={item} />
      ))}
    </div>
  );
}
