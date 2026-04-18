import Card from '../ui/Card';
import { kCal } from '../../utils/formatters';

export default function StatsCards({ remaining, burned, net, water }) {
  const cards = [
    { label: 'Calories Remaining', value: kCal(remaining) },
    { label: 'Calories Burned', value: kCal(burned) },
    { label: 'Net Calories', value: kCal(net) },
    { label: 'Water', value: `${water} glasses` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-3">
          <p className="text-xs text-txt-main/60">{c.label}</p>
          <p className="mt-2 text-lg font-semibold text-txt-main">{c.value}</p>
        </Card>
      ))}
    </div>
  );
}
