exports.handler = async (event) => {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  const userMessage = JSON.parse(event.body).message;

  const response = await fetch('/.netlify/functions/deepseek', {
    method: 'POST',
    body: JSON.stringify({ message: userInput })
  });
  const data = await response.json();
  return { statusCode: 200, body: JSON.stringify(data) };
};
