import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import GlowButton from '../components/GlowButton'

export default function MarketingPage() {
  const navigate = useNavigate()

  return (
    <PageTransition className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-3xl font-bold">AI Interview Simulator</div>
        <nav className="hidden gap-8 md:flex">
          <a href="#" className="text-slate-700">Features</a>
          <a href="#" className="text-slate-700">Pricing</a>
          <a href="#" className="text-slate-700">Resources</a>
          <a href="#" className="text-slate-700">About Us</a>
        </nav>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl border border-slate-300 px-5 py-2"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white"
          >
            Sign Up
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
          <img
            src="[illustrations.popsy.co](https://illustrations.popsy.co/gray/web-design.svg)"
            alt="mock interview"
            className="mx-auto w-full max-w-xl"
          />
        </div>

        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Practice Interviews <br />
            with AI, Not Guesswork
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
            Gain confidence and master your responses with our advanced, real-time AI-driven
            mock interview simulator. Tailored for students and job seekers.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <GlowButton onClick={() => navigate('/login')} className="min-w-[220px]">
              Start Mock Interview
            </GlowButton>
            <button className="font-medium text-slate-700">Watch Demo ↗</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-5 rounded-[28px] bg-slate-100 p-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold">AI-Powered Question Generator</h3>
            <p className="mt-2 text-slate-600">
              Generate tailored questions based on your role, industry, and experience.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold">Real-Time Evaluation</h3>
            <p className="mt-2 text-slate-600">
              Get instant feedback on your delivery, pacing, and content as you speak.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold">Personalized Feedback</h3>
            <p className="mt-2 text-slate-600">
              Receive actionable insights and specific tips to improve your answers.
            </p>
          </div>
        </div>

        <footer className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact</a>
        </footer>
      </section>
    </PageTransition>
  )
}
