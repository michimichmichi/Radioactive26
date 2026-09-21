import { Link } from "react-router-dom";
import logo from "../assets/LogoRadioactive.webp";

export default function CompetitionRegistrationPage() {
  return (
    <main className="account-page px-5 py-8 text-white sm:px-8 sm:py-10">
      <section className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex">
          <img src={logo} alt="Radioactive" className="h-20 w-auto" />
        </Link>
        <div className="account-panel p-8 shadow-2xl">
          <h1 className="font-thebold text-3xl uppercase text-pink-600">
            Competition Registration Closed
          </h1>
          <p className="mt-4 text-zinc-700">
            Registration for the Radio Announcing and Podcast competitions is now closed.
            Thank you for your interest in Radioactive 2026!
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Already registered? You can still view your team and competition details.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/my-competitions" className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700">
              View Registered Competitions
            </Link>
            <Link to="/" className="rounded-lg border border-pink-600 px-5 py-3 font-semibold text-pink-600 hover:bg-pink-50">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
