import { useState, useCallback, useEffect } from 'react';
import { useMode } from './contexts/ModeContext';
import TrainMap from './components/TrainMap';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import BarcodeScanner from './components/BarcodeScanner';
import StatsPage from './components/StatsPage';
import ParentSettingsPage from './components/ParentSettingsPage';
import Onboarding from './components/Onboarding';
import ModeSelector from './components/ModeSelector';
import ChildTabBar from './components/ChildTabBar';
import ParentTabBar from './components/ParentTabBar';
import ChildBookShelf from './components/ChildBookShelf';
import { useBookDB } from './hooks/useBookDB';
import './App.css';

function App() {
  const { mode, setMode, loading: modeLoading } = useMode();

  // Child mode tabs: map, books, collection
  const [childTab, setChildTab] = useState('map');
  // Parent mode tabs: books, stats, settings
  const [parentTab, setParentTab] = useState('books');

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
    if (mode === 'parent') {
      setParentTab('books');
    } else {
      setChildTab('books');
    }
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

  // Mode switching
  const handleSwitchToParent = () => {
    setMode('parent');
    setParentTab('books');
  };

  const handleSwitchToChild = () => {
    setMode('child');
    setChildTab('map');
  };

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
  };

  // Loading state
  if (modeLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-train">🚂</div>
        <p className="app-loading-text">よみこみちゅう...</p>
      </div>
    );
  }

  // Mode selector (first time or no mode set)
  if (!mode) {
    return (
      <>
        <ModeSelector onSelectMode={handleSelectMode} />
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </>
    );
  }

  // Book detail view (shared between modes)
  if (selectedBook) {
    return (
      <BookDetail
        key={selectedBook.id}
        book={selectedBook}
        onBack={handleBackFromDetail}
        onUpdate={handleBookUpdate}
      />
    );
  }

  // ==========================================
  // 子どもモード (Child Mode)
  // ==========================================
  if (mode === 'child') {
    return (
      <div className="app app-child">
        {/* Main content */}
        <div className="app-content">
          <div className="tab-content" key={childTab}>
            {childTab === 'map' && <TrainMap refreshKey={refreshKey} />}
            {childTab === 'books' && (
              <ChildBookShelf
                onSelectBook={handleSelectBook}
                refreshKey={refreshKey}
              />
            )}
            {childTab === 'collection' && <TrainMap refreshKey={refreshKey} showCollectionOnly />}
          </div>
        </div>

        {/* Child Tab Bar */}
        <ChildTabBar
          activeTab={childTab}
          onTabChange={setChildTab}
          onSwitchMode={handleSwitchToParent}
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

  // ==========================================
  // 親モード (Parent Mode)
  // ==========================================
  return (
    <div className="app app-parent">
      {/* Main content */}
      <div className="app-content">
        <div className="tab-content" key={parentTab}>
          {parentTab === 'books' && (
            <BookList
              onSelectBook={handleSelectBook}
              refreshKey={refreshKey}
            />
          )}
          {parentTab === 'stats' && <StatsPage refreshKey={refreshKey} />}
          {parentTab === 'settings' && (
            <ParentSettingsPage onDataChanged={refresh} />
          )}
        </div>
      </div>

      {/* Parent Tab Bar */}
      <ParentTabBar
        activeTab={parentTab}
        onTabChange={setParentTab}
        onScanClick={() => setShowScanner(true)}
        onSwitchMode={handleSwitchToChild}
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
