import React, { useState, useEffect } from 'react';
import { fetchVocabulary } from '../services/api';

function Quiz({ selectedCategories, onGoBack }) {
  const [vocabulary, setVocabulary] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setLoading(true);
        const data = await fetchVocabulary(selectedCategories);
        setVocabulary(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load vocabulary');
        setLoading(false);
        console.error(err);
      }
    };

    loadVocabulary();
  }, [selectedCategories]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      setFeedback('Please enter an answer');
      return;
    }

    const currentWord = vocabulary[currentIndex];
    const correctAnswer = currentWord.german_word;

    // Simple matching for now - case insensitive
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      setFeedback('Correct!');
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setFeedback('Incorrect');
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    setShowAnswer(false);

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      // Quiz is finished
      setFeedback('Quiz complete!');
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (vocabulary.length === 0) return <div>No vocabulary items found for the selected categories.</div>;

  const currentWord = vocabulary[currentIndex];
  const isQuizFinished = currentIndex >= vocabulary.length - 1 && showAnswer;

  return (
    <div className="quiz-container">
      <h2>French Learning Quiz</h2>

      <div className="question">
        <h3>Translate to German:</h3>
        <p className="word">{currentWord.french_word}</p>
      </div>

      <div className="answer-section">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter translation in German"
          disabled={showAnswer}
        />

        {!showAnswer ? (
          <button onClick={handleSubmit}>Submit</button>
        ) : (
          <button onClick={handleNextQuestion} disabled={isQuizFinished}>
            {isQuizFinished ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>

      {feedback && (
        <div className={`feedback ${feedback === 'Correct!' ? 'correct' : 'incorrect'}`}>
          <p>{feedback}</p>
          {showAnswer && (
            <p>Correct answer: <strong>{currentWord.german_word}</strong></p>
          )}
        </div>
      )}

      <div className="progress">
        <p>Question {currentIndex + 1} of {vocabulary.length}</p>
        <p>Score: {score.correct} correct, {score.incorrect} incorrect</p>
      </div>

      {isQuizFinished && (
        <div className="quiz-summary">
          <h3>Quiz Complete!</h3>
          <p>Final Score: {score.correct} out of {vocabulary.length}</p>
          <button onClick={onGoBack}>Back to Categories</button>
        </div>
      )}

      <button className="back-button" onClick={onGoBack}>
        ← Back to Categories
      </button>
    </div>
  );
}

export default Quiz;