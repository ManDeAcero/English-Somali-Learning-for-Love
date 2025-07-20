import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Volume2, Info } from 'lucide-react';

const PronunciationGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const vowelSounds = [
    { somali: 'a', english: 'a as in "pant"', example: 'pant' },
    { somali: 'aa', english: 'a as in "father"', example: 'father' },
    { somali: 'e', english: 'e as in "pent"', example: 'pent' },
    { somali: 'ee', english: 'a as in "paid"', example: 'paid' },
    { somali: 'i', english: 'i as in "sit"', example: 'sit' },
    { somali: 'ii', english: 'ee as in "seat"', example: 'seat' },
    { somali: 'o', english: 'o as in "cot"', example: 'cot' },
    { somali: 'oo', english: 'o as in "coat"', example: 'coat' },
    { somali: 'u', english: 'u as in "put"', example: 'put' },
    { somali: 'uu', english: 'oo as in "shoot"', example: 'shoot' }
  ];

  const consonantSounds = [
    { somali: 'c', english: 'like Arabic ع (pharyngeal)', example: 'unique to Somali' },
    { somali: 'dh', english: 'retroflex d', example: 'different from English' },
    { somali: 'kh', english: 'like Arabic خ', example: 'guttural h' },
    { somali: 'q', english: 'deep k sound', example: 'from back of throat' },
    { somali: 'r', english: 'trilled r (like Spanish)', example: 'rolled tongue' },
    { somali: 'x', english: 'like Arabic ح', example: 'breathy h' },
    { somali: 'sh', english: 'sh as in "shut"', example: 'shut' }
  ];

  const commonCombinations = [
    { combination: 'ca', pronunciation: 'ah', example: 'caan (milk) = "kahn"' },
    { combination: 'dh', pronunciation: 'retroflex d', example: 'dhul (land) = "dhool"' },
    { combination: 'kh', pronunciation: 'guttural h', example: 'khayr (good) = "khayr"' },
    { combination: 'sh', pronunciation: 'sh sound', example: 'shaah (tea) = "shah"' },
    { combination: 'double vowels', pronunciation: 'longer sound', example: 'aa, ee, ii, oo, uu' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Volume2 className="h-4 w-4" />
          Pronunciation Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-blue-500" />
            Somali Pronunciation Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold mb-2">🎯 Key Principle</h3>
            <p className="text-sm">
              <strong>Vowel length matters!</strong> Short and long vowels change word meanings completely. 
              Double vowels (aa, ee, ii, oo, uu) are held longer than single vowels.
            </p>
          </div>

          <Tabs defaultValue="vowels" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vowels">Vowels</TabsTrigger>
              <TabsTrigger value="consonants">Consonants</TabsTrigger>
              <TabsTrigger value="combinations">Common Patterns</TabsTrigger>
              <TabsTrigger value="tips">Pro Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="vowels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vowel Sounds (Short vs Long)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vowelSounds.map((vowel, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="font-mono text-lg min-w-[3rem]">
                            {vowel.somali}
                          </Badge>
                          <div>
                            <div className="font-medium">{vowel.english}</div>
                            <div className="text-sm text-muted-foreground">"{vowel.example}"</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consonants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Special Consonants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {consonantSounds.map((consonant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="font-mono text-lg min-w-[3rem]">
                            {consonant.somali}
                          </Badge>
                          <div>
                            <div className="font-medium">{consonant.english}</div>
                            <div className="text-sm text-muted-foreground">{consonant.example}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="combinations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Letter Combinations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {commonCombinations.map((combo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-lg min-w-[4rem]">
                            {combo.combination}
                          </Badge>
                          <div>
                            <div className="font-medium">= {combo.pronunciation}</div>
                            <div className="text-sm text-muted-foreground">{combo.example}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">✅ Do This</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="font-medium">Listen First</p>
                      <p className="text-sm">Always play the audio before attempting pronunciation</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="font-medium">Practice Vowel Length</p>
                      <p className="text-sm">Hold long vowels (aa, ee, ii) for twice as long</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="font-medium">Use Slow Speed</p>
                      <p className="text-sm">Start with "Ultra Slow" to hear each sound clearly</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">❌ Avoid This</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="font-medium">English Assumptions</p>
                      <p className="text-sm">Don't pronounce "ca" like "cat" - it's "kah"</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="font-medium">Rushing Vowels</p>
                      <p className="text-sm">Don't rush through double vowels - they're important!</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="font-medium">Ignoring Stress</p>
                      <p className="text-sm">Pay attention to which syllable is emphasized</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardHeader>
                  <CardTitle className="text-lg">🎵 Practice Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="font-bold text-blue-600">1. Listen</div>
                      <div className="text-sm">Play audio at normal speed</div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="font-bold text-purple-600">2. Slow Down</div>
                      <div className="text-sm">Use "Ultra Slow" mode</div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="font-bold text-pink-600">3. Repeat</div>
                      <div className="text-sm">Say it along with audio</div>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <div className="font-bold text-orange-600">4. Speed Up</div>
                      <div className="text-sm">Try at normal speed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PronunciationGuide;