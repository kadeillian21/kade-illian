import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kade Illian</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Software Engineer & Developer</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to my portfolio</h2>
            <p className="text-gray-600 dark:text-gray-300">
              I'm a passionate software engineer specializing in building modern web applications.
              This portfolio will showcase my projects and work experience.
            </p>
          </div>
        </section>

        {/* Projects Section - Placeholder for future content */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Card Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Project Title</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                This is where you can add details about your projects in the future.
              </p>
              <div className="mt-4">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 mb-2">
                  React
                </span>
                <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 mb-2">
                  NextJS
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Skills</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">💻</div>
                <div className="font-medium">Frontend</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🔧</div>
                <div className="font-medium">Backend</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📱</div>
                <div className="font-medium">Mobile</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">☁️</div>
                <div className="font-medium">Cloud</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Me</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Interested in working together? Feel free to reach out!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                GitHub
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                LinkedIn
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Email
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Kade Illian. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
