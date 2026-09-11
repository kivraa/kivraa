export default function SearchBar() {
  return (
    <div className="mt-10 w-full max-w-3xl">
      <div className="flex items-center rounded-2xl border border-gray-700 bg-[#111118] px-5 py-4 transition-all duration-300 focus-within:border-[#F5B700]">

        <span className="text-2xl">🔍</span>

        <input
          type="text"
          placeholder="Search notes, subjects, colleges..."
          className="ml-4 w-full bg-transparent text-lg text-white outline-none placeholder:text-gray-500"
        />

      </div>
    </div>
  );
}