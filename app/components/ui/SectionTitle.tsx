type Props = {
  title: string;
  subtitle: string;
};

export default function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="text-5xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-5 text-xl text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}