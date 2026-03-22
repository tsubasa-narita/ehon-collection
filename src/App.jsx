import { useState, useCallback, useEffect } from 'react';
import TrainMap from './components/TrainMap';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import BarcodeScanner from './components/BarcodeScanner';
import StatsPage from './components/StatsPage';
import Onboarding from './components/Onboarding';
import TabBar from './components/TabBar';
import { useBookDB } from './hooks/useBookDB';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { getSetting, setSetting } = useBookDB();

  useEffect(() => {
    (async () => {
      const done = await getSetting('onboardingDone');
      if (!done) setShowOnboarding(true);
    })();
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await setSetting('onboardingDone', true);
  };

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleBookAdded = () => {
    setShowScanner(false);
    setActiveTab('books');
    refresh();
  };

  const handleViewExisting = (book) => {
    setShowScanner(false);
    setSelectedBook(book);
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleBookUpdate = (updatedBook) => {
    if (!updatedBook) {
      setSelectedBook(null);
    } else {
      setSelectedBook(updatedBook);
    }
    refresh();
  };

  const handleBackFromDetail = () => {
    setSelectedBook(null);
  };

  // Book detail view
  if (selectedBook) {
    return (
      <BookDetail
        book={selectedBook}
        onBack={handleBackFromDetail}
        onUpdate={handleBookUpdate}
      />
    );
  }

  return (
    <div className="app">
      {/* Main content */}
      {activeTab === 'map' && <TrainMap refreshKey={refreshKey} />}
      {activeTab === 'stats' && <StatsPage refreshKey={refreshKey} />}
      {activeTab === 'books' && (
        <BookList
          onSelectBook={handleSelectBook}
          refreshKey={refreshKey}
        />
      )}

      {/* Tab bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onScanClick={() => setShowScanner(true)}
      />

      {/* Scanner overlay */}
      {showScanner && (
        <BarcodeScanner
          onBookAdded={handleBookAdded}
          onClose={() => setShowScanner(false)}
          onViewExisting={handleViewExisting}
        />
      )}

      {/* Onboarding */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

export default App;
