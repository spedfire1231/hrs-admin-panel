import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { 
  FiUsers, 
  FiFileText, 
  FiHelpCircle, 
  FiMessageSquare,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

interface DashboardStats {
  totalUsers: number;
  onlineUsers: number;
  totalScripts: number;
  totalFaqs: number;
  totalQuestions: number;
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    onlineUsers: 0,
    totalScripts: 0,
    totalFaqs: 0,
    totalQuestions: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, scriptsRes, faqsRes, questionsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/users`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/content/scripts`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/content/faq`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/content/questions`)
      ]);

      setStats({
        totalUsers: usersRes.data.length,
        onlineUsers: onlineUsers.length,
        totalScripts: scriptsRes.data.length,
        totalFaqs: faqsRes.data.length,
        totalQuestions: questionsRes.data.length,
        recentActivity: [] // TODO: добавить логику для активности
      });
    } catch (error) {
      console.error('Ошибка загрузки данных дашборда:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Онлайн',
      value: stats.onlineUsers,
      icon: FiUsers,
      color: 'bg-green-500',
      change: 'Сейчас'
    },
    {
      title: 'Скрипты',
      value: stats.totalScripts,
      icon: FiFileText,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'FAQ',
      value: stats.totalFaqs,
      icon: FiHelpCircle,
      color: 'bg-orange-500',
      change: '+8%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
  <div className="db-wrap">
    {/* HERO */}
    <div className="db-hero">
      <h1>
        Добро пожаловать, {user?.firstName || user?.email} 
      </h1>
      <p>Управление пользователями и контентом системы HRS</p>
    </div>

    {/* STATS */}
    <div className="db-stats">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`db-stat stat-${card.color.replace('bg-', '').replace('-500', '')}`}
          >
            <div className="db-stat-title">{card.title}</div>
            <div className="db-stat-value">{card.value}</div>
            <div className="db-stat-change">{card.change}</div>

            <div className="db-stat-icon">
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>

    {/* GRID */}
    <div className="db-grid">
      {/* ACTIONS */}
      <div className="db-card">
              {/* Быстрые действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FiUsers className="w-5 h-5 text-primary-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Добавить пользователя</p>
                  <p className="text-sm text-gray-600">Создать новую учетную запись</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FiFileText className="w-5 h-15 text-primary-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Создать скрипт</p>
                  <p className="text-sm text-gray-600">Добавить новый скрипт для HR</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* SYSTEM */}
      <div className="db-card">
        <h2>Состояние системы</h2>

        <div className="db-system-row">
          <span>Статус сервера</span>
          <span className="db-pill green">Онлайн</span>
        </div>

        <div className="db-system-row">
          <span>База данных</span>
          <span className="db-pill green">Подключена</span>
        </div>

        <div className="db-system-row">
          <span>WebSocket</span>
          <span className="db-pill green">Активен</span>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;