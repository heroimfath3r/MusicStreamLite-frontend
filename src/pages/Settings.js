// src/pages/Settings.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaLock,
  FaLanguage
} from 'react-icons/fa';
import './Settings.css';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';

const Settings = () => {
  const [settings, setSettings] = useState({
    language: 'es'
  });
  const [showChangeModal, setShowChangeModal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="settings-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="settings-content">
        <motion.div
          className="settings-header"
          variants={cardVariants}
        >
          <h1 className="settings-title">Configuración</h1>
          <p className="settings-subtitle">Personaliza tu experiencia en MusicStream</p>
        </motion.div>

        {/* Idioma */}
        <motion.div
          className="settings-section"
          variants={cardVariants}
        >
          <div className="section-header">
            <FaLanguage className="section-icon" />
            <h2 className="section-title">Idioma y Región</h2>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-label">Idioma de la aplicación</div>
                <div className="setting-description">
                  Esta aplicación está disponible en Español
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacidad */}
        <motion.div
          className="settings-section"
          variants={cardVariants}
        >
          <div className="section-header">
            <FaLock className="section-icon" />
            <h2 className="section-title">Privacidad y Seguridad</h2>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowChangeModal(true)}
              >
                Cambiar contraseña
              </motion.button>
              {showChangeModal && (
                <ChangePasswordModal
                  isOpen={showChangeModal}
                  onClose={() => setShowChangeModal(false)}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;