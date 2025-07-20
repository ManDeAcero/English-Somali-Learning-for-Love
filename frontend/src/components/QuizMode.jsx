import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

const QuizMode = ({ words, onComplete, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // Generate multiple choice options
  const generateOptions = () => {
    if (!currentWord) return [];
    
    const correctAnswer = currentWord.english;
    const otherWords = words.filter(w => w.id !== currentWord.id);
    const wrongAnswers = otherWords
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.english);
    
    const options = [correctAnswer, ...wrongAnswers]
      .sort(() => 0.5 - Math.random());
    
    return options;
  };

  const [options] = useState(generateOptions());

  const handleAnswer = (answer) => {
    if (showAnswer) return;
    
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    const isCorrect = answer === currentWord.english;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswers([...answers, {
      word: currentWord,
      selected: answer,
      correct: isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / words.length) * 100);
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto animate-bounce" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">
              {score}/{words.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Correct
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Performance Badge:</h3>
            <Badge 
              variant="secondary" 
              className={`text-lg p-3 ${
                percentage >= 80 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : percentage >= 60 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {percentage >= 80 ? '🏆 Master' : percentage >= 60 ? '⭐ Good' : '📖 Keep Learning'}
            </Badge>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onClose}>
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentWord) return null;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Quiz Mode</CardTitle>
          <Badge variant="outline">
            {currentIndex + 1} / {words.length}
          </Badge>
        </div>
        <Progress value={progress} className="mb-2" />
        <div className="text-right text-sm text-muted-foreground">
          Score: {score}/{currentIndex + (showAnswer ? 1 : 0)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="text-center space-y-3">
          <div className="text-sm text-muted-foreground">What does this mean?</div>
          <div className="text-3xl font-bold text-primary bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentWord.somali}
          </div>
          <div className="text-sm italic text-muted-foreground">
            /{currentWord.phonetic}/
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentWord.english;
            
            let buttonClass = "h-auto p-4 text-left justify-start transition-all duration-200";
            
            if (showAnswer) {
              if (isCorrect) {
                buttonClass += " bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200";
              } else if (isSelected && !isCorrect) {
                buttonClass += " bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200";
              } else {
                buttonClass += " opacity-50";
              }
            } else {
              buttonClass += " hover:bg-primary/5 hover:border-primary/20";
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={buttonClass}
                onClick={() => handleAnswer(option)}
                disabled={showAnswer}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {showAnswer && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {showAnswer && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Cultural Tip (shown after answer) */}
        {showAnswer && currentWord.culturalTip && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm">
              <strong>Cultural Tip:</strong> {currentWord.culturalTip}
            </div>
          </div>
        )}

        {/* Next Button */}
        {showAnswer && (
          <div className="flex justify-center">
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {currentIndex < words.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizMode;