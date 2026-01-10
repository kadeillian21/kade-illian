export default function HebrewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-16 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#d4c5b0] to-[#e8dcc8] border border-[#d4c5b0]">
              <span className="text-sm font-medium bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Learn Hebrew
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Hebrew Learning
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Explore resources and tools to help you learn Hebrew through flashcards, vocabulary, and grammar lessons.
            </p>
          </div>

          {/* Resource Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Flashcards Card */}
            <a
              href="/hebrew/flashcards"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                🎴
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#4a5d49] transition-colors">
                Flashcards
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Practice Hebrew words and phrases with interactive flashcard exercises.
              </p>
            </a>

            {/* Vocabulary Card */}
            <a
              href="/hebrew/vocabulary"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                📚
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6b7d6a] transition-colors">
                Vocabulary
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Build your Hebrew vocabulary with organized word lists and meanings.
              </p>
            </a>

            {/* Grammar Card */}
            <a
              href="/hebrew/grammar"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                📖
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6b7d6a] transition-colors">
                Grammar
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Master Hebrew grammar rules with clear explanations and examples.
              </p>
            </a>
          </div>

          {/* Coming Soon Banner */}
          <div className="mt-16 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] rounded-2xl p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              More Resources Coming Soon!
            </h3>
            <p className="text-[#f5f1e8] text-lg">
              We're working on adding more interactive lessons, quizzes, and practice exercises.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
