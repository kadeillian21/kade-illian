export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-16 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#d4c5b0] to-[#e8dcc8] border border-[#d4c5b0]">
              <span className="text-sm font-medium bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Hebrew Learning
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Flashcards
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Master Hebrew through interactive flashcard exercises
            </p>
          </div>

          {/* Flashcard Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Alphabet Flashcards */}
            <a
              href="/hebrew/flashcards/alphabet"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md group-hover:scale-110 transition-transform mx-auto">
                א
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#4a5d49] transition-colors text-center">
                Alphabet
              </h2>
              <p className="text-gray-600 leading-relaxed text-center mb-4">
                Learn all 41 Hebrew characters, vowels, and pronunciation
              </p>
              <div className="bg-[#f5f1e8] rounded-lg p-3 text-center">
                <span className="text-sm font-semibold text-[#4a5d49]">41 Cards</span>
              </div>
            </a>

            {/* Vocabulary Flashcards */}
            <a
              href="/hebrew/flashcards/vocabulary"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md group-hover:scale-110 transition-transform mx-auto">
                📚
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6b7d6a] transition-colors text-center">
                Vocabulary
              </h2>
              <p className="text-gray-600 leading-relaxed text-center mb-4">
                Genesis 1 vocabulary with translations and grammar notes
              </p>
              <div className="bg-[#f5f1e8] rounded-lg p-3 text-center">
                <span className="text-sm font-semibold text-[#4a5d49]">30 Cards</span>
              </div>
            </a>

            {/* Grammar Markers Flashcards */}
            <a
              href="/hebrew/flashcards/grammar-markers"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md group-hover:scale-110 transition-transform mx-auto">
                הַ
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6b7d6a] transition-colors text-center">
                Grammar Markers
              </h2>
              <p className="text-gray-600 leading-relaxed text-center mb-4">
                Articles, prepositions, particles, and punctuation marks
              </p>
              <div className="bg-[#f5f1e8] rounded-lg p-3 text-center">
                <span className="text-sm font-semibold text-[#4a5d49]">31 Cards</span>
              </div>
            </a>

            {/* Syllables Practice */}
            <a
              href="/hebrew/flashcards/syllables"
              className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md group-hover:scale-110 transition-transform mx-auto">
                🎯
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#6b7d6a] transition-colors text-center">
                Syllables
              </h2>
              <p className="text-gray-600 leading-relaxed text-center mb-4">
                Practice dividing Hebrew words into syllables
              </p>
              <div className="bg-[#f5f1e8] rounded-lg p-3 text-center">
                <span className="text-sm font-semibold text-[#4a5d49]">20 Cards</span>
              </div>
            </a>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Flashcard Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🔄</div>
                <h4 className="font-semibold text-gray-900 mb-2">Flip Cards</h4>
                <p className="text-sm text-gray-600">Click or press space to reveal answers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">⌨️</div>
                <h4 className="font-semibold text-gray-900 mb-2">Keyboard Nav</h4>
                <p className="text-sm text-gray-600">Arrow keys for quick navigation</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🔀</div>
                <h4 className="font-semibold text-gray-900 mb-2">Shuffle Mode</h4>
                <p className="text-sm text-gray-600">Randomize cards for better learning</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
                <p className="text-sm text-gray-600">See your current position</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] rounded-2xl p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              How to Use
            </h3>
            <div className="text-[#f5f1e8] text-lg space-y-2">
              <p>💡 Click cards to flip and see answers</p>
              <p>⬅️ ➡️ Use arrow keys to navigate between cards</p>
              <p>⎵ Press spacebar to flip cards quickly</p>
              <p>🔀 Shuffle cards to randomize your practice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
