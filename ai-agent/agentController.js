const { extractFoodItems } = require('./foodExtractor');
const { calculateCalories } = require('./calorieCalculator');

async function analyzeFood(req, res) {
  try {
    const text = req.body?.text || req.body?.input || '';

    let imageBase64 = null;
    let mimeType = 'image/jpeg';

    if (req.file?.buffer) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || mimeType;
    } else if (req.body?.imageBase64) {
      imageBase64 = req.body.imageBase64;
      mimeType = req.body.mimeType || mimeType;
    }

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Provide text or image input' });
    }

    const extracted = await extractFoodItems({ text, imageBase64, mimeType });
    const calculated = calculateCalories(extracted.items || []);

    return res.json(calculated);
  } catch (error) {
    return res.status(500).json({
      error: 'AI calorie analysis failed',
      detail: error?.message || 'Unknown error',
    });
  }
}

module.exports = {
  analyzeFood,
};
