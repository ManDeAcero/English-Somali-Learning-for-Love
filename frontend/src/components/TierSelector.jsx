import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Lock, CheckCircle } from 'lucide-react';
import { TIERS } from '../data/mock';

const TierSelector = ({ selectedTier, onTierSelect, unlockedTiers = [1, 2, 3] }) => {
  const getTierIcon = (tierId) => {
    const icons = {
      1: '🌟',
      2: '👋',
      3: '🧙‍♂️',
      4: '💕',
      5: '🎯'
    };
    return icons[tierId] || '📚';
  };

  const isUnlocked = (tierId) => unlockedTiers.includes(tierId);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {TIERS.map((tier) => {
        const unlocked = isUnlocked(tier.id);
        const isSelected = selectedTier === tier.id;
        
        return (
          <Card
            key={tier.id}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              isSelected 
                ? 'ring-2 ring-primary shadow-lg scale-105' 
                : unlocked 
                ? 'hover:shadow-md' 
                : 'opacity-60 cursor-not-allowed'
            } ${unlocked ? '' : 'grayscale'}`}
            onClick={() => unlocked && onTierSelect(tier.id)}
          >
            <CardContent className="p-4 text-center space-y-3">
              {/* Tier Icon */}
              <div className="text-3xl">
                {unlocked ? getTierIcon(tier.id) : <Lock className="h-8 w-8 mx-auto text-gray-400" />}
              </div>
              
              {/* Tier Name */}
              <div className="space-y-2">
                <h3 className={`font-bold text-sm ${unlocked ? 'text-primary' : 'text-gray-400'}`}>
                  {tier.name}
                </h3>
                
                {/* Tier Status */}
                <div className="flex justify-center">
                  {unlocked ? (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TierSelector;