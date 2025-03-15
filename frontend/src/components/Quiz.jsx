import React, { useState, useEffect, useRef } from 'react';
import { fetchVocabulary } from '../services/api';
import '../styles/Quiz.css';

function Quiz({ selectedCategories, questionCount, onGoBack }) {
  // State for vocabulary data
  const [allVocabulary, setAllVocabulary] = useState([]);
  const [quizVocabulary, setQuizVocabulary] = useState([]);
  const [incorrectVocabulary, setIncorrectVocabulary] = useState([]);
  const [quizPhase, setQuizPhase] = useState('initial'); // 'initial' or 'repeat'

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, repeated: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Audio state
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioMode, setAudioMode] = useState(false);
  const [wordVisible, setWordVisible] = useState(true);
  const audioRef = useRef(null);

  // Load vocabulary and select random items
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setLoading(true);
        const data = await fetchVocabulary(selectedCategories);
        setAllVocabulary(data);

        // Randomly select vocabulary based on questionCount
        const randomVocabulary = selectRandomVocabulary(data, questionCount);
        setQuizVocabulary(randomVocabulary);

        setLoading(false);
      } catch (err) {
        setError('Failed to load vocabulary');
        setLoading(false);
        console.error(err);
      }
    };

    loadVocabulary();
  }, [selectedCategories, questionCount]);

  // Function to randomly select vocabulary
  const selectRandomVocabulary = (vocabulary, count) => {
    // If vocabulary count is less than requested, use all available
    if (vocabulary.length <= count) {
      return [...vocabulary];
    }

    // Otherwise, randomly select the requested number
    const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      setFeedback('Please enter an answer');
      return;
    }

    const currentWord = quizVocabulary[currentIndex];
    const correctAnswer = currentWord.german_word;

    // Simple matching for now - case insensitive
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      setFeedback('Correct!');
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        // If we're in repeat phase, increment the repeated counter too
        repeated: quizPhase === 'repeat' ? prev.repeated + 1 : prev.repeated
      }));
    } else {
      setFeedback('Incorrect');
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));

      // Add to incorrect vocabulary if not already in repeat phase
      if (quizPhase === 'initial') {
        setIncorrectVocabulary(prev => [...prev, currentWord]);
      } else {
        // In repeat phase, we'll still track words that remain incorrect
        // for possible future enhancement (e.g., show summary at end)
        setIncorrectVocabulary(prev => [...prev, currentWord]);
      }
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

    if (currentIndex < quizVocabulary.length - 1) {
      // Move to next question
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      // End of current vocabulary list

      if (quizPhase === 'initial' && incorrectVocabulary.length > 0) {
        // Switch to repeat phase
        setQuizPhase('repeat');
        setQuizVocabulary([...incorrectVocabulary]);
        setIncorrectVocabulary([]); // Reset incorrect list for this phase
        setCurrentIndex(0); // Start from the first incorrect word
      } else {
        // Quiz is completely finished
        setFeedback('Quiz complete!');
      }
    }
  };

  const playAudio = async () => {
    if (!quizVocabulary[currentIndex]) return;

    setAudioLoading(true);

    try {
      const response = await fetch(`/api/tts/?word_id=${quizVocabulary[currentIndex].id}`);
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
    if (audioMode && !loading && quizVocabulary.length > 0) {
      playAudio();
    }
  }, [currentIndex, audioMode, loading, quizVocabulary]);

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;
  if (allVocabulary.length === 0) return <div>No vocabulary items found for the selected categories.</div>;
  if (quizVocabulary.length === 0) return <div>Could not create quiz with the selected settings.</div>;

  const currentWord = quizVocabulary[currentIndex];
  const isQuizFinished = (quizPhase === 'repeat' || incorrectVocabulary.length === 0) &&
                          currentIndex >= quizVocabulary.length - 1 &&
                          showAnswer;

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

      {quizPhase === 'repeat' && (
        <div className="quiz-phase-indicator">
          <p>Reviewing incorrect answers ({quizVocabulary.length} words)</p>
        </div>
      )}

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
        <p>
          {quizPhase === 'initial'
            ? `Question ${currentIndex + 1} of ${quizVocabulary.length}`
            : `Review ${currentIndex + 1} of ${quizVocabulary.length}`}
        </p>
        <p>Score: {score.correct} correct, {score.incorrect} incorrect</p>
        {quizPhase === 'repeat' && score.repeated > 0 && (
          <p>Corrected on review: {score.repeated}</p>
        )}
      </div>

      {isQuizFinished && (
        <div className="quiz-summary">
          <h3>Quiz Complete!</h3>
          <p>Initial Questions: {questionCount}</p>
          <p>Correct on first try: {score.correct - score.repeated}</p>
          <p>Corrected on review: {score.repeated}</p>
          <p>Still incorrect: {incorrectVocabulary.length}</p>
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