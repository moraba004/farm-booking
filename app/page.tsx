"use client";

import { FormEvent, useState } from "react";

type Booking = {
  name: string;
  phone: string;
  date: string;
  guests: string;
  notes: string;
};

const bookings: Booking[] = [];

const amenities = [
  "مسبح خاص",
  "جلسات خارجية",
  "منطقة شواء",
  "مطبخ مجهز",
  "مساحة ألعاب للأطفال",
  "مواقف سيارات",
];

export default function Home() {
  const [successMessage, setSuccessMessage] = useState("");

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const booking: Booking = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      date: String(formData.get("date") ?? ""),
      guests: String(formData.get("guests") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    bookings.push(booking);
    console.log("New booking:", booking);
    console.log("All bookings:", bookings);

    setSuccessMessage("تم إرسال طلب الحجز");
    form.reset();
  }

  return (
    <main className="min-h-screen bg-[#f6f3ea] text-[#1f2a21]">
      <section className="relative isolate overflow-hidden bg-[#dbe8cd]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_34%),linear-gradient(135deg,_rgba(74,103,65,0.18),_transparent_45%)]" />
        <div className="mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <a
              href="#booking"
              className="rounded-md bg-[#2f5d42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#274c37]"
            >
              احجز الآن
            </a>
            <a
              href="/admin"
              className="text-sm font-semibold text-[#2f5d42] underline-offset-4 transition hover:underline"
            >
              دخول الإدارة
            </a>
          </header>

          <div className="grid items-end gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-bold text-[#6f4f2d]">
                إقامة هادئة للعائلة والأصدقاء
              </p>
              <h1 className="text-5xl font-black leading-tight text-[#18351f] sm:text-6xl lg:text-7xl">
                 مزرعة شجر البلوط
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-9 text-[#38503d] sm:text-xl">
                استمتع بيوم مريح وسط الطبيعة مع مساحات خضراء واسعة، مسبح خاص،
                وجلسات خارجية مناسبة للمناسبات العائلية والطلعات الهادئة.
              </p>
            </div>

            <div className="rounded-lg border border-white/70 bg-white/65 p-5 shadow-xl shadow-[#49643a]/10 backdrop-blur">
              <div className="aspect-[4/3] rounded-md bg-[linear-gradient(160deg,_#88a86c_0%,_#c9d9ae_42%,_#f2d79b_43%,_#f2d79b_50%,_#6d8f57_51%,_#315f43_100%)] shadow-inner" />
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm font-semibold text-[#274c37]">
                <span className="rounded-md bg-white/80 px-3 py-3">خصوصية</span>
                <span className="rounded-md bg-white/80 px-3 py-3">طبيعة</span>
                <span className="rounded-md bg-white/80 px-3 py-3">راحة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20">
        <div>
          <p className="text-sm font-bold text-[#8a5b2d]">عن المزرعة</p>
          <h2 className="mt-3 text-3xl font-black text-[#18351f] sm:text-4xl">
            مكان جاهز ليوم لا يحتاج إلى ترتيب كثير
          </h2>
        </div>
        <p className="text-lg leading-9 text-[#4c5d4d]">
          وفرنا لك كل ما تحتاجه لقضاء وقت جميل: مجلس مريح، مرافق نظيفة،
          إضاءة مسائية دافئة، ومساحات آمنة للأطفال. الصفحة الحالية هي النسخة
          الأولى للحجز السريع، ويمكن تطويرها لاحقًا لإدارة الحجوزات والدفع.
        </p>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#8a5b2d]">المرافق</p>
              <h2 className="mt-3 text-3xl font-black text-[#18351f]">
                كل ما تحتاجه في مكان واحد
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <div
                key={amenity}
                className="rounded-lg border border-[#dfe7d6] bg-[#fbfaf4] p-5 text-lg font-bold text-[#2f5d42]"
              >
                {amenity}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold text-[#8a5b2d]">طلب حجز</p>
            <h2 className="mt-3 text-3xl font-black text-[#18351f] sm:text-4xl">
              أرسل تفاصيل زيارتك
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#4c5d4d]">
              سنراجع الطلب ونتواصل معك لتأكيد الموعد والتفاصيل.
            </p>
          </div>

          <form
            onSubmit={handleBookingSubmit}
            className="rounded-lg bg-white p-5 shadow-xl shadow-[#49643a]/10 sm:p-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">الاسم</span>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                  placeholder="الاسم الكامل"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">رقم الهاتف</span>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                  placeholder="07xxxxxxxx"
                  dir="ltr"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">التاريخ</span>
                <input
                  type="date"
                  name="date"
                  required
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">عدد الضيوف</span>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  required
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                  placeholder="مثال: 12"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-bold text-[#274c37]">ملاحظات</span>
              <textarea
                name="notes"
                rows={5}
                className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                placeholder="اكتب أي تفاصيل إضافية عن المناسبة أو وقت الوصول"
              />
            </label>

            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-[#2f5d42] px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#274c37] sm:w-auto"
            >
              إرسال طلب الحجز
            </button>

            {successMessage && (
              <p className="mt-4 rounded-md border border-[#b8d6aa] bg-[#eef8e9] px-4 py-3 text-sm font-bold text-[#2f5d42]">
                {successMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
