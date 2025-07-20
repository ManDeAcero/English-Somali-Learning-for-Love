import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Trophy, Flame, Star, Crown } from 'lucide-react';

const ProgressBar = ({ userProgress }) => {
  const { level, total_points, current_streak, unlocked_tiers, badges_earned } = userProgress;
  
  const nextLevelPoints = level * 100; // Example: level 3 needs 300 points
  const currentLevelProgress = (total_points % 100); // Progress within current level
  
  return (
    <Card className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            <span>Level {level} - Somali Scholar</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-300" />
              <span className="text-sm">{current_streak} day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="text-sm">{total_points} points</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {level + 1}</span>
            <span>{currentLevelProgress}/100 points</span>
          </div>
          <Progress 
            value={currentLevelProgress} 
            className="bg-white/20"
          />
        </div>
        
        {/* Unlocked Tiers */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Unlocked Tiers:</p>
          <div className="flex gap-2 flex-wrap">
            {unlocked_tiers.map((tier, index) => (
              <Badge 
                key={tier} 
                variant="secondary" 
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Tier {tier}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Badges */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Badges:</p>
          <div className="flex gap-3">
            {badges_earned.slice(0, 3).map((badgeId) => {
              const badgeInfo = getBadgeInfo(badgeId);
              return (
                <div
                  key={badgeId}
                  className="flex flex-col items-center p-2 rounded-lg bg-white/20 text-white shadow-lg"
                >
                  <span className="text-lg mb-1">{badgeInfo.icon}</span>
                  <span className="text-xs text-center">{badgeInfo.name}</span>
                </div>
              );
            })}
            {badges_earned.length > 3 && (
              <div className="flex flex-col items-center p-2 rounded-lg bg-white/20 text-white shadow-lg">
                <span className="text-lg mb-1">+{badges_earned.length - 3}</span>
                <span className="text-xs text-center">More</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getBadgeInfo = (badgeId) => {
  const badges = {
    'newcomer': { name: 'Welcome!', icon: '🎯' },
    'first_favorite': { name: 'First Love', icon: '💝' },
    'first_quiz': { name: 'Quiz Starter', icon: '🧠' },
    'level_2': { name: 'Rising Scholar', icon: '📚' },
    'level_3': { name: 'Dedicated Learner', icon: '🌟' },
    'week_warrior': { name: 'Week Warrior', icon: '🔥' },
    'tier_master': { name: 'Tier Climber', icon: '🏔️' },
    'quiz_master': { name: 'Quiz Champion', icon: '🏆' }
  };
  return badges[badgeId] || { name: badgeId, icon: '🏅' };
};

export default ProgressBar;