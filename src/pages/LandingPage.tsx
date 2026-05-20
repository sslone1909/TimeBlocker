import { Link } from 'react-router-dom'

function AppMockup() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
      {/* Browser chrome */}
      <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4 bg-white rounded px-3 py-1 text-xs text-slate-400 border border-slate-200">
          timeblock.app
        </div>
      </div>

      {/* App top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200">
        <span className="text-base font-bold text-purple-600">TimeBlock</span>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {['Day', 'Week', 'Month'].map((v, i) => (
            <div key={v} className={`px-3 py-1 rounded-md text-xs font-medium ${i === 0 ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>{v}</div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500">Today</div>
          <div className="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-md font-medium">+ Add Task</div>
        </div>
      </div>

      {/* App body */}
      <div className="flex" style={{ height: 320 }}>
        {/* Calendar day view */}
        <div className="flex-1 overflow-hidden flex">
          {/* Time labels */}
          <div className="w-12 flex-shrink-0 border-r border-slate-100">
            {['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM'].map((t) => (
              <div key={t} className="h-10 flex items-start pt-0.5 px-1 text-right">
                <span className="text-slate-400 text-xs leading-none">{t}</span>
              </div>
            ))}
          </div>
          {/* Grid with tasks */}
          <div className="flex-1 relative">
            {[0,1,2,3,4,5,6,7].map((i) => (
              <div key={i} className="h-10 border-b border-slate-100" />
            ))}
            {/* Task blocks */}
            <div className="absolute left-2 right-2" style={{ top: 0, height: 40 }}>
              <div className="h-full rounded-md bg-pink-100 border-l-4 border-pink-500 px-2 py-1">
                <div className="text-xs font-medium text-pink-800 truncate">Morning workout</div>
                <div className="text-xs text-pink-500">1 hr · Health</div>
              </div>
            </div>
            <div className="absolute left-2 right-2" style={{ top: 80, height: 60 }}>
              <div className="h-full rounded-md bg-blue-100 border-l-4 border-blue-500 px-2 py-1">
                <div className="text-xs font-medium text-blue-800 truncate">Client strategy meeting</div>
                <div className="text-xs text-blue-500">1.5 hr · Business</div>
              </div>
            </div>
            <div className="absolute left-2 right-2" style={{ top: 160, height: 40 }}>
              <div className="h-full rounded-md bg-yellow-100 border-l-4 border-yellow-500 px-2 py-1 flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <div className="text-xs font-medium text-yellow-800 truncate line-through opacity-60">Review budget</div>
              </div>
            </div>
            <div className="absolute left-2 right-2" style={{ top: 220, height: 80 }}>
              <div className="h-full rounded-md bg-purple-100 border-l-4 border-purple-500 px-2 py-1">
                <div className="text-xs font-medium text-purple-800 truncate">Deep work: Project A</div>
                <div className="text-xs text-purple-500">2 hr · Business · $120</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="w-52 flex-shrink-0 border-l border-slate-200 bg-white px-3 py-3 overflow-hidden">
          <div className="text-xs font-semibold text-slate-700 mb-2">Goals</div>
          {[
            { name: 'Project A', pct: 75, color: '#a855f7', count: 8 },
            { name: 'Project B', pct: 40, color: '#6366f1', count: 5 },
            { name: 'Fitness Q2', pct: 60, color: '#22c55e', count: 12 },
          ].map((g) => (
            <div key={g.name} className="mb-2.5">
              <div className="flex justify-between items-center mb-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-xs text-slate-600">{g.name}</span>
                </div>
                <span className="text-xs text-slate-400">{g.count}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full" style={{ width: `${g.pct}%`, backgroundColor: '#a855f7' }} />
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{g.pct}% complete</div>
            </div>
          ))}
          <div className="text-xs font-semibold text-slate-700 mt-3 mb-2">Categories</div>
          {[
            { name: 'Business', count: 6, time: '8h 30m', color: '#3b82f6' },
            { name: 'Health', count: 4, time: '3h', color: '#22c55e' },
            { name: 'Finance', count: 2, time: '1h', color: '#eab308' },
            { name: 'Family', count: 3, time: '2h', color: '#ec4899' },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-slate-600">{c.name}</span>
              </div>
              <div className="text-xs text-slate-400">{c.count} · {c.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Day, Week & Month Views',
    desc: "Switch between calendar views instantly. Plan your day hour by hour, or get a bird's-eye view of your entire month.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Goals & Categories',
    desc: 'Organize tasks by life areas — Family, Business, Health, Finance — and assign them to custom goals like Project A or Q2 Launch.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Progress at a Glance',
    desc: 'Live stats panel shows goal completion rates, hours per category, and task counts — updated instantly as you work.',
  },
]

const STEPS = [
  { num: '01', title: 'Add a task', desc: 'Give it a title, set the time, pick a category and goal, and drop it on your calendar.' },
  { num: '02', title: 'Block your time', desc: 'Drag tasks to 30-minute slots across any day. Add cost fields, notes, or custom data.' },
  { num: '03', title: 'Track progress', desc: 'Watch goal completion bars fill up and time-by-category charts update in real time.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="text-xl font-bold text-purple-600">TimeBlock</span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Your time. Your goals. Your schedule.
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-5">
            Time-block your life,<br />
            <span className="text-purple-600">hit your goals faster.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            TimeBlock is a visual planning app that turns your goals into scheduled tasks — so nothing important ever gets left to chance.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-purple-200"
            >
              Start for free →
            </Link>
            <Link
              to="/login"
              className="border border-slate-200 hover:border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* App mockup */}
        <div className="max-w-5xl mx-auto px-4">
          <AppMockup />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need to own your schedule</h2>
            <p className="text-slate-500">Designed for people who are serious about how they spend their time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500">Three steps to a fully time-blocked week.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white text-lg font-bold rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to take control of your time?</h2>
          <p className="text-slate-500 mb-8">Free forever. No credit card required. Your data stays in your browser.</p>
          <Link
            to="/signup"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-purple-200"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold text-purple-600">TimeBlock</span>
          <p className="text-xs text-slate-400">Your data is stored locally in your browser. Nothing leaves your device.</p>
        </div>
      </footer>
    </div>
  )
}
