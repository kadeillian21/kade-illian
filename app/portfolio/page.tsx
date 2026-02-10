export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#f5f1e8] via-[#e8dcc8] to-white">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#d4c5b0] to-[#e8dcc8] border border-[#d4c5b0]">
              <span className="text-sm font-medium bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Welcome to my portfolio
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Software Engineer
              </span>
              <br />
              <span className="text-gray-900">& Developer</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Building innovative solutions with modern technologies
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#projects" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-medium hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg">
                View Projects
              </a>
              <a href="#contact" className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-500 hover:text-[#4a5d49] hover:shadow-lg transition-all duration-200 bg-white">
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                My Projects
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              A showcase of my recent work and technical expertise
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card */}
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-[#d4c5b0] to-[#e8dcc8] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6b7d6a]/20 to-[#8a9a8a]/20 group-hover:scale-110 transition-transform duration-300"></div>
                <span className="text-gray-500 text-sm relative z-10">Project Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#4a5d49] transition-colors">Project Title</h3>
                <p className="text-gray-600 mb-4">
                  A modern web application built with cutting-edge technologies.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 text-xs font-medium bg-[#d4c5b0] text-[#4a5d49] rounded-full">
                    React
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-[#d4c5b0] text-[#4a5d49] rounded-full">
                    Next.js
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-[#d4c5b0] text-[#4a5d49] rounded-full">
                    TypeScript
                  </span>
                </div>
                <a href="#" className="text-blue-600 font-medium inline-flex items-center hover:text-[#6b7d6a] transition-colors group/link">
                  View Project
                  <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-24 bg-gradient-to-br from-white to-[#f5f1e8]">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Skills & Expertise
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Technologies and methodologies I specialize in
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group p-8 bg-white rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">&#128187;</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#4a5d49] transition-colors">Frontend</h3>
              <p className="text-gray-600 text-sm">React, Next.js, TypeScript</p>
            </div>
            <div className="group p-8 bg-white rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">&#128295;</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#6b7d6a] transition-colors">Backend</h3>
              <p className="text-gray-600 text-sm">Node.js, Express, SQL</p>
            </div>
            <div className="group p-8 bg-white rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">&#128241;</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#6b7d6a] transition-colors">Mobile</h3>
              <p className="text-gray-600 text-sm">React Native, Flutter</p>
            </div>
            <div className="group p-8 bg-white rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">&#9729;&#65039;</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#6b7d6a] transition-colors">Cloud</h3>
              <p className="text-gray-600 text-sm">AWS, Vercel, Docker</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Let&apos;s Connect
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Interested in working together? Feel free to reach out.
            </p>
          </div>
          <div className="max-w-xl mx-auto bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8] rounded-2xl shadow-xl p-8 border border-[#d4c5b0]">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
              <a
                href="#"
                className="group flex items-center justify-center w-full md:w-auto px-6 py-3 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-gray-800 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-medium">GitHub</span>
              </a>
              <a
                href="#"
                className="group flex items-center justify-center w-full md:w-auto px-6 py-3 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-gray-800 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-medium">LinkedIn</span>
              </a>
              <a
                href="#"
                className="group flex items-center justify-center w-full md:w-auto px-6 py-3 bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-gray-800 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                </svg>
                <span className="font-medium">Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] py-12">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <p className="text-center text-white font-medium">
            &copy; {new Date().getFullYear()} Kade Illian. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
