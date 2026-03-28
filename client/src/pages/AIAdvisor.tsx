import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Brain, Send, Zap, TrendingUp, Shield, Target, Lightbulb, BarChart3, Sparkles, MessageSquare, Bot, User as UserIcon, Star } from "lucide-react";
import { CDN_IMAGES } from "@/lib/images";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message { role: "user" | "assistant"; content: string; timestamp: Date; }

const aiInsights = [
  { title: 'aiInsights.highValueOpportunity.title', description: 'aiInsights.highValueOpportunity.description', priority: "high", category: 'aiInsights.category.opportunity' },
  { title: 'aiInsights.riskAlert.title', description: 'aiInsights.riskAlert.description', priority: "medium", category: 'aiInsights.category.alert' },
  { title: 'aiInsights.diversificationRecommendation.title', description: 'aiInsights.diversificationRecommendation.description', priority: "medium", category: 'aiInsights.category.strategy' },
  { title: 'aiInsights.outstandingPerformance.title', description: 'aiInsights.outstandingPerformance.description', priority: "low", category: 'aiInsights.category.analysis' },
];

const matchingResults = [
  { opportunity: 'matchingResults.luxuryRetail.opportunity', matchScore: 95, reasons: ['matchingResults.reason.matchesHistory', 'matchingResults.reason.highRoi', 'matchingResults.reason.provenLocation'], roi: "68%", risk: 'matchingResults.risk.low' },
  { opportunity: "Tech Partnership — AI Platform", matchScore: 88, reasons: ["Fast-growing sector", "Complements portfolio", "Long-term partnership"], roi: "90%", risk: "High" },
  { opportunity: "Restaurant & Cafe — KAFD", matchScore: 82, reasons: ["Stable returns", "High traffic", "Sector diversification"], roi: "72%", risk: "Low" },
];

const predefinedQuestions = [
  'predefinedQuestions.bestOpportunity',
  'predefinedQuestions.improvePortfolio',
  'predefinedQuestions.potentialRisks',
  'predefinedQuestions.diversificationStrategy',
];

export default function AIAdvisor() {
  const { theme } = useTheme();
  const { t, locale, isRTL } = useLanguage();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `${t("dashboard.aiAdvisor.welcomeMessage").replace("{name}", user?.name || t("dashboard.layout.investor"))}`, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"insights" | "matching" | "chat">("insights");

  const goldColor = 'var(--gold)';
  const greenColor = '#4CAF50';
  const blueColor = '#6464FF';

  const priorityColors: Record<string, string> = { high: greenColor, medium: goldColor, low: blueColor };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input, timestamp: new Date() }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: t('aiAdvisor.aiResponse'),
        timestamp: new Date()
      }]);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with background */}
      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
        <div className="absolute inset-0">
          <img src={CDN_IMAGES.saudiExpo1} alt={t('aiAdvisor.headerImageAlt')} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.80) 0%, rgba(10, 10, 10, 0.80) 100%)'
          }} />
        </div>
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5" style={{ color: goldColor }} />
            <span className="text-[10px] font-bold tracking-[0.25em]">AI ADVISOR</span>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full glass" style={{ color: greenColor }}>
              <Sparkles className="w-3 h-3" /> {t("dashboard.aiAdvisor.title")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#F5F5F5' }}>{t('aiAdvisor.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>{t('aiAdvisor.description')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: "insights" as const, label: t('aiAdvisor.tabs.insights'), icon: Lightbulb },
          { key: "matching" as const, label: t('aiAdvisor.tabs.matchingEngine'), icon: Target },
          { key: "chat" as const, label: t('aiAdvisor.tabs.aiChat'), icon: MessageSquare },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300"
            style={{
              background: activeTab === tab.key ? `${goldColor}12` : 'transparent',
              color: activeTab === tab.key ? goldColor : ('#7a7a8e'),
              border: `1px solid ${activeTab === tab.key ? `${goldColor}20` : 'transparent'}`,
            }}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Insights */}
      {activeTab === "insights" && (
        <div className="space-y-3">
          {aiInsights.map((insight, i) => {
            const iColor = priorityColors[insight.priority] || goldColor;
            return (
              <div key={i} className="stat-card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${iColor}15` }}>
                    {insight.priority === "high" ? <Zap className="w-5 h-5" style={{ color: iColor }} /> : insight.priority === "medium" ? <Shield className="w-5 h-5" style={{ color: iColor }} /> : <BarChart3 className="w-5 h-5" style={{ color: iColor }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${iColor}15`, color: iColor }}>{insight.category}</span>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{insight.title}</h3>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Matching */}
      {activeTab === "matching" && (
        <div className="space-y-4">
          <div className="stat-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" style={{ color: greenColor }} />
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t('aiAdvisor.matchingEngine.title')}</p>
            </div>
            <p className="text-[10px]" style={{ color: '#9a9aae' }}>{t('aiAdvisor.matchingEngine.description')}</p>
          </div>
          {matchingResults.map((match, i) => (
            <div key={i} className="stat-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{match.opportunity}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px]" style={{ color: goldColor }}>ROI: {match.roi}</span>
                    <span className="text-[10px]" style={{ color: match.risk === "Low" ? greenColor : '#FF6464' }}>{t("dashboard.aiAdvisor.risk").replace("{level}", match.risk)}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: match.matchScore >= 90 ? greenColor : goldColor }}>{match.matchScore}%</div>
                  <p className="text-[8px]" style={{ color: 'var(--text-secondary)' }}>{t('aiAdvisor.match')}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {match.reasons.map((reason, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 shrink-0" style={{ color: goldColor }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{reason}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ width: `${match.matchScore}%`, background: `linear-gradient(90deg, ${goldColor}, ${greenColor})` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat */}
      {activeTab === "chat" && (
        <div className="stat-card overflow-hidden">
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{
                  background: msg.role === 'assistant' ? `linear-gradient(135deg, ${goldColor}, ${goldColor}99)` : `${goldColor}20`,
                }}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4" style={{ color: 'var(--text-primary)' }} /> : <UserIcon className="w-4 h-4" style={{ color: goldColor }} />}
                </div>
                <div className="max-w-[75%] rounded-xl p-3" style={{
                  background: msg.role === 'user' ? `${goldColor}12` : ('rgba(36,34,30,0.6)'),
                  border: `1px solid ${msg.role === 'user' ? `${goldColor}20` : ('rgba(255,255,255,0.05)')}`,
                }}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#ccc' }}>{msg.content}</p>
                  <p className="text-[8px] mt-1" style={{ color: '#6B5B45' }}>{msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 flex gap-2 overflow-x-auto" style={{ borderTop: `1px solid ${'rgba(255,255,255,0.05)'}` }}>
            {predefinedQuestions.map((q, i) => (
              <button key={i} onClick={() => setInput(q)} className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all"
                style={{ background: `${goldColor}08`, color: goldColor, border: `1px solid ${goldColor}15` }}>
                {q}
              </button>
            ))}
          </div>
          <div className="p-3 flex items-center gap-2" style={{ borderTop: `1px solid ${`${goldColor}10`}` }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('aiAdvisor.chat.placeholder')}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--card)', border: `1px solid ${`${goldColor}10`}`, color: 'var(--text-primary)' }} />
            <button onClick={handleSend} className="glass-btn-gold glass-btn-ripple w-10 h-10 flex items-center justify-center !rounded-xl !p-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
