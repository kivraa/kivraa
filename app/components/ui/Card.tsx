type CardProps = {
  title: string;
  description: string;
  icon: string;
};

export default function Card({
  title,
  description,
  icon,
}: CardProps) {
  return (
    <div
      className="
        group relative overflow-hidden
        rounded-3xl
        border border-white/[0.07]
        bg-[#111118]
        p-7 sm:p-8
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:border-[#F5B700]/50
        hover:bg-[#141419]
        hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]
      "
    >
      {/* Subtle Kivraa glow */}
      <div
        className="
          pointer-events-none absolute
          -right-16 -top-16
          h-32 w-32
          rounded-full
          bg-[#F5B700]/[0.06]
          blur-3xl
          transition-all duration-500
          group-hover:bg-[#F5B700]/[0.12]
        "
      />

      {/* Icon */}
      <div
        className="
          relative flex
          h-14 w-14
          items-center justify-center
          rounded-2xl
          border border-white/[0.06]
          bg-white/[0.035]
          text-3xl
          transition-all duration-300
          group-hover:border-[#F5B700]/20
          group-hover:bg-[#F5B700]/[0.08]
          group-hover:scale-105
        "
      >
        {icon}
      </div>

      {/* Content */}
      <div className="relative">
        <h3
          className="
            mt-7
            text-xl sm:text-2xl
            font-bold
            tracking-tight
            text-white
            transition-colors duration-300
            group-hover:text-[#F5B700]
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-3
            max-w-sm
            text-sm sm:text-base
            leading-7
            text-gray-500
            transition-colors duration-300
            group-hover:text-gray-400
          "
        >
          {description}
        </p>
      </div>

      {/* Bottom accent */}
      <div
        className="
          absolute bottom-0 left-7 right-7
          h-px
          origin-left
          scale-x-0
          bg-[#F5B700]/60
          transition-transform duration-300
          group-hover:scale-x-100
        "
      />
    </div>
  );
}