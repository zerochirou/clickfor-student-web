import { Button } from "@/components/ui/button";
import { BookOpen, Check, ChevronDown, Crown, Lock, Star } from "lucide-react";

export function TopicPath() {
  const data = [
    { id: 1, status: "completed", type: "check" },
    { id: 2, status: "completed", type: "book" },
    { id: 3, status: "completed", type: "check" },
    { id: 4, status: "completed", type: "check" },
    { id: 5, status: "current", type: "star" },
    { id: 6, status: "locked", type: "chest" },
    { id: 7, status: "locked", type: "check" },
    { id: 8, status: "locked", type: "check" },
  ];

  const getNaturalOffset = (index: number) => {
    const AMPLITUDE = 85; // Seberapa lebar rute melenceng ke kiri/kanan (dalam pixel)
    const FREQUENCY = 0.6; // Seberapa cepat rute berbelok (makin kecil = lengkungan makin panjang)

    // Math.sin menghasilkan nilai dari -1 hingga 1 yang sangat mulus
    return Math.sin(index * FREQUENCY) * AMPLITUDE;
  };

  const getNodeStyle = (status: string, type: string) => {
    switch (status) {
      case "completed":
        return {
          bgClass: "bg-primary hover:bg-primary text-white",
          borderClass: "border-primary/60",
          icon:
            type === "book" ? (
              <BookOpen size={28} />
            ) : (
              <Check size={32} strokeWidth={4} />
            ),
        };
      case "current":
        return {
          bgClass: "bg-purple-500 hover:bg-purple-400 text-white",
          borderClass: "border-purple-600",
          icon: <Star size={32} fill="white" />,
        };
      case "locked":
      default:
        return {
          bgClass: "bg-gray-200 hover:bg-gray-200 text-gray-400",
          borderClass: "border-gray-300",
          icon: type === "chest" ? <Crown size={28} /> : <Lock size={28} />,
        };
    }
  };
  return (
    <div className="mx-auto max-w-3xl w-full">
      <div className="w-full bg-primary text-primary-foreground p-4 rounded-xl mb-10 border-b-4 border-primary">
        <h2 className="text-xs font-bold opacity-80 uppercase tracking-wider">
          Section 2, Unit 17
        </h2>
        <h1 className="text-xl font-bold mt-1">Describe your home</h1>
      </div>
      <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden pb-20 pt-10 scrollbar-hide">
        <div className="flex flex-col gap-12 relative py-20">
          {data.map((lesson, index) => {
            // Mengambil nilai offset berulang dari array pattern
            const translateX = getNaturalOffset(index);
            const style = getNodeStyle(lesson.status, lesson.type);

            return (
              <div
                key={lesson.id}
                className="relative flex justify-center w-full transition-transform duration-300"
                style={{
                  transform: `translateX(clamp(-30vw, ${translateX}px, 30vw))`,
                }}
              >
                {/* Button Node */}
                <Button
                  variant="default"
                  className={`
                      relative h-20 w-20 rounded-full flex items-center justify-center
                      border-b-8 active:border-b-0 active:translate-y-2 transition-all
                      ${style.bgClass} ${style.borderClass}
                    `}
                >
                  {style.icon}

                  {/* Efek "Cahaya" (Highlight) pada tombol seperti 3D Duolingo */}
                  <div className="absolute top-1 left-2 right-2 h-3 bg-white/20 rounded-full" />
                </Button>

                {/* Indikator Animasi jika status "current" (aktif saat ini) */}
                {lesson.status === "current" ? (
                  <div className="absolute -top-4 text-white animate-bounce font-bold bg-purple-500 px-2 py-1 rounded-md shadow-sm text-xs border">
                    Mulai!
                  </div>
                ) : lesson.status === "completed" ? (
                  <div className="absolute -top-4 text-white animate-bounce font-bold bg-primary px-2 py-1 rounded-md shadow-sm text-xs border">
                    Finished
                  </div>
                ) : (
                  <div className="absolute -top-4 text-white animate-bounce font-bold bg-gray-500 px-2 py-1 rounded-md shadow-sm text-xs border">
                    Locked
                  </div>
                )}
              </div>
            );
          })}
          <div className="fixed bottom-6 z-50">
            <Button className={'rounded-full animate-pulse'} variant={'secondary'}>
              <ChevronDown /> Scroll to down
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
