exports.handler = async (event) => {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const userMessage = JSON.parse(event.body).message;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: userMessage }]
    })
  });

  const data = await response.json();
  return { statusCode: 200, body: JSON.stringify(data) };
};
