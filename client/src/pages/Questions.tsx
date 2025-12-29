import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { confirmDialog } from '../utils/confirmDialog';


interface Question {
  _id: string;
  name: string;
  content: string;
  language: string;
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    language: 'en',
    isActive: true
  });
  const [filterLanguage, setFilterLanguage] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, [filterLanguage]);

  const fetchQuestions = async () => {
    try {
      const params = filterLanguage !== 'all' ? { language: filterLanguage } : {};
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/content/questions`, { params });
      setQuestions(response.data);
    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuestion) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/content/scripts/${editingQuestion._id}`, formData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/content/scripts`, {
          ...formData,
          category: 'question'
        });
      }
      
      setShowModal(false);
      setEditingQuestion(null);
      setFormData({
        name: '',
        content: '',
        language: 'en',
        isActive: true
      });
      fetchQuestions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirmDialog('Вы уверены, что хотите удалить этот вопрос?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/content/scripts/${questionId}`);
      fetchQuestions();
    } catch (error) {
      alert('Ошибка удаления вопроса');
    }
  };

  const getLanguageLabel = (lang: string) => {
    const labels: { [key: string]: string } = {
      en: 'English',
      ua: 'Українська',
      ru: 'Русский'
    };
    return labels[lang] || lang;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Управление вопросами</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Все языки</option>
            <option value="en">English</option>
            <option value="ua">Українська</option>
            <option value="ru">Русский</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" />
            Добавить вопрос
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question) => (
          <div key={question._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{question.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs ${question.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {question.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {getLanguageLabel(question.language)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingQuestion(question);
                    setFormData({
                      name: question.name,
                      content: question.content,
                      language: question.language,
                      isActive: question.isActive
                    });
                    setShowModal(true);
                  }}
                  className="text-primary-600 hover:text-primary-900"
                  title="Редактировать"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(question._id)}
                  className="text-red-600 hover:text-red-900"
                  title="Удалить"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">{question.content}</p>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {question.createdBy.firstName} {question.createdBy.lastName}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Язык</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="ua">Українська</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Содержание</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-64"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Активный вопрос
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
                >
                  {editingQuestion ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingQuestion(null);
                    setFormData({
                      name: '',
                      content: '',
                      language: 'en',
                      isActive: true
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;