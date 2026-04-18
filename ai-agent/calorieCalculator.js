const foodDb = require('./foodDatabase.json');

const NORMALIZATION_MAP = {
  dosa: 'masala dosa',
  roti: 'chapati',
  sabzi: 'mixed vegetable curry',
};

function normalizeFoodName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  return NORMALIZATION_MAP[normalized] || normalized;
}

function calculateCalories(items = []) {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item?.quantity) > 0 ? Number(item.quantity) : 1;
    const normalizedName = normalizeFoodName(item?.name);
    const caloriesPerUnit = foodDb[normalizedName];

    if (typeof caloriesPerUnit !== 'number') {
      return {
        name: normalizedName,
        quantity,
        calories: null,
        message: 'Food not found in database',
      };
    }

    return {
      name: normalizedName,
      quantity,
      calories: Math.round(caloriesPerUnit * quantity),
    };
  });

  const totalCalories = calculatedItems.reduce(
    (sum, item) => sum + (typeof item.calories === 'number' ? item.calories : 0),
    0,
  );

  return {
    items: calculatedItems,
    totalCalories,
  };
}

module.exports = {
  calculateCalories,
  normalizeFoodName,
};
