import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import PronunciationGuide from '../components/PronunciationGuide';

// Simple test component to show the pronunciation guide
const TestPronunciation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Somali Pronunciation Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Testing the pronunciation guide component
          </p>
          <PronunciationGuide />
        </div>

        {/* Sample Word Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-primary">Salam alaykum</h3>
                  <p className="text-lg text-muted-foreground">Peace be upon you</p>
                  <p className="text-sm text-muted-foreground italic">/sah-LAHM ah-LAY-koom/</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Pronunciation Note:</strong> The "Salam" sounds like "sah-LAHM" (not like English "salad"). 
                  The emphasis is on the second syllable of "alaykum".
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-primary">Caan</h3>
                  <p className="text-lg text-muted-foreground">Milk</p>
                  <p className="text-sm text-muted-foreground italic">/kahn/</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Important:</strong> "Ca" in Somali is pronounced like "kah" (not like English "cat"). 
                  This is a common mistake for English speakers!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle>🎯 How to Use the Pronunciation Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">1️⃣</div>
                <h4 className="font-semibold mb-2">Click the Guide</h4>
                <p className="text-sm">Open the pronunciation reference to understand Somali sounds</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">2️⃣</div>
                <h4 className="font-semibold mb-2">Learn the Patterns</h4>
                <p className="text-sm">Study how letters like "ca", "dh", "kh" differ from English</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">3️⃣</div>
                <h4 className="font-semibold mb-2">Practice with Audio</h4>
                <p className="text-sm">Use the speed controls to hear sounds clearly</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TestPronunciation;