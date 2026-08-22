import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">
        StayEase
      </h1>

      <p className="mt-2 text-slate-600">
        Hotel booking platform
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href="/hotels"
          className="text-blue-600 hover:underline"
        >
          Hotels
        </Link>

        <Link
          href="/deals"
          className="text-blue-600 hover:underline"
        >
          Deals
        </Link>

        <Link
          href="/destinations"
          className="text-blue-600 hover:underline"
        >
          Destinations
        </Link>

        <Link
          href="/support"
          className="text-blue-600 hover:underline"
        >
          Support
        </Link>
      </div>
    </main>
  );
}
