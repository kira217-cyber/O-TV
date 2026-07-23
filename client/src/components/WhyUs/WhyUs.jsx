import React, { useMemo } from "react";
import { Film, Lock, Smartphone, BarChart3 } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const WhyUs = () => {
  const { isBangla } = useLanguage();

  const content = useMemo(() => {
    return {
      title: isBangla ? "কেন BABU88?" : "Why BABU88?",
      items: [
        {
          title: isBangla
            ? "সীমাহীন এইচডি স্ট্রিমিং"
            : "Unlimited HD Streaming",
          desc: isBangla
            ? "কোনো বাফারিং ছাড়াই ৪কে ও এইচডি কোয়ালিটিতে মুভি, লাইভ টিভি এবং স্পোর্টস উপভোগ করুন, যেকোনো সময়, যেকোনো স্থানে।"
            : "Enjoy 4K & HD quality movies, live TV, and sports with zero buffering, anytime, anywhere.",
          Icon: Film,
        },
        {
          title: isBangla ? "বিশ্বস্ত ব্র্যান্ড" : "Trusted Brand",
          desc: isBangla
            ? "BABU88 হল একটি প্রিমিয়াম ক্রিকেট এক্সচেঞ্জ এবং ভারতের বৃহত্তম অনলাইন ক্যাসিনো প্ল্যাটফর্ম। ১০০ টিরও বেশি লাইভ ক্যাসিনো, স্লট এবং ছয়াল গেম রয়েছে।"
            : "BABU88 is a premium cricket exchange and one of the largest online casino platforms. Enjoy 100+ live casino, slots, and more games.",
          Icon: Lock,
        },
        {
          title: isBangla ? "দ্রুত উত্তোলন" : "Fast Withdrawals",
          desc: isBangla
            ? "আপনার সদস্যরা আমাদের দ্রুত এবং ১০০% নির্ভরযোগ্য উত্তোলনের মাধ্যমে সর্বদা খুশি থাকবেন।"
            : "Your members will be happy with our fast and 100% reliable withdrawals.",
          Icon: Smartphone,
        },
        {
          title: isBangla ? "স্বচ্ছতা" : "Transparency",
          desc: isBangla
            ? "সম্পূর্ণ স্বচ্ছ মূল্য এবং কনটেন্ট লাইব্রেরি, কোনো লুকানো চার্জ ছাড়াই।"
            : "Fully transparent pricing and content library with no hidden charges, ever.",
          Icon: BarChart3,
        },
      ],
    };
  }, [isBangla]);

  return (
    <section className="w-full bg-[#2b2b2b] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h2 className="text-center text-white text-2xl sm:text-3xl font-extrabold mb-8 sm:mb-10">
          {content.title}
        </h2>

        {/* White Card */}
        <div className="bg-white rounded-md border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.25)] px-6 sm:px-10 py-8 sm:py-10">
          {/* Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {content.items.map(({ title, desc, Icon }, idx) => (
              <div key={idx} className="text-center">
                {/* Icon circle */}
                <div className="mx-auto mb-5 w-24 h-24 rounded-full bg-[#f5b400] flex items-center justify-center relative overflow-hidden">
                  {/* long shadow effect */}
                  <span className="absolute inset-0 translate-x-8 translate-y-8 bg-black/10" />
                  <Icon
                    className="relative text-white"
                    size={42}
                    strokeWidth={2.5}
                  />
                </div>

                <h3 className="text-lg font-extrabold text-black mb-3">
                  {title}
                </h3>

                <p className="text-sm text-black/80 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
