import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';

function CategorySelector({ onCategoriesSelected }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
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

  const handleSubmit = () => {
    if (selectedCategories.length > 0) {
      onCategoriesSelected(selectedCategories);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-selector">
      <h2>Select Categories</h2>
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
      <button
        onClick={handleSubmit}
        disabled={selectedCategories.length === 0}
      >
        Start Quiz
      </button>
    </div>
  );
}

export default CategorySelector;