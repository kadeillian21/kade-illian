export default function VocabularyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e8dcc8]">
      <div className="container py-16 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-[#d4c5b0] to-[#e8dcc8] border border-[#d4c5b0]">
              <span className="text-sm font-medium bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Hebrew Learning
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] bg-clip-text text-transparent">
                Vocabulary
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Build your Hebrew vocabulary with organized word lists and meanings.
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#6b7d6a] to-[#8a9a8a] rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-lg">
              📚
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Coming Soon!
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Comprehensive Hebrew vocabulary lists are being prepared. You'll find organized word lists by topic, frequency, and difficulty level with translations and example sentences.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/hebrew"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-medium hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Back to Hebrew Learning
              </a>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="text-3xl mb-3">🏷️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Organized by Topic
              </h3>
              <p className="text-gray-600 text-sm">
                Words grouped by themes like food, travel, and daily life
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Audio Pronunciation
              </h3>
              <p className="text-gray-600 text-sm">
                Listen to native speakers pronounce each word correctly
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Example Sentences
              </h3>
              <p className="text-gray-600 text-sm">
                See how words are used in real Hebrew sentences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
