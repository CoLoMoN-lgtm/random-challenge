import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const FormContainer = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  margin: 20px auto;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 15px;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 15px;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 15px;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 5px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: #4a5568;

  input {
    margin-right: 5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 10px 25px;
  font-size: 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #667eea;
  color: white;

  &:hover {
    background-color: #5a67d8;
  }
`;

const CancelButton = styled(Button)`
  background-color: #e2e8f0;
  color: #4a5568;

  &:hover {
    background-color: #cbd5e0;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 10px 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 10px 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  text-align: center;
`;

function AddChallengeForm({ categories, onChallengeAdded, onCancel }) {
  const [formData, setFormData] = useState({
    text: '',
    category: '',
    newCategory: '',
    difficulty: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const category = formData.category === 'new' ? formData.newCategory : formData.category;
      
      if (!formData.text.trim()) {
        throw new Error('Текст челенджу не може бути порожнім');
      }
      
      if (!category.trim()) {
        throw new Error('Оберіть або введіть категорію');
      }

      const response = await axios.post('/api/challenge', {
        text: formData.text.trim(),
        category: category.trim(),
        difficulty: formData.difficulty
      });

      setSuccess('Челендж успішно додано!');
      setTimeout(() => {
        onChallengeAdded(response.data);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Помилка при додаванні челенджу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>Додати новий челендж</FormTitle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="challenge-text">Текст челенджу *</Label>
          <TextArea
            id="challenge-text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Опишіть челендж..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="challenge-category">Категорія *</Label>
          <Select
            id="challenge-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Оберіть категорію</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
            <option value="new">+ Нова категорія</option>
          </Select>
        </FormGroup>

        {formData.category === 'new' && (
          <FormGroup>
            <Label htmlFor="new-category">Назва нової категорії *</Label>
            <Input
              id="new-category"
              type="text"
              name="newCategory"
              value={formData.newCategory}
              onChange={handleChange}
              placeholder="Введіть назву категорії"
              required
            />
          </FormGroup>
        )}

        <FormGroup>
          <Label>Складність *</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                name="difficulty"
                value="easy"
                checked={formData.difficulty === 'easy'}
                onChange={handleChange}
              />
              Легко
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="difficulty"
                value="medium"
                checked={formData.difficulty === 'medium'}
                onChange={handleChange}
              />
              Середньо
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="difficulty"
                value="hard"
                checked={formData.difficulty === 'hard'}
                onChange={handleChange}
              />
              Складно
            </RadioLabel>
          </RadioGroup>
        </FormGroup>

        <ButtonGroup>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Додаю...' : 'Додати челендж'}
          </SubmitButton>
          <CancelButton type="button" onClick={onCancel}>
            Скасувати
          </CancelButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
}

export default AddChallengeForm;