
export const analyzeProcessWithAisha = async (processData: any, modelType: 'fast' | 'deep' = 'fast') => {
  try {
    const token = localStorage.getItem('urbanus_token');

    const response = await fetch('/api/aisha/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        processData,
        modelType,
      }),
    });

    if (!response.ok) {
      console.error('AISHA API error:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("AISHA Runtime Error:", error);
    return null;
  }
};
