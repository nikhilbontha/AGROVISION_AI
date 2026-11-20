import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, ArrowLeft, X, Check,
  Leaf, Activity, BarChart3, Compass, Award, ExternalLink,
  Camera, Eye, Layers, BookOpen, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useTour } from '../context/TourContext';
import { useLanguage } from '../context/LanguageContext';

export default function GuidedTour() {
  const {
    isTourActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    showWelcomeModal,
    showCompletionModal,
    startTour,
    nextStep,
    prevStep,
    skipTour
  } = useTour();

  const { language } = useLanguage();
  const isTe = language === 'te';

  const [targetRect, setTargetRect] = useState(null);
  const cardRef = useRef(null);
  const [cardDim, setCardDim] = useState({ width: 540, height: 215 });

  // Keyboard navigation: Enter / ArrowRight -> next, ArrowLeft -> prev, Escape -> skip
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skipTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, nextStep, prevStep, skipTour]);

  // Track position of the current target element (or fallback target)
  useEffect(() => {
    if (!isTourActive || !currentStep?.target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      let el = null;
      if (currentStep.target) {
        el = document.querySelector(currentStep.target);
      }
      if (!el && currentStep.fallbackTarget) {
        el = document.querySelector(currentStep.fallbackTarget);
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        });

        // Measure card dimensions if available
        if (cardRef.current) {
          const cRect = cardRef.current.getBoundingClientRect();
          if (cRect.width > 0 && cRect.height > 0) {
            setCardDim({ width: cRect.width, height: cRect.height });
          }
        }

        // Smooth scroll element into view if out of viewport
        if (rect.top < 60 || rect.bottom > window.innerHeight - 60) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 120);
    const interval = setInterval(updateRect, 250);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isTourActive, currentStep]);

  // =========================================================================
  // 1. WELCOME MODAL (FIRST VISIT TRIGGER)
  // =========================================================================
  if (showWelcomeModal) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#07241a] to-[#03140e] border border-emerald-500/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(46,237,146,0.25)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-xs font-bold text-[#2eed92] mb-4 shadow-[0_0_12px_rgba(46,237,146,0.2)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{isTe ? 'మొదటి సారి వినియోగదారు మార్గదర్శి' : 'First-Time Guided Walkthrough'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {isTe ? 'AgroVision AI కి స్వాగతం! 🌱' : 'Welcome to AgroVision AI! 🌱'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
              {isTe
                ? 'ప్లాట్‌ఫారమ్‌ను ఉపయోగించడానికి ఒక శీఘ్ర ఇంటరాక్టివ్ గైడెడ్ టూర్ తీసుకోండి. వ్యాధి గుర్తింపు, దిగుబడి అంచనా మరియు నిర్వహణ డ్యాష్‌బోర్డ్‌ను ప్రత్యక్షంగా నేర్చుకోండి.'
                : 'Take a quick interactive tour through the real website. We will open each page live and guide you through Disease Detection, Yield Prediction, and the Farm Management Dashboard.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
              <div className="p-3 rounded-2xl bg-[#041710]/80 border border-emerald-500/25">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#2eed92] flex items-center justify-center font-bold text-sm mb-2">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {isTe ? 'వ్యాధి నిర్ధారణ' : 'Disease Detection'}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {isTe ? 'విజన్ స్కాన్ & లక్షణాల ప్రశ్నావళి' : 'Vision Scan & Symptom Questionnaire'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#041710]/80 border border-emerald-500/25">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-sm mb-2">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {isTe ? 'దిగుబడి అంచనా' : 'Yield Prediction'}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {isTe ? '5-దశల శాస్త్రీయ మోడలింగ్' : '5-step predictive agronomy'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#041710]/80 border border-emerald-500/25">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#2eed92] flex items-center justify-center font-bold text-sm mb-2">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {isTe ? 'నిర్వహణ డ్యాష్‌బోర్డ్' : 'Farm Dashboard'}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {isTe ? '9 ప్రత్యేక వ్యవసాయ సాధనాలు' : '9 dedicated management modules'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={startTour}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2eed92] hover:bg-[#3bf29c] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(46,237,146,0.4)] active:scale-95 transition-all"
              >
                <span>{isTe ? 'గైడెడ్ టూర్ ప్రారంభించండి 🎓' : 'Start Full Tour 🎓'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={skipTour}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs border border-slate-700/60 transition-all"
              >
                {isTe ? 'తర్వాత చూస్తాను (Skip)' : 'Skip for Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // =========================================================================
  // 2. COMPLETION MODAL & SYSTEM MAP
  // =========================================================================
  if (showCompletionModal) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#062017] to-[#020e0a] border border-emerald-500/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(46,237,146,0.25)] text-center relative my-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-[#2eed92] mb-3">
              <Award className="w-4 h-4 text-[#2eed92]" />
              <span>{isTe ? 'టూర్ విజయవంతంగా పూర్తయింది!' : 'Tour Completed Successfully!'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {isTe ? '🎉 మీరు AgroVision AI ఉపయోగించడానికి సిద్ధంగా ఉన్నారు!' : '🎉 You’re Ready with AgroVision AI!'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto mb-6">
              {isTe
                ? 'మీరు AgroVision AI లోని ప్రధాన సామర్థ్యాలను నేర్చుకున్నారు: పంట తెగుళ్ల గుర్తింపు, దిగుబడి అంచనా మరియు వ్యవసాయ నిర్వహణ.'
                : 'You have mastered the complete workflow. Here is your AgroVision AI System Architecture Map for reference:'}
            </p>

            <div className="p-4 rounded-2xl bg-[#03130c]/90 border border-emerald-500/25 mb-6 text-left font-mono text-xs text-slate-300 space-y-3 shadow-inner">
              <div className="font-bold text-[#2eed92] text-sm flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                <span>🌱 AGROVISION AI SYSTEM ARCHITECTURE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] font-sans">
                <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-500/30">
                  <div className="font-black text-[#2eed92] text-xs mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>1. Disease Detection</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#2eed92]" /> 👁️ Vision Scan (Upload/Camera)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#2eed92]" /> 📋 Guided Questionnaire (6 Steps)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#2eed92]" /> 🔬 5-Part Pathology Dossier
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-500/30">
                  <div className="font-black text-teal-300 text-xs mb-1 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>2. Yield Prediction</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-300" /> Step 1: Farm Location & Soil
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-300" /> Step 2: Crop Phenology
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-300" /> Step 3: Inputs & Agronomy
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-300" /> Step 4: Weather & Rainfall
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-teal-300" /> Step 5: Profit & Financials
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-500/30">
                  <div className="font-black text-emerald-400 text-xs mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>3. Farm Dashboard</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> 🌾 Crop Management
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> 🛰️ Field Monitoring
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> 🌱 Soil Health (NPK)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> 🌦️ Weather & 💧 Irrigation
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" /> 🚜 Equipment, Reports & Alerts
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic mb-6">
              {isTe
                ? 'చిట్కా: మీరు ఎప్పుడైనా నావిగేషన్ బార్‌లోని "గైడెడ్ టూర్" పై క్లిక్ చేసి ఈ టూర్‌ను మళ్లీ ప్రారంభించవచ్చు.'
                : 'Tip: You can relaunch this interactive tour anytime by clicking "Take Tour" in the top navigation bar.'}
            </p>

            <button
              type="button"
              onClick={skipTour}
              className="px-8 py-3.5 rounded-2xl bg-[#2eed92] hover:bg-[#3bf29c] text-slate-950 font-black text-sm inline-flex items-center gap-2 shadow-[0_0_25px_rgba(46,237,146,0.5)] active:scale-95 transition-all"
            >
              <span>{isTe ? 'AgroVision AI ఉపయోగించడం ప్రారంభించండి 🚀' : 'Start Using AgroVision AI 🚀'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // If tour is not running, render nothing
  if (!isTourActive || !currentStep) {
    return null;
  }

  // =========================================================================
  // 3. SMART DIRECTIONAL COLLISION & SPOTLIGHT CALCULATIONS
  // =========================================================================
  const tPad = 8;
  const tTop = targetRect ? Math.max(0, targetRect.top - tPad) : 0;
  const tLeft = targetRect ? Math.max(0, targetRect.left - tPad) : 0;
  const tWidth = targetRect ? targetRect.width + tPad * 2 : 0;
  const tHeight = targetRect ? targetRect.height + tPad * 2 : 0;
  const tBottom = tTop + tHeight;
  const tRight = tLeft + tWidth;

  const targetCenterX = tLeft + tWidth / 2;
  const targetCenterY = tTop + tHeight / 2;

  // Detect whether target is docked in the left sidebar
  // When target is in sidebar (< 280px wide), placing the card below covers the other sidebar options.
  // Instead, position the card to the RIGHT of the sidebar into the open dashboard workspace!
  const isLeftSidebar = targetRect && (tLeft < 280 && tWidth < 360 && window.innerWidth >= 860);

  let cardTop = 0;
  let cardLeft = 0;
  let placement = 'below'; // 'right' | 'above' | 'below'

  if (isLeftSidebar) {
    placement = 'right';
    cardLeft = Math.min(window.innerWidth - cardDim.width - 24, tRight + 28);
    const preferredTop = targetCenterY - cardDim.height / 2;
    cardTop = Math.max(76, Math.min(window.innerHeight - cardDim.height - 24, preferredTop));
  } else if (targetRect) {
    const spaceBelow = window.innerHeight - tBottom;
    const spaceAbove = tTop;

    if (spaceBelow >= cardDim.height + 36) {
      placement = 'below';
      cardTop = tBottom + 28;
      cardLeft = Math.max(16, Math.min(window.innerWidth - cardDim.width - 16, targetCenterX - cardDim.width / 2));
    } else if (spaceAbove >= cardDim.height + 36) {
      placement = 'above';
      cardTop = Math.max(16, tTop - cardDim.height - 28);
      cardLeft = Math.max(16, Math.min(window.innerWidth - cardDim.width - 16, targetCenterX - cardDim.width / 2));
    } else {
      placement = 'below';
      cardTop = Math.max(16, window.innerHeight - cardDim.height - 24);
      cardLeft = Math.max(16, Math.min(window.innerWidth - cardDim.width - 16, targetCenterX - cardDim.width / 2));
    }
  } else {
    cardTop = window.innerHeight - cardDim.height - 30;
    cardLeft = window.innerWidth / 2 - cardDim.width / 2;
  }

  // Capsule indicator placement: flip to top of element if bottom doesn't fit
  const capsuleOnTop = tBottom + 55 > window.innerHeight;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none">
      {/* ── 4-QUADRANT BACKDROP BLUR & DIM SYSTEM (25-40% blur around target) ── */}
      {targetRect && (
        <>
          {/* Top area */}
          <div
            className="fixed top-0 left-0 right-0 bg-[#020b06]/75 backdrop-blur-[5px] transition-all duration-300 pointer-events-auto"
            style={{ height: tTop }}
          />
          {/* Bottom area */}
          <div
            className="fixed left-0 right-0 bottom-0 bg-[#020b06]/75 backdrop-blur-[5px] transition-all duration-300 pointer-events-auto"
            style={{ top: tBottom }}
          />
          {/* Left area */}
          <div
            className="fixed left-0 bg-[#020b06]/75 backdrop-blur-[5px] transition-all duration-300 pointer-events-auto"
            style={{ top: tTop, height: tHeight, width: tLeft }}
          />
          {/* Right area */}
          <div
            className="fixed right-0 bg-[#020b06]/75 backdrop-blur-[5px] transition-all duration-300 pointer-events-auto"
            style={{ top: tTop, height: tHeight, left: tRight }}
          />
        </>
      )}

      {/* ── TARGET GLOWING EMERALD RETICLE ON THE ACTUAL ELEMENT ─────────── */}
      {targetRect && (
        <div
          className="fixed transition-all duration-300 pointer-events-none rounded-3xl border-2 border-[#2eed92] shadow-[0_0_40px_rgba(46,237,146,0.65),inset_0_0_20px_rgba(46,237,146,0.2)]"
          style={{
            top: tTop,
            left: tLeft,
            width: tWidth,
            height: tHeight
          }}
        >
          {/* Reticle Corner Brackets */}
          <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#2eed92] rounded-tl-sm pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#2eed92] rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#2eed92] rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#2eed92] rounded-br-sm pointer-events-none" />

          {/* Click Here Floating Capsule Indicator (Flippable to prevent clipping) */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50 ${
              capsuleOnTop ? '-top-12' : '-bottom-12'
            }`}
          >
            {capsuleOnTop && (
              <svg className="w-5 h-5 text-[#2eed92] -mb-1 rotate-180 drop-shadow-[0_0_8px_rgba(46,237,146,0.9)] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 2L3 17l6.5-2.5L13 22l3-1.5-3.5-7.5L20 11z" />
              </svg>
            )}
            <div className="px-3 py-1 rounded-full bg-[#051c14] border border-[#2eed92] shadow-[0_0_20px_rgba(46,237,146,0.55)] flex items-center gap-1.5 text-[11px] font-black text-white whitespace-nowrap animate-bounce">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2eed92] animate-ping" />
              <span>{isTe ? currentStep.clickTextTe : currentStep.clickText}</span>
            </div>
            {!capsuleOnTop && (
              <svg className="w-5 h-5 text-[#2eed92] -mt-1 drop-shadow-[0_0_8px_rgba(46,237,146,0.9)] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 2L3 17l6.5-2.5L13 22l3-1.5-3.5-7.5L20 11z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* ── CURVED DASHED NEON CONNECTOR ARROW (Card -> Target) ─────────── */}
      {targetRect && (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9992]">
          <defs>
            <marker id="tour-arrowhead" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#2eed92" />
            </marker>
          </defs>
          {placement === 'right' ? (
            // Card is to the right of the target -> curve from card left edge to target right edge
            <path
              d={`M ${cardLeft} ${cardTop + Math.min(cardDim.height / 2, 70)} C ${cardLeft - 40} ${cardTop + Math.min(cardDim.height / 2, 70)}, ${tRight + 40} ${targetCenterY}, ${tRight + 8} ${targetCenterY}`}
              stroke="#2eed92"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
              markerEnd="url(#tour-arrowhead)"
              className="drop-shadow-[0_0_6px_rgba(46,237,146,0.7)]"
            />
          ) : placement === 'above' ? (
            // Card is above target -> curve from card bottom to target top
            <path
              d={`M ${cardLeft + cardDim.width / 2} ${cardTop + cardDim.height} C ${cardLeft + cardDim.width / 2} ${(cardTop + cardDim.height + tTop) / 2}, ${targetCenterX} ${(cardTop + cardDim.height + tTop) / 2}, ${targetCenterX} ${tTop - 8}`}
              stroke="#2eed92"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
              markerEnd="url(#tour-arrowhead)"
              className="drop-shadow-[0_0_6px_rgba(46,237,146,0.7)]"
            />
          ) : (
            // Card is below target -> curve from card top to target bottom
            <path
              d={`M ${cardLeft + cardDim.width / 2} ${cardTop} C ${cardLeft + cardDim.width / 2} ${(cardTop + tBottom) / 2}, ${targetCenterX} ${(cardTop + tBottom) / 2}, ${targetCenterX} ${tBottom + 8}`}
              stroke="#2eed92"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              fill="none"
              markerEnd="url(#tour-arrowhead)"
              className="drop-shadow-[0_0_6px_rgba(46,237,146,0.7)]"
            />
          )}
        </svg>
      )}

      {/* ── REDESIGNED FLOATING TOUR CARD (Matches User Sample Image Exactly) ── */}
      <div
        ref={cardRef}
        className="fixed z-[9995] pointer-events-auto transition-all duration-300 w-[95vw] sm:w-[540px] max-w-[560px]"
        style={{
          top: cardTop,
          left: cardLeft
        }}
      >
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: placement === 'above' ? -15 : 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="rounded-3xl bg-gradient-to-b from-[#061f16]/98 to-[#020f0a]/98 backdrop-blur-2xl border-2 border-[#2eed92]/50 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(46,237,146,0.25)] text-left"
        >
          {/* Top Bar: [📖 Step X of 11] + Step Track Dots + Close Button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Step Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#07291d] border border-emerald-500/40 text-[11px] font-black text-[#2eed92] uppercase tracking-wider shadow-sm">
              <BookOpen className="w-3 h-3 text-[#2eed92]" />
              <span>{isTe ? `దశ ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} of ${totalSteps}`}</span>
            </div>

            {/* Step Track Dots (Connected with Line) */}
            <div className="hidden sm:flex items-center gap-1.5 px-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentStepIndex
                        ? 'w-2.5 h-2.5 bg-[#2eed92] shadow-[0_0_10px_#2eed92]'
                        : idx < currentStepIndex
                          ? 'w-1.5 h-1.5 bg-emerald-600'
                          : 'w-1.5 h-1.5 bg-slate-700'
                    }`}
                  />
                  {idx < totalSteps - 1 && (
                    <div className={`w-2.5 h-0.5 ${idx < currentStepIndex ? 'bg-emerald-600/70' : 'bg-slate-800'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={skipTour}
              aria-label="Close Tour"
              className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Content Area: Left Holographic Reticle Icon + Right Title/Desc/Chips */}
          <div className="flex items-start gap-3.5 mb-3.5">
            {/* Holographic Glowing Reticle Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#041a11] border border-[#2eed92]/50 shadow-[0_0_20px_rgba(46,237,146,0.3)] flex items-center justify-center shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/15 rounded-full blur-[10px] pointer-events-none" />
              {currentStep.iconType === 'leaf' && <Leaf className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'chart' && <BarChart3 className="w-6 h-6 text-teal-300 animate-pulse relative z-10" />}
              {currentStep.iconType === 'modes' && <Eye className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'camera' && <Camera className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'samples' && <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse relative z-10" />}
              {currentStep.iconType === 'dossier' && <Layers className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'questionnaire' && <Activity className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'pipeline' && <Compass className="w-6 h-6 text-teal-300 animate-pulse relative z-10" />}
              {currentStep.iconType === 'calculate' && <CheckCircle2 className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'dashboard' && <Activity className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
              {currentStep.iconType === 'modules' && <Compass className="w-6 h-6 text-[#2eed92] animate-pulse relative z-10" />}
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-[#2eed92] shrink-0" />
                  <span className="truncate">{isTe ? currentStep.titleTe : currentStep.title}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal mb-2.5 line-clamp-3 sm:line-clamp-none">
                {isTe ? currentStep.descTe : currentStep.desc}
              </p>

              {/* Feature Chips */}
              {currentStep.chips && (
                <div className="flex flex-wrap gap-1.5">
                  {(isTe ? currentStep.chipsTe : currentStep.chips).map((chip, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-[#07291d]/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 shadow-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Real Target Click Guide + Back + Skip + Next Button */}
          <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Real Feature Interaction Hint Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.querySelector(currentStep.target) || (currentStep.fallbackTarget ? document.querySelector(currentStep.fallbackTarget) : null);
                if (el) {
                  el.click();
                  setTimeout(nextStep, 200);
                } else {
                  nextStep();
                }
              }}
              className="text-left text-[11px] font-bold text-[#2eed92] hover:text-white flex items-center gap-1.5 transition-colors group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2eed92] group-hover:rotate-12 transition-transform" />
              <span className="underline underline-offset-2">
                {isTe ? currentStep.actionTextTe : currentStep.actionText}
              </span>
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              {currentStepIndex > 0 && (
                <button
                  id="tour-prev-btn"
                  type="button"
                  onClick={prevStep}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/60 flex items-center gap-1 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isTe ? 'వెనుకకు' : 'Back'}</span>
                </button>
              )}

              <button
                id="tour-skip-btn"
                type="button"
                onClick={skipTour}
                className="px-2 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                {isTe ? 'స్కిప్' : 'Skip Tour'}
              </button>

              <button
                id="tour-next-btn"
                type="button"
                onClick={nextStep}
                className="px-4 py-2 rounded-xl bg-[#2eed92] hover:bg-[#3bf29c] text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(46,237,146,0.4)] active:scale-95 transition-all"
              >
                <span>
                  {currentStepIndex === totalSteps - 1
                    ? (isTe ? 'పూర్తి చేయండి 🚀' : 'Finish Tour 🚀')
                    : (isTe ? 'తరువాత' : 'Next')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
