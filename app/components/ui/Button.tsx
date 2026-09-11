type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${
        variant === "primary"
          ? "bg-[#F5B700] text-black hover:scale-105 hover:shadow-[0_0_30px_rgba(245,183,0,0.45)]"
          : "border border-gray-700 text-white hover:border-[#F5B700] hover:text-[#F5B700]"
      }`}
    >
      {children}
    </button>
  );
}