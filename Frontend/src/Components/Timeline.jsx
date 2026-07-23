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
    title: "Submission Podcast",
    description: "28 September 2026 - 9 October 2026",
  },
  {
    id: 5,
    title: "RAC 2026",
    description: "10 October 2026",
  },
  {
    id: 6,
    title: "The Encore",
    description: "31 October 2026",
  },
];

export default function Timeline() {
  const [selected, setSelected] = useState(events[0]);

  return (
    <section className="flex w-full flex-col items-center px-4 py-16 md:px-0 md:py-24">

      {/* Timeline Heading */}
      <img
        src={timeline}
        alt="Timeline"
        className="h-auto w-full max-w-[700px] select-none md:w-[700px] md:max-w-[90%]"
      />

      {/* Interactive Timeline */}
      <div className="relative w-full max-w-5xl md:top-[10%] md:w-[90%]">

        {/* Pink Line */}
        <div className="absolute left-0 top-[40%] hidden h-1 w-full -translate-y-1/2 rounded-full bg-pink-500 shadow-[0_0_20px_#ff1493] md:block" />

        {/* Stars */}
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-0">

          <div className="absolute bottom-6 left-6 top-6 w-1 rounded-full bg-pink-500 shadow-[0_0_20px_#ff1493] md:hidden" />

          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelected(event)}
              className="group z-10 flex w-full flex-row items-center gap-4 text-left md:w-auto md:flex-col md:items-center md:gap-0 md:text-center"
            >
              <img
                src={star}
                alt=""
                  className={`transition-all duration-300
                ${
                  selected.id === event.id
                    ? "h-16 w-16 scale-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] md:scale-125"
                    : "w-12 h-12 hover:scale-110"
                }`}
              />

              <span
                className={`min-w-0 flex-1 break-words text-sm font-bold transition-colors duration-300 md:mt-3
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
        <div className="mt-10 flex justify-center md:mt-16">
          <div className="w-full max-w-[420px] rounded-2xl border border-pink-500 bg-[#181818] p-4 text-center shadow-[0_0_30px_rgba(255,20,147,0.3)] md:p-6">
            <h2 className="mb-3 break-words text-2xl font-bold text-pink-400 md:mb-4 md:text-3xl">
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
