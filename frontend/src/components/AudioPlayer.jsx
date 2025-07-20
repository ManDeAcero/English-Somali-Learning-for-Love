import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { generateMockAudio } from '../data/mock';

const AudioPlayer = ({ text, phonetic }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);

  const speedOptions = [
    { value: 'normal', label: 'Normal', icon: '🎯' },
    { value: 'slow', label: 'Slow', icon: '🐢' },
    { value: 'ultra', label: 'Ultra Slow', icon: '🐌' }
  ];

  const handlePlayPause = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      // Mock audio generation
      const audioUrl = await generateMockAudio(text, currentSpeed);
      console.log('Generated audio for:', text, 'at speed:', currentSpeed);
      
      // Simulate audio playback
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000); // Mock 2-second audio
      
    } catch (error) {
      console.error('Audio generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="space-y-4">
        {/* Text Display */}
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-primary">{text}</p>
          <p className="text-sm text-muted-foreground italic">/{phonetic}/</p>
        </div>

        {/* Speed Controls */}
        <div className="flex gap-2 justify-center">
          {speedOptions.map((speed) => (
            <Button
              key={speed.value}
              variant={currentSpeed === speed.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSpeed(speed.value)}
              className="transition-all duration-200 hover:scale-105"
            >
              <span className="mr-1">{speed.icon}</span>
              {speed.label}
            </Button>
          ))}
        </div>

        {/* Play Button */}
        <div className="flex justify-center">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : isPlaying ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : isPlaying ? 'Playing...' : 'Listen'}
          </Button>
        </div>

        {/* Visual Feedback */}
        {isPlaying && (
          <div className="flex justify-center items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AudioPlayer;