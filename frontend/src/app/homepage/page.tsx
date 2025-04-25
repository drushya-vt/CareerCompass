import Link from 'next/link'
import Image from 'next/image'
import logo5 from '../../resources/logo5.png'
import chatbot from "../../resources/chatbot.png";
import chatbot2 from "../../resources/chatbot2.png";
import dashboard from "../../resources/dashboard.png";
import chatpreview from "../../resources/chatpreview.png";
import chat3 from "../../resources/chat3.png";

export default function Home() {
  return (
    <main className="bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:400%_400%] min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-24">

{/* === Hero Section === */}
<section className="text-center mb-12">
  {/* Heading Centered at Top */}
  <div className="flex justify-center items-center space-x-4 mb-10">
    <Image src={logo5} alt="CareerCompass Logo" width={100} height={100} />
    <h1 className="text-6xl font-bold">CareerCompass</h1>
  </div>


  <div className="flex flex-col-reverse md:flex-row items-top justify-between gap-10 text-center md:text-center">
  
    <div className="flex-1 space-y-6">
      <p className="text-2xl font-semibold max-w-xl mx-auto md:mx-0 mt-6">
        Navigate your career path with confidence, using AI-powered insights and real-time data from O*NET.
      </p>
      <div className="flex justify-center md:justify-center space-x-4">
        <Link href="/auth/signup" className="bg-white text-xl text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition">Sign Up</Link>
        <Link href="/auth/login" className="bg-white text-xl text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition">Log In</Link>
      </div>
    </div>

    {/* Chatbot Image */}
    <div className="flex-1 flex justify-center">
      <Image
        src={chat3}
        alt="Chatbot Preview"
        width={800}
        height={800}
        className="rounded-xl shadow-lg"
      />
    </div>
  </div>
</section>


        {/* === About Section === */}
        <section className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl shadow-lg ">
  <h2 className="text-3xl text-black font-bold text-center mb-1">About CareerCompass</h2>
  <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
    <div className="flex-shrink-0">
      <Image
        src={chatbot2}
        alt="Chatbot image"
        width={300}
        height={300}
      />
    </div>
    <p className="text-2xl max-w-xl font-semibold">
      CareerCompass helps you explore personalized career options using advanced AI and occupational data. Whether you're deciding on your major, switching industries, or looking for future job trends, we provide insights based on skills, interests, and goals — all in one place.
    </p>
  </div>
</section>


        {/* === Sample Questions Section === */}
        <section className="text-center">
          <h2 className="text-3xl text-black font-bold mb-5">What Can You Ask?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "What careers align with my skills in Python and data analysis?",
              "How do I transition from graphic design to UX?",
              "What jobs are growing in the healthcare sector?",
              "Which roles match my interest in sustainability and tech?",
              "What certifications help in becoming a Cloud Architect?",
              "Suggest careers for someone interested in biology."
            ].map((q, i) => (
              <div key={i} className="bg-white/10 p-6 font-semibold rounded-xl shadow-md hover:scale-105 transition transform">
                <p className="text-base">{q}</p>
              </div>
            ))}
          </div>
        </section>

  

        {/* === Dashboard Section === */}
<section className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
  <h2 className="text-3xl text-black font-bold text-center mb-8">Career Insights Dashboard</h2>
  <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 text-center md:text-right">
    {/* Text Content */}
    <div className="max-w-xl">
      <p className="text-xl font-semibold">
        Dive into our interactive dashboard to explore real-time labor market trends, in-demand skills, top industries, and future career opportunities. Visualize job growth, compare career paths, and make informed decisions tailored to your goals.
      </p>
      <Link
        href="/datavisualization"
        className="inline-block mt-6 bg-white text-black text-xl px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
      >
        Explore Dashboard
      </Link>
    </div>

    {/* Dashboard Image */}
    <div className="flex-shrink-0">
      <Image
        src={dashboard} 
        alt="Career Dashboard Preview"
        width={400}
        height={400}
        className="rounded-xl shadow-md"
      />
    </div>
  </div>
</section>


      </div>
    </main>
  )
}
