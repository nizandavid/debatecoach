// Add this to server.js

// Help endpoint - Generate AI talking points
app.post('/api/get-help', async (req, res) => {
  try {
    const { topic, stance, messages } = req.body;
    
    if (!topic || !stance) {
      return res.json({ success: false, error: 'Missing topic or stance' });
    }
    
    // Build context from recent messages
    let context = '';
    if (messages && messages.length > 0) {
      context = 'Recent debate context:\n';
      messages.forEach(msg => {
        const speaker = msg.who === 'student' ? 'You' : 'Opponent';
        context += `${speaker}: ${msg.text}\n`;
      });
    }
    
    // Generate help prompt
    const helpPrompt = `You are a debate coach helping a student who is stuck in a debate.

Topic: "${topic}"
Student's Stance: ${stance}
${context}

Provide helpful guidance in JSON format with:
1. "openingLines": Array of 2-3 sentence starters they can use
2. "talkingPoints": Array of 3-4 key arguments to make
3. "counterArguments": Array of 2-3 ways to respond to opponent

Keep it concise and actionable. Format as JSON only.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: helpPrompt
        }]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      let helpText = data.content[0].text.trim();
      
      // Remove markdown code fences if present
      helpText = helpText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const helpData = JSON.parse(helpText);
      
      res.json({
        success: true,
        help: helpData
      });
    } else {
      res.json({ success: false, error: 'No response from AI' });
    }
    
  } catch (error) {
    console.error('Help generation error:', error);
    res.json({ success: false, error: error.message });
  }
});
