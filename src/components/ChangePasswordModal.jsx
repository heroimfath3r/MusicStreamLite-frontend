import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usersAPI } from '../services/api.js';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Ingrese su contraseña actual';
    if (!newPassword) e.newPassword = 'Ingrese la nueva contraseña';
    else if (newPassword.length < 6) e.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    if (newPassword !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await usersAPI.changePassword(currentPassword, newPassword);
      // Backend returns success message on 200
      alert(res?.message || 'Contraseña actualizada correctamente');
      // limpiar y cerrar
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      onClose(true);
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      // Intentar obtener mensaje del servidor
      const msg = err?.response?.data?.message || err?.message || 'Error al cambiar la contraseña';
      if (err?.response?.status === 403) {
        setErrors({ currentPassword: 'Contraseña actual incorrecta' });
      } else if (err?.response?.status === 404) {
        setErrors({ general: 'Usuario no encontrado' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onClose(false)}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Cambiar contraseña</h2>

        {errors.general && <div className="form-error">{errors.general}</div>}

        <div className="form-group">
          <label>Contraseña actual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
          {errors.currentPassword && <div className="field-error">{errors.currentPassword}</div>}
        </div>

        <div className="form-group">
          <label>Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
          {errors.newPassword && <div className="field-error">{errors.newPassword}</div>}
        </div>

        <div className="form-group">
          <label>Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />
          {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => onClose(false)} disabled={loading}>Cancelar</button>
          <motion.button
            className="btn-create"
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChangePasswordModal;
