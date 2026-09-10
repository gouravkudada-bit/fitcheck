import fs from 'fs';

async function testFitCheckAPI() {
  console.log('--- Testing FitCheck Gemini API Backend ---');

  if (!fs.existsSync('test_outfit.jpg')) {
    console.error('Error: test_outfit.jpg not found.');
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync('test_outfit.jpg');
  const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  console.log('Sending real outfit photo (62KB) to http://localhost:5173/api/check-fit with occasion: Work ...');

  try {
    const response = await fetch('http://localhost:5173/api/check-fit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Image,
        occasion: 'Work'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      return false;
    }

    console.log('\n SUCCESS! Gemini API Returned Structured JSON:');
    console.log('Score:', data.score, '/ 10');
    console.log('Vibe:', data.vibe);
    console.log('Harmony:', data.harmony);
    console.log('Occasion:', data.occasion);
    console.log('Suggestions:');
    data.suggestions.forEach((s, idx) => console.log(`  ${idx + 1}. ${s}`));
    console.log('Analyzed at:', data.analyzedAt);
    return true;
  } catch (err) {
    console.error('Fetch error:', err.message);
    return false;
  }
}

testFitCheckAPI();
