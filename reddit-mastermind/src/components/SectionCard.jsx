export default function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-slate-700" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}