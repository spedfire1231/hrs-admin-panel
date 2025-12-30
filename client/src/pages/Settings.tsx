import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShield, FiSave } from 'react-icons/fi';
import axios from 'axios';

/* ---------- компонент ---------- */
const Settings: React.FC = () => {
  const { user } = useAuth();                      // setter пока не используем
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // ---------- ПРОФИЛЬ ----------
  const { name } = useAuth();

  const [profile, setProfile] = useState({
    name: name ?? '',
  });

  // ---------- ПАРОЛЬ ----------
  const [pass, setPass] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  /* сохранить имя/фамилию */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        profile,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Профиль обновлён');
    } catch (e: any) {
      alert(e.response?.data?.error || 'Ошибка');
    }
  };

  /* смена пароля */
  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.newPass !== pass.confirm) return alert('Пароли не совпадают');
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/me/password`,
        { currentPassword: pass.current, newPassword: pass.newPass },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Пароль изменён');
      setPass({ current: '', newPass: '', confirm: '' });
    } catch (e: any) {
      alert(e.response?.data?.error || 'Ошибка');
    }
  };

  /* -------------------------  TS-совместимый массив  ------------------------- */
  const tabs = [
    { id: 'profile' as const, label: 'Профиль',      icon: FiUser },
    { id: 'security' as const, label: 'Безопасность', icon: FiShield },
  ] as const;

  /* -------------------------  рендер  ------------------------- */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ---------- Профиль ---------- */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
                <FiSave className="mr-2" /> Сохранить
              </button>
            </form>
          )}

          {/* ---------- Пароль ---------- */}
          {activeTab === 'security' && (
            <form onSubmit={handleSecuritySave} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
                <input
                  type="password"
                  value={pass.current}
                  onChange={(e) => setPass({ ...pass, current: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                <input
                  type="password"
                  value={pass.newPass}
                  onChange={(e) => setPass({ ...pass, newPass: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Подтверждение</label>
                <input
                  type="password"
                  value={pass.confirm}
                  onChange={(e) => setPass({ ...pass, confirm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
                <FiSave className="mr-2" /> Изменить пароль
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;