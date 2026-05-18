import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-white 
      bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),
      linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
      bg-[size:6rem_4rem]">
        <div className="absolute inset-0 
        bg-[radial-gradient(circle_600px_at_50%_200px,#C9EBFF,transparent)]" />
      </div>

      {/* Content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6">

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12 tracking-tight text-center">
          Select Your Criteria
        </h1>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6">

          <Link
            href="/inspection"
            className="group relative overflow-hidden text-white 
            bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600
            hover:from-cyan-500 hover:via-cyan-600 hover:to-cyan-700
            focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800
            font-semibold rounded-full px-6 py-3 text-center
            shadow-lg transition-all duration-300
            hover:scale-105 hover:shadow-2xl active:scale-95"
          >
            Steel Bar Inspection
          </Link>

          <Link
            href="/attendance"
            className="group relative overflow-hidden text-white 
            bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600
            hover:from-cyan-500 hover:via-cyan-600 hover:to-cyan-700
            focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800
            font-semibold rounded-full px-6 py-3 text-center
            shadow-lg transition-all duration-300
            hover:scale-105 hover:shadow-2xl active:scale-95"
          >
            Attendance + Wage System
          </Link>

        </div>
      </div>
    </div>
  );
}