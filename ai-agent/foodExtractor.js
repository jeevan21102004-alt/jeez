const OpenAI = require('openai');

const EXTRACTION_PROMPT = `Extract food items and quantities from the input. Recognize Indian dishes. Return JSON in this format:
{
  "items": [
    { "name": "string", "quantity": 1 }
  ]
}`;

function parseJsonFromModel(outputText) {
  if (!outputText) {
    return { items: [] };
  }

  const fenced = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : outputText;

  try {
    const parsed = JSON.parse(candidate);
    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items.map((item) => ({
        name: String(item?.name || '').trim().toLowerCase(),
        quantity: Number(item?.quantity) > 0 ? Number(item.quantity) : 1,
      })).filter((item) => item.name),
    };
  } catch {
    return { items: [] };
  }
}

async function extractFoodItems({ text, imageBase64, mimeType = 'image/jpeg' }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (!text && !imageBase64) {
    throw new Error('Provide either text or image input');
  }

  const client = new OpenAI({ apiKey });

  const content = [
    {
      type: 'text',
      text: `${EXTRACTION_PROMPT}\n\nDefault quantity to 1 when not specified.`
    }
  ];

  if (text) {
    content.push({ type: 'text', text: `User input: ${text}` });
  }

  if (imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${imageBase64}` },
    });
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content }],
    temperature: 0.2,
  });

  return parseJsonFromModel(completion.choices?.[0]?.message?.content);
}

module.exports = {
  extractFoodItems,
};
