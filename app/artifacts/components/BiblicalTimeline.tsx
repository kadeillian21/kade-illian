import { useState } from "react";

export function BiblicalTimeline() {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoveredBook, setHoveredBook] = useState(null);
  
  // Define the major periods
  const periods = [
    { name: "Patriarchs", start: 2000, end: 1700, color: "#8B4513" },
    { name: "Egypt", start: 1700, end: 1446, color: "#D4AF37" },
    { name: "Exodus & Wilderness", start: 1446, end: 1406, color: "#DAA06D" },
    { name: "Judges", start: 1406, end: 1050, color: "#4B6F44" },
    { name: "United Kingdom", start: 1050, end: 930, color: "#B8860B" },
    { name: "Divided Kingdom", start: 930, end: 722, color: "#7B68EE" },
    { name: "Judah Alone", start: 722, end: 586, color: "#483D8B" },
    { name: "Exile & Return", start: 586, end: 400, color: "#6A5ACD" },
    { name: "Silent Period", start: 400, end: 4, color: "#708090" },
    { name: "New Testament", start: 4, end: 100, color: "#8B0000" }
  ];
  
  // Key events to display
  const events = [
    { year: 2000, label: "Abraham's Call", description: "God calls Abraham to leave Ur and go to Canaan" },
    { year: 1900, label: "Jacob/Israel", description: "Jacob renamed Israel, father of the 12 tribes" },
    { year: 1876, label: "To Egypt", description: "Jacob's family moves to Egypt during famine" },
    { year: 1446, label: "Exodus", description: "Moses leads Israel out of Egypt" },
    { year: 1406, label: "Canaan", description: "Joshua leads conquest of Promised Land" },
    { year: 1050, label: "Saul", description: "First king of Israel anointed" },
    { year: 1010, label: "David", description: "David becomes king, establishes Jerusalem as capital" },
    { year: 970, label: "Solomon", description: "Solomon builds the First Temple" },
    { year: 930, label: "Division", description: "Kingdom splits into Israel (North) and Judah (South)" },
    { year: 722, label: "Israel Falls", description: "Assyrian conquest of Northern Kingdom" },
    { year: 740, label: "Isaiah Begins", description: "Isaiah begins prophetic ministry in Jerusalem" },
    { year: 640, label: "Josiah", description: "Josiah's reforms and rediscovery of the Law" },
    { year: 586, label: "Judah Falls", description: "Babylonian conquest, First Temple destroyed" },
    { year: 539, label: "Persia", description: "Cyrus conquers Babylon, allows Jews to return" },
    { year: 516, label: "Temple Rebuilt", description: "Second Temple completed" },
    { year: 445, label: "Nehemiah", description: "Jerusalem walls rebuilt under Nehemiah" },
    { year: 167, label: "Maccabees", description: "Maccabean Revolt against Seleucid rule" },
    { year: 4, label: "Jesus Born", description: "Birth of Jesus Christ" },
    { year: 30, label: "Crucifixion", description: "Death and resurrection of Jesus" },
    { year: 70, label: "Temple Destroyed", description: "Romans destroy Jerusalem and Second Temple" }
  ];
  
  // Bible books with approximate writing periods
  const bibleBooks = [
    { name: "Genesis", start: 1446, end: 1406, author: "Moses", description: "Creation through Joseph" },
    { name: "Exodus", start: 1446, end: 1406, author: "Moses", description: "Deliverance from Egypt" },
    { name: "Leviticus", start: 1446, end: 1406, author: "Moses", description: "Priestly laws and worship" },
    { name: "Numbers", start: 1446, end: 1406, author: "Moses", description: "Wilderness wanderings" },
    { name: "Deuteronomy", start: 1406, end: 1406, author: "Moses", description: "Law restated, Moses' final words" },
    { name: "Joshua", start: 1375, end: 1345, author: "Joshua/Others", description: "Conquest of Canaan" },
    { name: "Judges", start: 1050, end: 1000, author: "Samuel/Others", description: "Cycles of apostasy and deliverance" },
    { name: "Ruth", start: 1000, end: 950, author: "Unknown", description: "Story during Judges period" },
    { name: "1 & 2 Samuel", start: 930, end: 900, author: "Samuel/Nathan/Gad", description: "Samuel through David's reign" },
    { name: "1 & 2 Kings", start: 560, end: 540, author: "Jeremiah/Others", description: "Solomon through the exile" },
    { name: "1 & 2 Chronicles", start: 430, end: 400, author: "Ezra", description: "History from Adam to return from exile" },
    { name: "Ezra", start: 440, end: 430, author: "Ezra", description: "Return from Babylonian exile" },
    { name: "Nehemiah", start: 430, end: 420, author: "Nehemiah", description: "Rebuilding Jerusalem's walls" },
    { name: "Esther", start: 460, end: 430, author: "Unknown", description: "Jews preserved in Persian empire" },
    { name: "Job", start: 1000, end: 900, author: "Unknown", description: "Man's suffering and God's sovereignty" },
    { name: "Psalms", start: 1020, end: 450, author: "David/Others", description: "Collection of songs and prayers" },
    { name: "Proverbs", start: 970, end: 700, author: "Solomon/Others", description: "Wisdom literature" },
    { name: "Ecclesiastes", start: 935, end: 930, author: "Solomon", description: "Meaning of life" },
    { name: "Song of Solomon", start: 965, end: 960, author: "Solomon", description: "Love and marriage" },
    { name: "Isaiah", start: 740, end: 680, author: "Isaiah", description: "Judgment and future redemption" },
    { name: "Jeremiah", start: 627, end: 580, author: "Jeremiah", description: "Judgment on Judah and nations" },
    { name: "Lamentations", start: 586, end: 585, author: "Jeremiah", description: "Grief over Jerusalem's destruction" },
    { name: "Ezekiel", start: 593, end: 571, author: "Ezekiel", description: "Visions during Babylonian exile" },
    { name: "Daniel", start: 605, end: 530, author: "Daniel", description: "Exile in Babylon and apocalyptic visions" },
    { name: "Hosea", start: 755, end: 725, author: "Hosea", description: "God's love for unfaithful Israel" },
    { name: "Joel", start: 835, end: 800, author: "Joel", description: "Day of the Lord" },
    { name: "Amos", start: 760, end: 750, author: "Amos", description: "Judgment on Israel and neighbors" },
    { name: "Obadiah", start: 605, end: 585, author: "Obadiah", description: "Judgment on Edom" },
    { name: "Jonah", start: 780, end: 750, author: "Jonah", description: "God's compassion for all nations" },
    { name: "Micah", start: 735, end: 700, author: "Micah", description: "Judgment and hope for Judah" },
    { name: "Nahum", start: 663, end: 612, author: "Nahum", description: "Nineveh's destruction" },
    { name: "Habakkuk", start: 609, end: 605, author: "Habakkuk", description: "Faith amid injustice" },
    { name: "Zephaniah", start: 635, end: 625, author: "Zephaniah", description: "Day of the Lord's judgment" },
    { name: "Haggai", start: 520, end: 520, author: "Haggai", description: "Rebuilding the temple" },
    { name: "Zechariah", start: 520, end: 480, author: "Zechariah", description: "Messianic prophecies" },
    { name: "Malachi", start: 430, end: 420, author: "Malachi", description: "Final OT prophet" }
  ];
  
  // Calculate timeline parameters
  const startYear = 2100;
  const endYear = -100;
  const timelineRange = startYear - endYear;
  
  // Function to convert year to position percentage
  const yearToPosition = (year) => {
    return ((startYear - year) / timelineRange) * 100;
  };
  
  // Function to calculate width percentage
  const calculateWidth = (start, end) => {
    return ((start - end) / timelineRange) * 100;
  };
  
  return (
    <div className="flex flex-col p-4 mx-auto bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-2">Timeline of Biblical Israel</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">Hover over events and books for details</p>
      
      {/* Main timeline container */}
      <div className="relative w-full">
        {/* Timeline bar */}
        <div className="h-12 bg-gray-200 relative rounded">
          {/* Historical periods */}
          {periods.map((period, index) => (
            <div
              key={index}
              className="absolute h-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
              style={{
                left: `${yearToPosition(period.start)}%`,
                width: `${calculateWidth(period.start, period.end)}%`,
                backgroundColor: period.color
              }}
            >
              {calculateWidth(period.start, period.end) > 5 ? period.name : ''}
            </div>
          ))}
          
          {/* Year markers */}
          {[2000, 1500, 1000, 500, 0].map((year) => (
            <div 
              key={year} 
              className="absolute h-12 flex flex-col items-center"
              style={{ left: `${yearToPosition(year)}%` }}
            >
              <div className="h-full w-px bg-gray-500"></div>
              <span className="text-xs mt-1">{year} {year <= 0 ? 'AD' : 'BC'}</span>
            </div>
          ))}
        </div>
        
        {/* Events above timeline */}
        <div className="relative h-80">
          {events.map((event, index) => (
            <div
              key={index}
              className="absolute"
              style={{ 
                left: `${yearToPosition(event.year)}%`,
                top: index % 2 === 0 ? '10px' : '50px'
              }}
              onMouseEnter={() => setHoveredEvent(event)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <div className="w-px h-10 bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
              <div className="text-xs -ml-10 w-20 text-center">{event.label}</div>
            </div>
          ))}
          
          {/* Event hover info */}
          {hoveredEvent && (
            <div className="absolute z-10 bg-white p-2 rounded shadow-lg border border-gray-300 max-w-xs"
                 style={{ 
                   left: `${yearToPosition(hoveredEvent.year)}%`,
                   top: '100px',
                   transform: 'translateX(-50%)'
                 }}>
              <p className="font-bold">{hoveredEvent.label} ({hoveredEvent.year > 0 ? `${hoveredEvent.year} AD` : `${Math.abs(hoveredEvent.year)} BC`})</p>
              <p className="text-sm">{hoveredEvent.description}</p>
            </div>
          )}
        </div>
        
        {/* Bible books below timeline */}
        <div className="relative mt-6">
          <h2 className="text-lg font-bold mb-2">Old Testament Books</h2>
          <div className="grid grid-cols-5 gap-2">
            {bibleBooks.map((book, index) => (
              <div 
                key={index}
                className="relative bg-[#d4c5b0] p-2 rounded text-xs hover:bg-blue-200 cursor-help"
                onMouseEnter={() => setHoveredBook(book)}
                onMouseLeave={() => setHoveredBook(null)}
              >
                <div className="font-bold">{book.name}</div>
                <div className="text-xs text-gray-600">
                  {book.start === book.end ? 
                    `c. ${book.start} BC` : 
                    `c. ${book.start}-${book.end} BC`}
                </div>
              </div>
            ))}
          </div>
          
          {/* Book hover info */}
          {hoveredBook && (
            <div className="absolute z-10 bg-white p-2 rounded shadow-lg border border-gray-300 max-w-xs">
              <p className="font-bold">{hoveredBook.name}</p>
              <p className="text-xs">Written: {hoveredBook.start === hoveredBook.end ? 
                `c. ${hoveredBook.start} BC` : 
                `c. ${hoveredBook.start}-${hoveredBook.end} BC`}</p>
              <p className="text-xs">Attributed to: {hoveredBook.author}</p>
              <p className="text-sm mt-1">{hoveredBook.description}</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 italic text-center">
          <p>Note: Biblical chronology dates are approximate and scholarly interpretations vary.</p>
          <p>Isaiah's ministry (c. 740-680 BC) occurred during the decline of the Divided Kingdom and fall of Israel to Assyria.</p>
        </div>
      </div>
    </div>
  )
}
