// app/page.js or app/page.tsx
import Link from "next/link";
import Image from "next/image";
import logo5 from "../resources/logo5.png";
import chatbot from "../resources/chatbot.png";

export default function Home() {
  return (
    <div
      className="main-container bg-gradient-to-br from-rose-500 via-violet-500 to-indigo-800 animate-gradient-x bg-[length:500%_500%]
"
    >
      <div className="content-container">
        <div className="flex justify-center items-center mt-1 mb-1 text-center">
          <Image src={logo5} alt="CareerCompass Logo" className="w-20 h-20" />
          <p className="main-heading">CareerCompass</p>
        </div>
        <p className="second-heading mb-9">Navigate your Career Path with AI</p>
        <Link href="/homepage" className="getstarted-button">
            Get Started
          </Link>
        {/* <div className="my-6 relative w-40 h-40 mx-auto">
          <Image 
            src={logo}
            alt="CareerCompass Logo" 
            fill
            style={{ objectFit: 'contain' }}
          />
        </div> */}

        <div className="my-6 relative w-80 h-80 mx-auto">
          <Image
            src={chatbot}
            alt="Chatbot"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <p className="sub-heading">Powered by AI, guided by O*NET insights.</p>

        {/* <div className="button-container">
          <Link href="/auth/signup" className="secondary-button">
            Sign Up
          </Link>
          <Link href="/auth/login" className="secondary-button">
            Log In
          </Link>
        </div> */}
      </div>
    </div>
  );
}
