import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Info, Star, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import AudioPlayer from './AudioPlayer';

const WordCard = ({ word, onFavorite, onComplete }) => {
  const [showCulturalTip, setShowCulturalTip] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    if (onComplete) onComplete(word.id, word.points);
  };

  const handleFavorite = () => {
    if (onFavorite) onFavorite(word.id);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'basic': '🌟',
      'greetings': '👋',
      'cute_tease': '😊',
      'compliments': '💝',
      'deep_talk': '💭'
    };
    return icons[category] || '📝';
  };

  const getTierColor = (tier) => {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      3: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      4: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      5: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      {isCompleted && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-green-500 text-white rounded-full p-2 shadow-lg animate-bounce">
            <Trophy className="h-4 w-4" />
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(word.category)}</span>
              <Badge className={getTierColor(word.tier)}>
                Tier {word.tier}
              </Badge>
            </div>
            <div className="flex gap-1">
              {word.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className="hover:bg-pink-50 dark:hover:bg-pink-950"
            >
              <Heart className={`h-4 w-4 ${word.isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCulturalTip(!showCulturalTip)}
              className="hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Info className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Translation */}
        <div className="space-y-2">
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary mb-1">{word.somali}</h3>
            <p className="text-lg text-muted-foreground">{word.english}</p>
          </div>
          
          {/* Audio Player */}
          <AudioPlayer text={word.somali} phonetic={word.phonetic} />
        </div>

        {/* Example */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
          <p className="font-medium text-sm text-slate-700 dark:text-slate-300">
            <strong>Example:</strong> {word.example_somali}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 italic">
            "{word.example_english}"
          </p>
        </div>

        {/* Cultural Tip */}
        {showCulturalTip && (
          <Alert className={`border-l-4 ${word.culturalTip.startsWith('DO:') ? 'border-l-green-500 bg-green-50 dark:bg-green-950' : 'border-l-red-500 bg-red-50 dark:bg-red-950'} animate-fadeIn`}>
            <AlertDescription className="text-sm">
              <strong>Cultural Tip:</strong> {word.culturalTip}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{word.points} points</span>
          </div>
          
          {!isCompleted && (
            <Button
              onClick={handleComplete}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCard;