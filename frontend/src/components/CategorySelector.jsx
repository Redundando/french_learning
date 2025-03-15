import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';

function CategorySelector({ onQuizStart }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(10); // Default to 10 questions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load categories');
        setLoading(false);
        console.error(err);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleQuestionCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuestionCount(value);
  };

  const handleSubmit = () => {
    if (selectedCategories.length > 0) {
      onQuizStart(selectedCategories, questionCount);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-selector">
      <h2>Quiz Setup</h2>

      <div className="setup-section">
        <h3>Select Categories</h3>
        <div className="categories-list">
          {categories.map((category) => (
            <div key={category.id} className="category-item">
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <h3>Number of Questions</h3>
        <div className="question-count-selector">
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={questionCount}
            onChange={handleQuestionCountChange}
          />
          <span>{questionCount} questions</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedCategories.length === 0}
        className="start-quiz-button"
      >
        Start Quiz
      </button>
    </div>
  );
}

export default CategorySelector;