import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiCircle } from 'react-icons/fi';
import { confirmDialog } from '../utils/confirmDialog';
import { useSocket } from '../context/SocketContext';

interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isBanned: boolean;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  devices: any[];
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'hr',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/${editingUser._id}`,
          { ...formData, password: formData.password || undefined },
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/users`,
          formData,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', role: 'hr', firstName: '', lastName: '' });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirmDialog('Вы уверены, что хотите удалить этого пользователя?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    } catch (error) {
      alert('Ошибка удаления пользователя');
    }
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
        { isBanned },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchUsers();
    } catch (error) {
      alert('Ошибка изменения статуса');
    }
  };

  const getRoleLabel = (role: string) => role; // можно потом сделать красивые названия

  const getInitial = (u: User) => (u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase();

  const { onlineUsers } = useSocket();

  const isUserOnline = (email: string) => {
  return onlineUsers.some(u => u.email === email);
};

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(); }
    catch { return ''; }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="cy-card pad" style={{ display: 'grid', placeItems: 'center', height: 220 }}>
          <div className="pill">
            <span className="dot gray" />
            Загрузка пользователей…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Управление пользователями</div>
          <div className="page-subtitle">
            Пользователей: {users.length}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="cy-btn primary"
        >
          Добавить пользователя
        </button>
      </div>

      {/* Table */}
      <div className="cy-card">
        <div className="cy-toolbar">
          <div className="pill">
            <span className="dot gray" />
            Список пользователей
          </div>
          <div className="pill">
            <span className="dot green" />
            Онлайн: {onlineUsers.length}
          </div>
        </div>

        <div className="cy-table-wrap">
          <table className="cy-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Устройства</th>
                <th>Регистрация</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="cy-row">
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{getInitial(u)}</div>
                      <div>
                        <div className="user-name">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="pill">{getRoleLabel(u.role)}</span>
                  </td>

                  <td>
                    {isUserOnline(u.email) ? (
  <span className="pill online">
    <span className="dot green" />
    Онлайн
  </span>
) : (
  <span className="pill offline">
    <span className="dot gray" />
    Офлайн
    {u.lastSeen && (
      <span style={{ marginLeft: 6, opacity: 0.6 }}>
        · {formatDate(u.lastSeen)}
      </span>
    )}
  </span>
)}
                  </td>

                  <td>
                    <span className="pill">{u.devices?.length || 0}</span>
                  </td>

                  <td>
                    <span className="pill">{formatDate(u.createdAt)}</span>
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn primary"
                        onClick={() => handleEdit(u)}
                        title="Редактировать"
                      >
                        <FiEdit2 size={18} />
                      </button>

                      <button
                        className={`cy-btn ${u.isBanned ? '' : 'danger'}`}
                        onClick={() => handleBan(u._id, !u.isBanned)}
                        style={{ height: 38, padding: '0 12px' }}
                        title={u.isBanned ? 'Разблокировать' : 'Заблокировать'}
                      >
                        {u.isBanned ? 'Разблокировать' : 'Заблокировать'}
                      </button>

                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(u._id)}
                        title="Удалить"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="cy-modal-overlay">
          <div className="cy-modal">
            <div className="cy-modal-header">
              <div className="cy-modal-title">
                {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cy-modal-body">
                <div className="cy-grid">
                  <div className="cy-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="cy-input"
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  <div className="cy-field">
                    <label>Пароль</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="cy-input"
                      placeholder={editingUser ? 'Оставьте пустым для сохранения текущего' : 'Минимум 6 символов'}
                      required={!editingUser}
                    />
                  </div>

                  <div className="cy-grid two">
                    <div className="cy-field">
                      <label>Имя</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="cy-input"
                      />
                    </div>

                    <div className="cy-field">
                      <label>Фамилия</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="cy-input"
                      />
                    </div>
                  </div>

                  <div className="cy-field">
                    <label>Роль</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="cy-select"
                    >
                      <option value="hr">HR</option>
                      <option value="teamlead">Team Lead</option>
                      <option value="trainee">Trainee</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="cy-modal-footer">
                <button type="submit" className="cy-btn primary">
                  {editingUser ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  className="cy-btn ghost"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ email: '', password: '', role: 'hr', firstName: '', lastName: '' });
                  }}
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

export default Users;
