import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wallet, 
  Receipt, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Sparkles,
  Loader2,
  ChevronRight,
  RefreshCcw,
  Info,
  Mail,
  CheckCircle2,
  Trophy,
  BookOpen,
  Brain,
  FileJson,
  ShieldCheck,
  Lightbulb,
  Volume2,
  MessageSquareQuote
} from "lucide-react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type FinancialState = 'calm' | 'warning' | 'urgent';

type AppMode = 'storyteller' | 'protective' | 'analyst' | 'character' | 'coach' | 'monthly' | 'autonomous' | 'normalization' | 'detection' | 'insight' | 'voice' | 'storytelling_agent';

interface FinancialData {
  balance: string;
  bills: string;
  dueDates: string;
  changes: string;
  daysUntilIncome: string;
  category: string;
  trendDescription: string;
  timePeriod: string;
  billName: string;
  billAmount: string;
  billChange: string;
  billDueDate: string;
  event: string;
  context: string;
  incomeSummary: string;
  spendingSummary: string;
  notableEvents: string;
  autonomousData: string;
  rawFinancialData: string;
  monthlyExpenses: string;
  currentMonthData: string;
  previousMonthData: string;
  insights: string;
  selectedState: string;
  notableChanges: string;
  selectedVoice: string;
  state: FinancialState;
}

export default function App() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const [mode, setMode] = useState<AppMode>('storyteller');
  const [data, setData] = useState<FinancialData>({
    balance: '',
    bills: '',
    dueDates: '',
    changes: '',
    daysUntilIncome: '',
    category: '',
    trendDescription: '',
    timePeriod: '',
    billName: '',
    billAmount: '',
    billChange: '',
    billDueDate: '',
    event: '',
    context: '',
    incomeSummary: '',
    spendingSummary: '',
    notableEvents: '',
    autonomousData: '',
    rawFinancialData: '',
    monthlyExpenses: '',
    currentMonthData: '',
    previousMonthData: '',
    insights: '',
    selectedState: 'calm',
    notableChanges: '',
    selectedVoice: 'observer',
    state: 'calm'
  });
  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const generateStory = async () => {
    // Validation based on mode
    if (mode === 'storyteller' && (!data.balance || !data.bills)) {
      setError("Please provide at least your balance and bills.");
      return;
    }
    if (mode === 'protective' && (!data.balance || !data.daysUntilIncome)) {
      setError("Please provide your balance and days until next income.");
      return;
    }
    if (mode === 'analyst' && (!data.category || !data.trendDescription)) {
      setError("Please provide a category and a trend description.");
      return;
    }
    if (mode === 'character' && (!data.billName || !data.billAmount)) {
      setError("Please provide a bill name and amount.");
      return;
    }
    if (mode === 'coach' && !data.event) {
      setError("Please describe the financial win.");
      return;
    }
    if (mode === 'monthly' && (!data.incomeSummary || !data.spendingSummary)) {
      setError("Please provide at least income and spending summaries.");
      return;
    }
    if (mode === 'autonomous' && !data.autonomousData) {
      setError("Please provide some financial data or a situation to analyze.");
      return;
    }
    if (mode === 'normalization' && !data.rawFinancialData) {
      setError("Please provide raw financial data to normalize.");
      return;
    }
    if (mode === 'detection' && (!data.balance || !data.bills || !data.daysUntilIncome)) {
      setError("Please provide balance, bills, and days until income for detection.");
      return;
    }
    if (mode === 'insight' && (!data.currentMonthData || !data.previousMonthData)) {
      setError("Please provide both current and previous month data for insights.");
      return;
    }
    if (mode === 'voice' && !data.insights) {
      setError("Please provide insights for voice selection.");
      return;
    }
    if (mode === 'storytelling_agent' && (!data.balance || !data.bills)) {
      setError("Please provide at least balance and bills for the narrative.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = getPrompt();

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (response.text) {
        setStory(response.text);
      } else {
        throw new Error("No response generated.");
      }
    } catch (err) {
      console.error(err);
      setError("I couldn't quite find the words right now. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setData({
      balance: '',
      bills: '',
      dueDates: '',
      changes: '',
      daysUntilIncome: '',
      category: '',
      trendDescription: '',
      timePeriod: '',
      billName: '',
      billAmount: '',
      billChange: '',
      billDueDate: '',
      event: '',
      context: '',
      incomeSummary: '',
      spendingSummary: '',
      notableEvents: '',
      autonomousData: '',
      rawFinancialData: '',
      monthlyExpenses: '',
      currentMonthData: '',
      previousMonthData: '',
      insights: '',
      selectedState: 'calm',
      notableChanges: '',
      selectedVoice: 'observer',
      state: 'calm'
    });
    setStory(null);
    setError(null);
    setEmailSent(false);
  };

  const sendEmailNotification = async () => {
    if (!email || !story) return;
    
    setIsSendingEmail(true);
    setError(null);
    
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subject: getSubject(),
          message: story
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEmailSent(true);
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to send email. Is your RESEND_API_KEY set?");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getSubject = () => {
    if (mode === 'protective') return '🚨 Financial Alert';
    if (mode === 'analyst') return '📈 Financial Insight';
    if (mode === 'character') return '💬 A Message from your Bill';
    if (mode === 'coach') return '🏆 Financial Win!';
    if (mode === 'monthly') return '📖 Your Monthly Financial Story';
    if (mode === 'autonomous') return '🧠 Autonomous Financial Insight';
    if (mode === 'normalization') return '📊 Normalized Financial Data';
    if (mode === 'detection') return '🛡️ Financial State Detection';
    if (mode === 'insight') return '💡 Financial Insights';
    if (mode === 'voice') return '🎙️ Voice Selection';
    if (mode === 'storytelling_agent') return '📖 Financial Narrative';
    return '✨ Financial Story';
  };

  const getPrompt = () => {
    if (mode === 'storyteller') {
      return `
You are a financial storytelling assistant.
Your job is to interpret a user’s financial situation and explain it as a short, human, emotionally intelligent narrative.
Avoid sounding like a bank or dashboard.
Do NOT list data mechanically.
Speak like a calm, aware guide observing patterns.

INPUT:
- Balance: ${data.balance}
- Bills: ${data.bills}
- Upcoming due dates: ${data.dueDates}
- Changes from last month: ${data.changes}
- Financial state: ${data.state}

OUTPUT:
Write 2–4 sentences that describe what’s happening financially.
If relevant, highlight patterns, changes, or risks.
Keep it natural, slightly conversational, and insightful.
      `.trim();
    } else if (mode === 'protective') {
      return `
You are a protective financial assistant.
The user is approaching a risky financial situation.
Be clear, direct, and calm—but firm.
Do NOT panic or exaggerate.
Focus on what will happen next if no action is taken.

INPUT:
- Balance: ${data.balance}
- Upcoming payments: ${data.bills || data.dueDates}
- Days until next income: ${data.daysUntilIncome}

OUTPUT:
Write a short message (2–3 sentences) explaining the risk and what’s about to happen.
Make the user feel aware, not judged.
      `.trim();
    } else if (mode === 'analyst') {
      return `
You are a financial pattern analyst who communicates like a thoughtful observer.
Your goal is to highlight meaningful changes over time.

INPUT:
- Category: ${data.category}
- Trend: ${data.trendDescription}
- Duration: ${data.timePeriod}

OUTPUT:
Write a short narrative insight (1–3 sentences) that explains the pattern in a human way.
Avoid numbers overload.
Focus on what the pattern might mean.
      `.trim();
    } else if (mode === 'character') {
      return `
You are a bill speaking as a subtle character.

INPUT:
- bill name: ${data.billName}
- amount: ${data.billAmount}
- change from last month: ${data.billChange}

OUTPUT:
Write 1 sentence in first person.

STYLE:
- Not cartoonish
- Slight personality

Examples:
- Rent → steady, predictable
- Subscriptions → sneaky, multiplying
- Utilities → fluctuating
      `.trim();
    } else if (mode === 'coach') {
      return `
You are an encouraging financial coach.
The user has done something positive financially.

INPUT:
- Event: ${data.event}
- Context: ${data.context}

OUTPUT:
Write 1–2 sentences acknowledging the win.
Make it feel earned, not exaggerated.
      `.trim();
    } else if (mode === 'monthly') {
      return `
You are a financial storyteller summarizing a user's month.

Structure it like a short story with a beginning, middle, and forward-looking ending.

INPUT:
- Income summary: ${data.incomeSummary}
- Spending summary: ${data.spendingSummary}
- Key changes: ${data.changes}
- Notable events: ${data.notableEvents}

OUTPUT:
Write a 4–6 sentence “financial story of the month.”
Make it reflective and insightful.
End with a subtle forward-looking statement.
      `.trim();
    } else if (mode === 'autonomous') {
      return `
You are an autonomous financial storytelling system made up of multiple internal agents.

Your job is to:
1. Understand the user’s financial situation from structured data
2. Detect risks, changes, and patterns
3. Decide the correct tone and urgency
4. Generate a human, story-like financial narrative

You MUST think in steps:
- First: interpret the data
- Second: determine financial state (calm, stable, warning, urgent)
- Third: identify patterns or anomalies
- Fourth: decide voice (coach, advisor, protector, observer)
- Fifth: generate final narrative output

Never output raw analysis.
Only output the final narrative unless explicitly asked.

INPUT:
${data.autonomousData}

Your tone should feel:
- Human
- Observant
- Context-aware
- Never robotic or overly technical
      `.trim();
    } else if (mode === 'normalization') {
      return `
You are a financial data normalization agent.

Your job is to take raw financial data and convert it into a clean, structured format.

INPUT:
${data.rawFinancialData}

OUTPUT format:
{
  "balance": number,
  "monthly_income": number,
  "monthly_expenses": number,
  "bills": [
    {
      "name": string,
      "amount": number,
      "due_date": date,
      "category": string,
      "recurring": true/false
    }
  ],
  "subscriptions_total": number
}

Rules:
- Group similar transactions into categories
- Identify recurring payments
- Estimate totals if exact data is missing
- Be consistent and clean
- ONLY output the JSON object.
      `.trim();
    } else if (mode === 'detection') {
      return `
You are a financial state detection agent.

Your job is to evaluate the user's financial condition.

INPUT:
- balance: ${data.balance}
- upcoming bills: ${data.bills}
- monthly expenses: ${data.monthlyExpenses}
- days until next income: ${data.daysUntilIncome}

OUTPUT format:
{
  "state": "calm" | "stable" | "warning" | "urgent",
  "risk_reason": string,
  "confidence": "high" | "medium" | "low"
}

Guidelines:
- "calm": strong buffer, low risk
- "stable": normal flow, no immediate issues
- "warning": tightening cash or rising expenses
- "urgent": risk of overdraft or missed payment

Be realistic, not overly dramatic.
- ONLY output the JSON object.
      `.trim();
    } else if (mode === 'insight') {
      return `
You are a financial insight agent.

Your role is to detect meaningful patterns, not just report numbers.

INPUT:
- current month data: ${data.currentMonthData}
- previous month data: ${data.previousMonthData}

Look for:
- Spending increases or decreases
- Bill changes
- New subscriptions
- Behavioral shifts (earlier/later payments)
- Repeating trends (2+ months)

OUTPUT format:
{
  "insights": [
    "string insight 1",
    "string insight 2"
  ],
  "notable_changes": [
    "string change"
  ]
}

Rules:
- Only include meaningful insights
- Avoid obvious statements
- Focus on patterns that affect behavior or future outcomes
- ONLY output the JSON object.
      `.trim();
    } else if (mode === 'voice') {
      return `
You are a voice selection agent.

Your job is to select the tone/personality based on financial state.

INPUT:
- state: ${data.selectedState}
- insights: ${data.insights}

OUTPUT format:
{
  "voice": "coach" | "advisor" | "protector" | "observer",
  "tone_description": string
}

Rules:
- calm → observer
- stable → coach
- warning → advisor
- urgent → protector

Override rules:
- If risk is high → always "protector"
- If strong positive trend → "coach"
- ONLY output the JSON object.
      `.trim();
    } else {
      return `
You are a financial storytelling agent.

Your job is to turn financial data into a short, meaningful narrative.

INPUT:
- state: ${data.selectedState}
- balance: ${data.balance}
- bills: ${data.bills}
- insights: ${data.insights}
- notable changes: ${data.notableChanges}
- voice: ${data.selectedVoice}

STYLE RULES:
- Do NOT list numbers mechanically
- Do NOT sound like a bank or app
- Speak like someone who understands the user’s situation
- Keep it 3–5 sentences max

VOICE STYLES:

Observer:
Calm, reflective, neutral

Coach:
Encouraging, forward-looking

Advisor:
Slightly cautionary, thoughtful

Protector:
Direct, clear, focused on risk

OUTPUT:
A short financial narrative that:
- Explains what’s happening
- Highlights 1–2 key insights
- Suggests awareness or action subtly
      `.trim();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center justify-center p-3 rounded-2xl mb-4 transition-colors ${
              mode === 'storyteller' ? 'bg-indigo-100 text-indigo-600' : 
              mode === 'protective' ? 'bg-rose-100 text-rose-600' :
              mode === 'analyst' ? 'bg-emerald-100 text-emerald-600' :
              mode === 'monthly' ? 'bg-sky-100 text-sky-600' :
              mode === 'autonomous' ? 'bg-slate-100 text-slate-600' :
              mode === 'normalization' ? 'bg-cyan-100 text-cyan-600' :
              mode === 'detection' ? 'bg-teal-100 text-teal-600' :
              mode === 'insight' ? 'bg-fuchsia-100 text-fuchsia-600' :
              mode === 'voice' ? 'bg-indigo-100 text-indigo-600' :
              'bg-purple-100 text-purple-600'
            }`}
          >
            {mode === 'storyteller' ? <Sparkles className="w-8 h-8" /> : 
             mode === 'protective' ? <AlertCircle className="w-8 h-8" /> :
             mode === 'analyst' ? <TrendingUp className="w-8 h-8" /> :
             mode === 'character' ? <Receipt className="w-8 h-8" /> :
             mode === 'coach' ? <Trophy className="w-8 h-8" /> :
             mode === 'monthly' ? <BookOpen className="w-8 h-8" /> :
             mode === 'autonomous' ? <Brain className="w-8 h-8" /> :
             mode === 'normalization' ? <FileJson className="w-8 h-8" /> :
             mode === 'detection' ? <ShieldCheck className="w-8 h-8" /> :
             mode === 'insight' ? <Lightbulb className="w-8 h-8" /> :
             mode === 'voice' ? <Volume2 className="w-8 h-8" /> :
             <MessageSquareQuote className="w-8 h-8" />}
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {mode === 'storyteller' ? 'Financial Storyteller' : 
             mode === 'protective' ? 'Protective Assistant' :
             mode === 'analyst' ? 'Pattern Analyst' :
             mode === 'character' ? 'Bill Character' :
             mode === 'coach' ? 'Encouraging Coach' :
             mode === 'monthly' ? 'Monthly Summary' :
             mode === 'autonomous' ? 'Autonomous System' :
             mode === 'normalization' ? 'Data Normalizer' :
             mode === 'detection' ? 'State Detector' :
             mode === 'insight' ? 'Insight Agent' :
             mode === 'voice' ? 'Voice Selector' :
             'Storytelling Agent'}
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            {mode === 'storyteller' 
              ? "Give me the numbers, and I'll tell you the story they're trying to whisper."
              : mode === 'protective'
              ? "Direct, calm, and firm guidance for when the numbers look a bit tight."
              : mode === 'analyst'
              ? "A thoughtful observer highlighting the meaningful changes in your habits."
              : mode === 'character'
              ? "What if your bills could talk? A clever perspective from your expenses."
              : mode === 'coach'
              ? "Acknowledging your financial wins, because every step forward counts."
              : mode === 'monthly'
              ? "A reflective narrative of your month, from the first paycheck to the final bill."
              : mode === 'autonomous'
              ? "A multi-agent intelligence that detects patterns and decides the best voice for your data."
              : mode === 'normalization'
              ? "Convert your messy transactions and bills into a clean, structured JSON format."
              : mode === 'detection'
              ? "Evaluate your financial condition and detect potential risks before they happen."
              : mode === 'insight'
              ? "Detect meaningful patterns and behavioral shifts by comparing your monthly data."
              : mode === 'voice'
              ? "Select the perfect tone and personality for your financial updates based on your current state."
              : "Turn your financial data into a short, meaningful narrative with a custom voice."}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex gap-1 overflow-x-auto max-w-full no-scrollbar">
            {(['storyteller', 'protective', 'analyst', 'character', 'coach', 'monthly', 'autonomous', 'normalization', 'detection', 'insight', 'voice', 'storytelling_agent'] as AppMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStory(null); }}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                  mode === m ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="activeMode"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 capitalize">
                  {m === 'storytelling_agent' ? 'Story Agent' : m}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100">
          <AnimatePresence mode="wait">
            {!story ? (
              <motion.div 
                key="input-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mode === 'analyst' ? (
                  <>
                    {/* Category */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        Spending Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Groceries, Subscriptions"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={data.category}
                        onChange={(e) => setData({ ...data, category: e.target.value })}
                      />
                    </motion.div>

                    {/* Duration */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Time Period
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Last 3 months"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        value={data.timePeriod}
                        onChange={(e) => setData({ ...data, timePeriod: e.target.value })}
                      />
                    </motion.div>

                    {/* Trend Description */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        What's the trend?
                      </label>
                      <textarea
                        placeholder="e.g. Costs have slowly crept up even though I'm buying the same things."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                        value={data.trendDescription}
                        onChange={(e) => setData({ ...data, trendDescription: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'character' ? (
                  <>
                    {/* Bill Name */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Bill Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rent, Netflix, Electric"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        value={data.billName}
                        onChange={(e) => setData({ ...data, billName: e.target.value })}
                      />
                    </motion.div>

                    {/* Bill Amount */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Amount
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $1,200"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        value={data.billAmount}
                        onChange={(e) => setData({ ...data, billAmount: e.target.value })}
                      />
                    </motion.div>

                    {/* Bill Change */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        Change from last month
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Up by $15"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        value={data.billChange}
                        onChange={(e) => setData({ ...data, billChange: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'coach' ? (
                  <>
                    {/* Event */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-slate-400" />
                        What was the win?
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. I didn't order takeout all week"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                        value={data.event}
                        onChange={(e) => setData({ ...data, event: e.target.value })}
                      />
                    </motion.div>

                    {/* Context */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        Context (Optional)
                      </label>
                      <textarea
                        placeholder="e.g. This is the first time I've stuck to my meal plan in a month."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                        value={data.context}
                        onChange={(e) => setData({ ...data, context: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'monthly' ? (
                  <>
                    {/* Income Summary */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Income Summary
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $5,000 total from salary and freelance"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        value={data.incomeSummary}
                        onChange={(e) => setData({ ...data, incomeSummary: e.target.value })}
                      />
                    </motion.div>

                    {/* Spending Summary */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Spending Summary
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $3,200 total, mostly on rent and dining"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        value={data.spendingSummary}
                        onChange={(e) => setData({ ...data, spendingSummary: e.target.value })}
                      />
                    </motion.div>

                    {/* Key Changes */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        Key Changes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Reduced grocery bill by 10%"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        value={data.changes}
                        onChange={(e) => setData({ ...data, changes: e.target.value })}
                      />
                    </motion.div>

                    {/* Notable Events */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Notable Events
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Car repair, Birthday dinner"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        value={data.notableEvents}
                        onChange={(e) => setData({ ...data, notableEvents: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'autonomous' ? (
                  <>
                    {/* Autonomous Data */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-slate-400" />
                        Financial Situation / Data
                      </label>
                      <textarea
                        placeholder="e.g. Balance is $2000, rent is $1200 due in 3 days, just got a $50 bonus but spent $100 on an impulse buy."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all min-h-[150px]"
                        value={data.autonomousData}
                        onChange={(e) => setData({ ...data, autonomousData: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'normalization' ? (
                  <>
                    {/* Raw Financial Data */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-slate-400" />
                        Messy Financial Data (Transactions, Bills, etc.)
                      </label>
                      <textarea
                        placeholder="e.g. Netflix $15.99 on 3rd, Rent $1200, Salary $3000, Starbucks $5.50 today..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all min-h-[150px]"
                        value={data.rawFinancialData}
                        onChange={(e) => setData({ ...data, rawFinancialData: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'detection' ? (
                  <>
                    {/* Balance */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Current Balance
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $2,450"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        value={data.balance}
                        onChange={(e) => setData({ ...data, balance: e.target.value })}
                      />
                    </motion.div>

                    {/* Upcoming Bills */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Upcoming Bills
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rent $1200, Electric $85"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        value={data.bills}
                        onChange={(e) => setData({ ...data, bills: e.target.value })}
                      />
                    </motion.div>

                    {/* Monthly Expenses */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        Monthly Expenses
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $3,200 total"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        value={data.monthlyExpenses}
                        onChange={(e) => setData({ ...data, monthlyExpenses: e.target.value })}
                      />
                    </motion.div>

                    {/* Days Until Income */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Days Until Income
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12 days"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        value={data.daysUntilIncome}
                        onChange={(e) => setData({ ...data, daysUntilIncome: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'insight' ? (
                  <>
                    {/* Current Month Data */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-slate-400" />
                        Current Month Data
                      </label>
                      <textarea
                        placeholder="e.g. Total spending $3200, Rent $1200, Groceries $450, New Netflix subscription..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all min-h-[120px]"
                        value={data.currentMonthData}
                        onChange={(e) => setData({ ...data, currentMonthData: e.target.value })}
                      />
                    </motion.div>

                    {/* Previous Month Data */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4 text-slate-400" />
                        Previous Month Data
                      </label>
                      <textarea
                        placeholder="e.g. Total spending $3000, Rent $1200, Groceries $400, No Netflix..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all min-h-[120px]"
                        value={data.previousMonthData}
                        onChange={(e) => setData({ ...data, previousMonthData: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'voice' ? (
                  <>
                    {/* Financial State Selection */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Financial State
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                        value={data.selectedState}
                        onChange={(e) => setData({ ...data, selectedState: e.target.value })}
                      >
                        <option value="calm">Calm</option>
                        <option value="stable">Stable</option>
                        <option value="warning">Warning</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </motion.div>

                    {/* Insights */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-slate-400" />
                        Insights
                      </label>
                      <textarea
                        placeholder="e.g. Spending on groceries increased by 20%, but overall savings are up."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[120px]"
                        value={data.insights}
                        onChange={(e) => setData({ ...data, insights: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : mode === 'storytelling_agent' ? (
                  <>
                    {/* State */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Financial State
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                        value={data.selectedState}
                        onChange={(e) => setData({ ...data, selectedState: e.target.value })}
                      >
                        <option value="calm">Calm</option>
                        <option value="stable">Stable</option>
                        <option value="warning">Warning</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </motion.div>

                    {/* Voice */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        Voice Style
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                        value={data.selectedVoice}
                        onChange={(e) => setData({ ...data, selectedVoice: e.target.value })}
                      >
                        <option value="observer">Observer</option>
                        <option value="coach">Coach</option>
                        <option value="advisor">Advisor</option>
                        <option value="protector">Protector</option>
                      </select>
                    </motion.div>

                    {/* Balance */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Current Balance
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $2,450"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={data.balance}
                        onChange={(e) => setData({ ...data, balance: e.target.value })}
                      />
                    </motion.div>

                    {/* Bills */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        Upcoming Bills
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rent $1200, Electric $85"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={data.bills}
                        onChange={(e) => setData({ ...data, bills: e.target.value })}
                      />
                    </motion.div>

                    {/* Insights */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-slate-400" />
                        Insights
                      </label>
                      <textarea
                        placeholder="e.g. Spending on dining out is down 15% this month."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all min-h-[80px]"
                        value={data.insights}
                        onChange={(e) => setData({ ...data, insights: e.target.value })}
                      />
                    </motion.div>

                    {/* Notable Changes */}
                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        Notable Changes
                      </label>
                      <textarea
                        placeholder="e.g. New subscription for Disney+, car insurance went up $10."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all min-h-[80px]"
                        value={data.notableChanges}
                        onChange={(e) => setData({ ...data, notableChanges: e.target.value })}
                      />
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Balance */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        Current Balance
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $4,250"
                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all ${
                          mode === 'storyteller' ? 'focus:ring-indigo-500' : 'focus:ring-rose-500'
                        }`}
                        value={data.balance}
                        onChange={(e) => setData({ ...data, balance: e.target.value })}
                      />
                    </motion.div>

                    {/* Bills / Payments */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400" />
                        {mode === 'storyteller' ? 'Total Bills' : 'Upcoming Payments'}
                      </label>
                      <input
                        type="text"
                        placeholder={mode === 'storyteller' ? "e.g. $1,800" : "e.g. Rent, Utilities"}
                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all ${
                          mode === 'storyteller' ? 'focus:ring-indigo-500' : 'focus:ring-rose-500'
                        }`}
                        value={data.bills}
                        onChange={(e) => setData({ ...data, bills: e.target.value })}
                      />
                    </motion.div>

                    {mode === 'storyteller' ? (
                      <>
                        {/* Due Dates */}
                        <motion.div variants={itemVariants} className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Upcoming Due Dates
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Rent on the 1st"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={data.dueDates}
                            onChange={(e) => setData({ ...data, dueDates: e.target.value })}
                          />
                        </motion.div>

                        {/* Changes */}
                        <motion.div variants={itemVariants} className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            Changes from Last Month
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Spent more on dining"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={data.changes}
                            onChange={(e) => setData({ ...data, changes: e.target.value })}
                          />
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Days until next income
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 5 days"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                            value={data.daysUntilIncome}
                            onChange={(e) => setData({ ...data, daysUntilIncome: e.target.value })}
                          />
                        </motion.div>

                        {/* State */}
                        <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-slate-400" />
                            Current Vibe
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['calm', 'warning', 'urgent'] as FinancialState[]).map((s) => (
                              <button
                                key={s}
                                onClick={() => setData({ ...data, state: s })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all ${
                                  data.state === s 
                                    ? s === 'calm' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                                    : s === 'warning' ? 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                                    : 'bg-rose-100 text-rose-700 border-2 border-rose-500'
                                    : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </>
                )}
              </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:col-span-2 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-start gap-3"
                  >
                    <Info className="w-5 h-5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="md:col-span-2 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateStory}
                    disabled={isGenerating}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg group relative overflow-hidden ${
                      mode === 'storyteller' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-indigo-200' 
                        : mode === 'protective'
                        ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 shadow-rose-200'
                        : mode === 'analyst'
                        ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 shadow-emerald-200'
                        : mode === 'character'
                        ? 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 shadow-violet-200'
                        : mode === 'coach'
                        ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 shadow-amber-200'
                        : mode === 'monthly'
                        ? 'bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 shadow-sky-200'
                        : mode === 'autonomous'
                        ? 'bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 shadow-slate-200'
                        : mode === 'normalization'
                        ? 'bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 shadow-cyan-200'
                        : mode === 'detection'
                        ? 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 shadow-teal-200'
                        : mode === 'insight'
                        ? 'bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 shadow-fuchsia-200'
                        : mode === 'voice'
                        ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-indigo-200'
                        : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 shadow-purple-200'
                    }`}
                  >
                    {isGenerating && (
                      <div className="absolute inset-0 animate-shimmer" />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {mode === 'storyteller' ? 'Listening to the numbers...' : 
                           mode === 'protective' ? 'Analyzing the risk...' :
                           mode === 'analyst' ? 'Observing patterns...' :
                           mode === 'character' ? 'Interviewing the bill...' :
                           mode === 'coach' ? 'Celebrating the win...' :
                           mode === 'monthly' ? 'Writing the monthly story...' :
                           mode === 'autonomous' ? 'Agent thinking...' :
                           mode === 'normalization' ? 'Normalizing data...' :
                           mode === 'detection' ? 'Detecting state...' :
                           mode === 'insight' ? 'Generating insights...' :
                           mode === 'voice' ? 'Selecting voice...' :
                           'Writing your story...'}
                        </>
                      ) : (
                        <>
                          {mode === 'storyteller' ? 'Tell me the story' : 
                           mode === 'protective' ? 'Assess the risk' :
                           mode === 'analyst' ? 'Analyze the pattern' :
                           mode === 'character' ? 'Let the bill speak' :
                           mode === 'coach' ? 'Acknowledge the win' :
                           mode === 'monthly' ? 'Summarize my month' :
                           mode === 'autonomous' ? 'Run Autonomous Analysis' :
                           mode === 'normalization' ? 'Normalize Data' :
                           mode === 'detection' ? 'Detect Financial State' :
                           mode === 'insight' ? 'Generate Insights' :
                           mode === 'voice' ? 'Select Voice' :
                           'Generate Narrative'}
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result-story"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="p-8 space-y-8"
              >
                <div className="relative">
                  <div className={`absolute -top-4 -left-4 ${
                    mode === 'storyteller' ? 'text-indigo-200' : 
                    mode === 'protective' ? 'text-rose-200' :
                    mode === 'analyst' ? 'text-emerald-200' :
                    mode === 'character' ? 'text-violet-200' :
                    mode === 'coach' ? 'text-amber-200' :
                    mode === 'monthly' ? 'text-sky-200' :
                    mode === 'autonomous' ? 'text-slate-200' :
                    mode === 'normalization' ? 'text-cyan-200' :
                    mode === 'detection' ? 'text-teal-200' :
                    mode === 'insight' ? 'text-fuchsia-200' :
                    mode === 'voice' ? 'text-indigo-200' :
                    'text-purple-200'
                  }`}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3C14.017 2.44772 14.4647 2 15.017 2H21.017C21.5693 2 22.017 2.44772 22.017 3V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3 21L3 18C3 16.8954 3.89543 16 5 16H8C8.55228 16 9 15.5523 9 15V9C9 8.44772 8.55228 8 8 8H5C3.89543 8 3 7.10457 3 6V3C3 2.44772 3.44772 2 4 2H10C10.5523 2 11 2.44772 11 3V15C11 18.3137 8.31371 21 5 21H3Z" />
                    </svg>
                  </div>
                  <p className={`text-2xl font-display leading-relaxed italic px-6 relative z-10 ${
                    mode === 'storyteller' ? 'text-slate-800' : 
                    mode === 'protective' ? 'text-rose-900 font-medium' :
                    mode === 'analyst' ? 'text-emerald-900' :
                    mode === 'character' ? 'text-violet-900' :
                    mode === 'coach' ? 'text-amber-900' :
                    mode === 'monthly' ? 'text-sky-900' :
                    mode === 'autonomous' ? 'text-slate-900' :
                    mode === 'normalization' ? 'text-cyan-900' :
                    mode === 'detection' ? 'text-teal-900' :
                    mode === 'insight' ? 'text-fuchsia-900' :
                    mode === 'voice' ? 'text-indigo-900' :
                    'text-purple-900'
                  }`}>
                    {mode === 'normalization' || mode === 'detection' || mode === 'insight' || mode === 'voice' ? (
                      <pre className={`text-sm font-mono p-4 rounded-xl overflow-x-auto not-italic whitespace-pre-wrap ${
                        mode === 'normalization' ? 'bg-slate-900 text-cyan-400' : 
                        mode === 'detection' ? 'bg-slate-900 text-teal-400' :
                        mode === 'insight' ? 'bg-slate-900 text-fuchsia-400' :
                        'bg-slate-900 text-indigo-400'
                      }`}>
                        {story}
                      </pre>
                    ) : story}
                  </p>
                </div>

                {/* Email Notification Section */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <h3>Email this insight to yourself</h3>
                  </div>
                  
                  {!emailSent ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button
                        onClick={sendEmailNotification}
                        disabled={isSendingEmail || !email}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Alert'}
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Notification sent successfully!
                    </motion.div>
                  )}
                  
                  {error && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStory(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Adjust details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={reset}
                    className="px-6 py-3 border-2 border-slate-100 hover:border-slate-200 text-slate-500 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Start over
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-400 text-sm">
          <p>Your data is only used to generate this narrative and is not stored.</p>
        </div>
      </motion.div>
    </div>
  );
}
