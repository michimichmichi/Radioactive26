import { useState } from "react";
import timeline from "../assets/timeline/timeline.png";
import star from "../assets/gallery/Star 6.png";

const events = [
  {
    id: 1,
    title: "Open Registration",
    description: "27 July - 11 September 2026",
  },
  {
    id: 2,
    title: "Technical Meeting RAC",
    description: "3 October 2026",
  },
  {
    id: 3,
    title: "Technical Meeting Podcast Competition (online)",
    description: "26 September 2026", 
  },
  {
    id: 4,
    title: "RAC 2026",
    description: "10 October 2026",
  },
  {
    id: 5,
    title: "The Encore",
    description: "31 October 2026",
  },
];

export default function Timeline() {
  const [selected, setSelected] = useState(events[0]);

  return (
    <section className="w-full flex flex-col items-center py-24">

      {/* Timeline Heading */}
      <img
        src={timeline}
        alt="Timeline"
        className="w-[700px] max-w-[90%]  select-none"
      />

      {/* Interactive Timeline */}
      <div className="relative w-[90%] max-w-5xl top-[10%]">

        {/* Pink Line */}
        <div className="absolute top-[40%] left-0 w-full h-1 bg-pink-500 rounded-full -translate-y-1/2 shadow-[0_0_20px_#ff1493]" />

        {/* Stars */}
        <div className="relative flex justify-between items-center">

          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelected(event)}
              className="group flex flex-col items-center z-10"
            >
              <img
                src={star}
                alt=""
                className={`transition-all duration-300
                ${
                  selected.id === event.id
                    ? "w-16 h-16 scale-125 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]"
                    : "w-12 h-12 hover:scale-110"
                }`}
              />

              <span
                className={`mt-3 text-sm font-bold transition-colors duration-300
                ${
                  selected.id === event.id
                    ? "text-pink-400"
                    : "text-white"
                }`}
              >
                {event.title}
              </span>
            </button>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-16 flex justify-center">
          <div className="bg-[#181818] border border-pink-500 rounded-2xl p-6 w-[420px] text-center shadow-[0_0_30px_rgba(255,20,147,0.3)]">
            <h2 className="text-3xl font-bold text-pink-400 mb-4">
              {selected.title}
            </h2>

            <p className="text-gray-300">
              {selected.description}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
