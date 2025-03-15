const API_URL = 'http://localhost:8000/api';

export const fetchCategories = async () => {
  console.log('Fetching categories from:', `${API_URL}/categories/`);

  try {
    const response = await fetch(`${API_URL}/categories/`);

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Error response:', await response.text());
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    console.log('Categories data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const fetchVocabulary = async (categoryIds = []) => {
  console.log('Fetching vocabulary for categories:', categoryIds);

  try {
    const queryParams = categoryIds.map(id => `category=${id}`).join('&');
    const url = `${API_URL}/vocabulary/${queryParams ? `?${queryParams}` : ''}`;

    console.log('Fetch URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Error response:', await response.text());
      throw new Error(`Failed to fetch vocabulary: ${response.status}`);
    }

    const data = await response.json();
    console.log('Vocabulary data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const fetchAudio = async (wordId) => {
  try {
    const response = await fetch(`${API_URL}/tts/?word_id=${wordId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Audio fetch error:', error);
    throw error;
  }
};

export const getAudioForText = async (text) => {
  try {
    const response = await fetch(`${API_URL}/tts/?text=${encodeURIComponent(text)}`);

    if (!response.ok) {
      throw new Error(`Failed to generate audio: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Audio generation error:', error);
    throw error;
  }
};

export const savePerformance = async (performanceData) => {
  try {
    const response = await fetch(`${API_URL}/performance/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performanceData),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to save performance data');
    }

    return response.json();
  } catch (error) {
    console.error('Performance save error:', error);
    throw error;
  }
};