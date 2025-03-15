import React, { useState, useEffect, useRef } from 'react';
import { fetchVocabulary } from '../services/api';
import '../styles/Quiz.css';

function Quiz({ selectedCategories, onGoBack }) {
  const [vocabulary, setVocabulary] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioMode, setAudioMode] = useState(false);
  const [wordVisible, setWordVisible] = useState(true);
  const audioRef = useRef(null);

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
    setWordVisible(true); // Always show word when revealing answer
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    setShowAnswer(false);

    // If in audio mode, hide the word again
    if (audioMode) {
      setWordVisible(false);
    } else {
      setWordVisible(true);
    }

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      // Quiz is finished
      setFeedback('Quiz complete!');
    }
  };

  const playAudio = async () => {

    if (!vocabulary[currentIndex]) return;

    setAudioLoading(true);

    try {
      const response = await fetch(`/api/tts/?word_id=${vocabulary[currentIndex].id}`);
      const data = await response.json();

      if (data.success) {
        // Create audio from base64
        const audioSrc = `data:audio/mp3;base64,${data.audio}`;

        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.play();
        }
      } else {
        console.error('Failed to get audio:', data.error);
      }
    } catch (err) {
      console.error('Error fetching audio:', err);
    } finally {
      setAudioLoading(false);
    }
  };

  const toggleAudioMode = () => {
    const newMode = !audioMode;
    setAudioMode(newMode);
    setWordVisible(!newMode);
  };

  useEffect(() => {
    // When currentIndex changes and we're in audio mode, play the audio
    if (audioMode && !loading && vocabulary.length > 0) {
      playAudio();
    }
  }, [currentIndex, audioMode, loading, vocabulary]);

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (vocabulary.length === 0) return <div>No vocabulary items found for the selected categories.</div>;

  const currentWord = vocabulary[currentIndex];
  const isQuizFinished = currentIndex >= vocabulary.length - 1 && showAnswer;

  return (
    <div className="quiz-container">
      <h2>French Learning Quiz</h2>

      <div className="quiz-controls">
        <label className="audio-mode-toggle">
          <input
            type="checkbox"
            checked={audioMode}
            onChange={toggleAudioMode}
          />
          Audio Mode (Listen Instead of Read)
        </label>
      </div>

      <div className="question">
        <h3>Translate to German:</h3>

        {wordVisible && (
          <p className="word">{currentWord.french_word}</p>
        )}

        <audio ref={audioRef} controls={false} />

        <button
          onClick={playAudio}
          disabled={audioLoading}
          className="play-audio-btn"
        >
          {audioLoading ? 'Loading...' : '🔊 Play Audio'}
        </button>
      </div>

      <div className="answer-section">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter translation in German"
          disabled={showAnswer}
          autoFocus
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
            <>
              <p>French word: <strong>{currentWord.french_word}</strong></p>
              <p>Correct answer: <strong>{currentWord.german_word}</strong></p>
            </>
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