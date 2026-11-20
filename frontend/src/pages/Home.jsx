import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { language } = useLanguage();

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto text-center px-4 py-2 sm:py-4">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Capsule Badge */}
      <motion.div
        id="tour-home-hero"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#07241a]/90 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-[0_0_12px_rgba(46,237,146,0.15)] mb-3"
      >
        <Leaf className="w-3.5 h-3.5 text-[#2eed92]" />
        <span>
          {language === 'te'
            ? 'తెలివైన వ్యవసాయ నిర్ణయాల కోసం AI సాధనాలు.'
            : 'AI-powered tools for smarter farming decisions.'}
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-tight mb-2.5"
      >
        <span>{language === 'te' ? 'AgroVision AI కి ' : 'Welcome to '}</span>
        <span className="relative inline-block text-[#2eed92]">
          {language === 'te' ? 'స్వాగతం' : 'AgroVision AI'}
          <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#2eed92] rounded-full shadow-[0_0_8px_#2eed92]" />
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed mb-6 sm:mb-8"
      >
        {language === 'te'
          ? 'వ్యాధి నిర్ధారణ, దిగుబడి అంచనా మరియు మెరుగైన వ్యవసాయ నిర్వహణ కోసం పంట మేధస్సు.'
          : 'Crop intelligence for disease diagnosis, yield estimation, and better farm management.'}
      </motion.p>

      {/* Two Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 w-full max-w-4xl mx-auto px-2">
        {/* Card 1: Disease Detection */}
        <motion.div
          id="tour-home-disease"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#061c15]/80 backdrop-blur-2xl border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_48px_rgba(46,237,146,0.22)] transition-all duration-300 flex flex-col items-center text-center justify-between group"
        >
          {/* Reticle Leaf Icon Box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#07241a] to-[#04140e] border border-emerald-500/35 flex items-center justify-center mb-4 sm:mb-5 shadow-[0_0_20px_rgba(46,237,146,0.15)] group-hover:border-[#2eed92] group-hover:shadow-[0_0_25px_rgba(46,237,146,0.35)] transition-all relative">
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#2eed92] rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#2eed92] rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#2eed92] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#2eed92] rounded-br-sm pointer-events-none" />
            <Leaf className="w-6 h-6 text-[#2eed92] group-hover:scale-110 transition-transform duration-300" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
            {language === 'te' ? 'పంట తెగుళ్ల గుర్తింపు' : 'Disease Detection'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs font-normal">
            {language === 'te'
              ? 'ఆకుల ఫోటోల నుండి పంట తెగుళ్లను గుర్తించి సమగ్ర చికిత్సా సిఫార్సులను పొందండి.'
              : 'Identify crop diseases from leaf images and get treatment recommendations.'}
          </p>

          <Link
            to="/disease-detection"
            className="inline-flex items-center gap-2 bg-[#2eed92] hover:bg-[#34d399] text-slate-950 font-black py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(46,237,146,0.3)] hover:shadow-[0_0_22px_rgba(46,237,146,0.55)] active:scale-95 text-xs sm:text-sm"
          >
            <span>{language === 'te' ? 'వ్యాధిని గుర్తించండి' : 'Detect Disease'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </Link>
        </motion.div>

        {/* Card 2: Yield Prediction */}
        <motion.div
          id="tour-home-yield"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#061c15]/80 backdrop-blur-2xl border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_48px_rgba(46,237,146,0.22)] transition-all duration-300 flex flex-col items-center text-center justify-between group"
        >
          {/* Trending Graph Icon Box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#07241a] to-[#04140e] border border-emerald-500/35 flex items-center justify-center mb-4 sm:mb-5 shadow-[0_0_20px_rgba(46,237,146,0.15)] group-hover:border-[#2eed92] group-hover:shadow-[0_0_25px_rgba(46,237,146,0.35)] transition-all relative">
            <TrendingUp className="w-7 h-7 text-[#2eed92] group-hover:scale-110 transition-transform duration-300" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
            {language === 'te' ? 'దిగుబడి అంచనా' : 'Yield Prediction'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs font-normal">
            {language === 'te'
              ? 'పంట దిగుబడిని అంచనా వేసి మార్కెట్ మరియు ఆర్థిక విశ్లేషణలను పొందండి.'
              : 'Estimate crop yield and get market and financial insights.'}
          </p>

          <Link
            to="/yield-prediction"
            className="inline-flex items-center gap-2 bg-[#2eed92] hover:bg-[#34d399] text-slate-950 font-black py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(46,237,146,0.3)] hover:shadow-[0_0_22px_rgba(46,237,146,0.55)] active:scale-95 text-xs sm:text-sm"
          >
            <span>{language === 'te' ? 'దిగుబడిని అంచనా వేయండి' : 'Predict Yield'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
