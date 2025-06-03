import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import CategorySelector from './components/CategorySelector';
import ChallengeDisplay from './components/ChallengeDisplay';
import AddChallengeForm from './components/AddChallengeForm';
import ConnectionStatus from './components/ConnectionStatus';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { GlobalStyle } from './styles/GlobalStyle';
import api from './utils/api';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

const GenerateButton = styled.button`
  display: block;
  margin: 30px auto;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background-color: #4c51bf;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
`;

const ToggleFormButton = styled.button`
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  font-size: 1rem;
  color: #4c51bf;
  background-color: white;
  border: 2px solid #4c51bf;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #4c51bf;
    color: white;
  }
`;

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCategories();
    checkConnection();

    const connectionInterval = setInterval(checkConnection, 5000);
    return () => clearInterval(connectionInterval);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Categories response is not an array:', response.data);
        setCategories([]);
      }
    } catch (err) {
      setError('Не вдалося завантажити категорії');
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const checkConnection = async () => {
    try {
      await axios.get('/api/health');
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    }
  };

  const generateChallenge = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = selectedCategory === 'all' 
        ? '/api/challenge/random' 
        : `/api/challenge/random/${selectedCategory}`;
      
      const response = await axios.get(endpoint);
      setCurrentChallenge(response.data);
    } catch (err) {
      setError('Не вдалося згенерувати челендж. Спробуйте ще раз.');
      console.error('Error generating challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeAdded = (newChallenge) => {
    setShowAddForm(false);
    fetchCategories(); // Оновити категорії якщо додана нова
    setCurrentChallenge(newChallenge);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header />
        <ConnectionStatus isConnected={isConnected} />
        
        <MainContent>
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <GenerateButton 
            onClick={generateChallenge}
            disabled={loading || !isConnected}
          >
            {loading ? 'Генерую...' : 'Згенерувати челендж'}
          </GenerateButton>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {loading && <LoadingSpinner />}

          {currentChallenge && !loading && (
            <ChallengeDisplay challenge={currentChallenge} />
          )}

          <ToggleFormButton onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Сховати форму' : 'Додати новий челендж'}
          </ToggleFormButton>

          {showAddForm && (
            <AddChallengeForm
              categories={categories}
              onChallengeAdded={handleChallengeAdded}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </MainContent>
      </AppContainer>
    </>
  );
}

export default App;