import { useState } from "react";
import timeline from "../assets/timeline/timeline.webp";
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
    title: "Radio Announcing Competition",
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
        width={700}
        height={260}
        className="h-auto w-full max-w-[700px] select-none md:w-[700px] md:max-w-[90%]"
      />

      {/* Interactive Timeline */}
      <div className="timeline-wrap relative w-full max-w-5xl md:top-[10%] md:w-[90%]">

        {/* Stars */}
        <div className="timeline-grid relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-0">

          {/* Zigzag path */}
          <div className="timeline-path mt-20" aria-hidden="true" />

          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelected(event)}
              className={`timeline-event timeline-event-${event.id} group z-10 flex w-full flex-row items-center gap-4 text-left md:w-full md:flex-col md:items-center md:gap-0 md:text-center ${selected.id === event.id ? "is-selected" : ""}`}
            >
              <img
                src={star}
                alt=""
                width={80}
                height={80}
                  className={`timeline-star transition-all duration-300
                ${
                  selected.id === event.id
                    ? "h-16 w-16 scale-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] md:scale-105"
                    : "w-12 h-12 hover:scale-110"
                }`}
              />

              <span
                className={`timeline-label min-w-0 flex-1 break-words text-sm font-bold transition-colors duration-300 md:mt-3
                ${
                  selected.id === event.id
                    ? "text-pink-400"
                    : "text-white"
                }`}
              >
                {selected.id === event.id && (
                    <div className=" w-full text-left  md:text-center">
                      <h3 className="text-lg font-bold text-pink-400">
                        {event.title}
                      </h3>

                      <p className="text-sm text-gray-300">
                        {event.description}
                      </p>
                    </div>
                  )}
              </span>
            </button>
          ))}
        </div>


      </div>
    </section>
  );
}
