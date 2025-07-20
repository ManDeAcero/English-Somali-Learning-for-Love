import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, 
  Heart, 
  BookOpen, 
  Trophy, 
  Filter,
  Shuffle,
  Download,
  AlertCircle 
} from 'lucide-react';
import axios from 'axios';

import WordCard from '../components/WordCard';
import ProgressBar from '../components/ProgressBar';
import TierSelector from '../components/TierSelector';
import CategoryFilter from '../components/CategoryFilter';
import QuizMode from '../components/QuizMode';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  // State for data
  const [words, setWords] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tiers, setTiers] = useState([]);
  
  // State for UI
  const [selectedTier, setSelectedTier] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [showCulturalPopup, setShowCulturalPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingTier, setPendingTier] = useState(null);

  const userId = 'demo_user'; // In a real app, this would come from auth

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load user progress (creates user if not exists)
      const progressRes = await axios.get(`${BACKEND_URL}/api/progress/users/${userId}/progress`);
      setUserProgress(progressRes.data);
      
      // Load tiers
      const tiersRes = await axios.get(`${BACKEND_URL}/api/tiers/tiers`);
      setTiers(tiersRes.data.tiers);
      
      // Load categories
      const categoriesRes = await axios.get(`${BACKEND_URL}/api/somali/categories`);
      setCategories(categoriesRes.data.categories);
      
      // Load words for initial tier
      await loadWordsForTier(1);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWordsForTier = async (tierId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/somali/words/tier/${tierId}`);
      setWords(response.data.words);
    } catch (error) {
      console.error('Failed to load words for tier:', error);
    }
  };

  // Filter words based on current filters
  const filteredWords = words.filter(word => {
    const matchesTier = word.tier === selectedTier;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(word.category);
    const matchesSearch = word.somali.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         word.english.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || (userProgress?.favorites || []).includes(word.id);
    
    return matchesTier && matchesCategory && matchesSearch && matchesFavorites;
  });

  const favoriteWords = words.filter(word => (userProgress?.favorites || []).includes(word.id));

  const handleFavorite = async (wordId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/progress/users/${userId}/progress`, {
        favorite_toggled: wordId
      });
      
      // Refresh user progress
      const progressRes = await axios.get(`${BACKEND_URL}/api/progress/users/${userId}/progress`);
      setUserProgress(progressRes.data);
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleWordComplete = async (wordId, points) => {
    try {
      await axios.put(`${BACKEND_URL}/api/progress/users/${userId}/progress`, {
        word_completed: wordId,
        points_earned: points
      });
      
      // Refresh user progress
      const progressRes = await axios.get(`${BACKEND_URL}/api/progress/users/${userId}/progress`);
      setUserProgress(progressRes.data);
      
    } catch (error) {
      console.error('Failed to complete word:', error);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleTierSelect = async (tierId) => {
    try {
      // Check if tier can be unlocked
      const unlockCheck = await axios.get(`${BACKEND_URL}/api/tiers/tiers/check-unlock/${tierId}?user_id=${userId}`);
      
      if (!unlockCheck.data.can_unlock && !unlockCheck.data.already_unlocked) {
        const missingReqs = unlockCheck.data.missing_requirements;
        const culturalReq = missingReqs.find(req => req.type === 'cultural_acknowledgment');
        
        if (culturalReq) {
          setPendingTier(tierId);
          setShowCulturalPopup(true);
          return;
        } else {
          alert(`Cannot unlock tier ${tierId}. Requirements: ${missingReqs.map(req => req.message || `${req.type}: ${req.required}`).join(', ')}`);
          return;
        }
      }
      
      setSelectedTier(tierId);
      await loadWordsForTier(tierId);
      
    } catch (error) {
      console.error('Failed to select tier:', error);
    }
  };

  const handleCulturalAcceptance = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/tiers/tiers/${pendingTier}/cultural-acknowledge?user_id=${userId}`);
      
      // Refresh user progress
      const progressRes = await axios.get(`${BACKEND_URL}/api/progress/users/${userId}/progress`);
      setUserProgress(progressRes.data);
      
      setShowCulturalPopup(false);
      setSelectedTier(pendingTier);
      await loadWordsForTier(pendingTier);
      setPendingTier(null);
      
    } catch (error) {
      console.error('Failed to acknowledge cultural guidelines:', error);
    }
  };

  const startQuiz = async (useOnlyFavorites = false) => {
    const quizWords = useOnlyFavorites ? favoriteWords : filteredWords;
    if (quizWords.length === 0) return;
    
    try {
      const wordIds = quizWords.map(w => w.id);
      const response = await axios.post(`${BACKEND_URL}/api/quiz/quiz/generate`, {
        user_id: userId,
        word_ids: wordIds,
        question_count: Math.min(10, wordIds.length)
      });
      
      setIsQuizMode(response.data);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleAnkiExport = () => {
    const exportData = filteredWords.map(word => ({
      Front: word.somali,
      Back: word.english,
      Phonetic: word.phonetic,
      Example: word.example_somali,
      ExampleEnglish: word.example_english,
      'Cultural Tip': word.cultural_tip
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `somali-words-tier-${selectedTier}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg">Loading your Somali learning journey...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (isQuizMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto py-8">
          <QuizMode 
            words={filteredWords}
            onComplete={() => setIsQuizMode(false)}
            onClose={() => setIsQuizMode(false)}
          />
        </div>
      </div>
    );
  }

  // Filter words based on current filters
  const filteredWords = words.filter(word => {
    const matchesTier = word.tier === selectedTier;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(word.category);
    const matchesSearch = word.somali.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         word.english.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || word.isFavorite;
    
    return matchesTier && matchesCategory && matchesSearch && matchesFavorites;
  });

  const favoriteWords = words.filter(word => word.isFavorite);

  const handleFavorite = (wordId) => {
    setWords(prevWords => 
      prevWords.map(word => 
        word.id === wordId 
          ? { ...word, isFavorite: !word.isFavorite }
          : word
      )
    );
  };

  const handleWordComplete = (wordId, points) => {
    setUserProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
      completedWords: [...prev.completedWords, wordId]
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTierSelect = (tierId) => {
    // Check if tier contains sensitive content
    if (tierId >= 4 && !showCulturalPopup) {
      setShowCulturalPopup(true);
      return;
    }
    setSelectedTier(tierId);
  };

  const handleCulturalAcceptance = () => {
    setShowCulturalPopup(false);
    setSelectedTier(4); // or whichever tier was selected
  };

  const startQuiz = (useOnlyFavorites = false) => {
    const quizWords = useOnlyFavorites ? favoriteWords : filteredWords;
    if (quizWords.length === 0) return;
    
    setIsQuizMode(quizWords);
  };

  const handleAnkiExport = () => {
    const exportData = filteredWords.map(word => ({
      Front: word.somali,
      Back: word.english,
      Phonetic: word.phonetic,
      Example: word.example,
      'Cultural Tip': word.culturalTip
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `somali-words-tier-${selectedTier}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isQuizMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto py-8">
          <QuizMode 
            words={isQuizMode}
            onComplete={() => setIsQuizMode(false)}
            onClose={() => setIsQuizMode(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Cultural Sensitivity Popup */}
      {showCulturalPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                <CardTitle>Cultural Respect Notice</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You're about to access content with romantic and flirty expressions. 
                Please use these phrases respectfully and appropriately within Somali cultural context.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border-l-4 border-orange-500">
                <p className="text-xs">
                  <strong>Remember:</strong> Cultural sensitivity is key to meaningful communication. 
                  These phrases should be used with respect and understanding of social contexts.
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCulturalPopup(false)}>
                  Go Back
                </Button>
                <Button onClick={handleCulturalAcceptance}>
                  I Understand
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Somali Learning PWA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master Somali through culturally-aware, gamified learning. From basic greetings to romantic expressions - learn with respect and confidence.
          </p>
        </div>

        {/* Progress Section */}
        <ProgressBar userProgress={userProgress} />

        {/* Tier Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Choose Your Learning Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TierSelector 
              selectedTier={selectedTier}
              onTierSelect={handleTierSelect}
              unlockedTiers={userProgress.unlockedTiers}
            />
          </CardContent>
        </Card>

        {/* Learning Tabs */}
        <Tabs defaultValue="words" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="words" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learn Words
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites ({favoriteWords.length})
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Quiz Mode
            </TabsTrigger>
          </TabsList>

          {/* Words Tab */}
          <TabsContent value="words" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Somali or English words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnkiExport}
                  disabled={filteredWords.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Anki
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            <CategoryFilter
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearAll={() => setSelectedCategories([])}
            />

            {/* Words Grid */}
            {filteredWords.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No words found</h3>
                  <p className="text-muted-foreground text-center">
                    Try adjusting your filters or search terms
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredWords.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    onFavorite={handleFavorite}
                    onComplete={handleWordComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {favoriteWords.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground text-center">
                    Heart some words to add them to your favorites
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Favorite Words</h2>
                  <Button onClick={() => startQuiz(true)} disabled={favoriteWords.length === 0}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Quiz Favorites
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favoriteWords.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      onFavorite={handleFavorite}
                      onComplete={handleWordComplete}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Your Knowledge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Choose from different quiz modes to test your Somali vocabulary
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => startQuiz(false)}
                    disabled={filteredWords.length === 0}
                    className="h-20 flex-col gap-2"
                  >
                    <Shuffle className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Current Tier Quiz</div>
                      <div className="text-xs opacity-75">{filteredWords.length} words</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => startQuiz(true)}
                    disabled={favoriteWords.length === 0}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                  >
                    <Heart className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">Favorites Quiz</div>
                      <div className="text-xs opacity-75">{favoriteWords.length} words</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;