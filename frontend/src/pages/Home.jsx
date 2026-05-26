import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scan, Sprout, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  return (
    <>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] pt-4 pb-12 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 mt-8 md:mt-0"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
            <span className="text-[#22c55e]">{t('home.welcome')}</span>
          </h1>
          <p className="text-sm md:text-base text-gray-200 max-w-lg mx-auto mb-10 drop-shadow-md">
            {t('home.title')} - {t('home.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto px-4 lg:px-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 md:p-10 rounded-[20px] shadow-2xl transition-all flex flex-col items-center text-center"
            style={{
              background: "rgba(9,18,40,0.78)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,255,140,.25)"
            }}
          >
            <div className="w-14 h-14 bg-[#0B1120] rounded-full flex items-center justify-center mb-6">
              <Scan className="w-6 h-6 text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-white">{t('home.diseaseTitle')}</h2>
            <p className="text-gray-400 text-sm mb-8 flex-1 leading-relaxed max-w-xs">{t('home.diseaseDesc')}</p>
            <Link to="/disease-detection" className="inline-block bg-[#22c55e] text-black font-bold py-2.5 px-8 rounded-lg hover:bg-[#16a34a] transition-all">
              {t('home.button')}
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 md:p-10 rounded-[20px] shadow-2xl transition-all flex flex-col items-center text-center"
            style={{
              background: "rgba(9,18,40,0.78)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,255,140,.25)"
            }}
          >
            <div className="w-14 h-14 bg-[#0B1120] rounded-full flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-white">{t('home.yieldTitle')}</h2>
            <p className="text-gray-400 text-sm mb-8 flex-1 leading-relaxed max-w-xs">{t('home.yieldDesc')}</p>
            <Link to="/yield-prediction" className="inline-block bg-[#22c55e] text-black font-bold py-2.5 px-8 rounded-lg hover:bg-[#16a34a] transition-all">
              {t('home.button')}
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Home;