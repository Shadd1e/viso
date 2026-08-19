import { Link } from 'react-router-dom'
import { services as serviceCatalog } from '../data/services.js'

const serviceGroups = [
  {
    title: 'Maintenance',
    description: 'Keep your vehicle running properly with routine care and essential maintenance.',
    services: ['Oil Change', 'Brake Service', 'Battery'],
  },
  {
    title: 'Repairs',
    description: 'Get common mechanical problems handled without taking your car to a shop.',
    services: ['Transmission', 'Flat Fix', 'Tyre Change'],
  },
  {
    title: 'Diagnostics & Electrical',
    description: 'Find the problem before it becomes a bigger one with modern diagnostic services.',
    services: ['Diagnostics', 'Sensors', 'Programming'],
  },
  {
    title: 'Comfort & Care',
    description: 'Look after the systems and details that make your car feel right again.',
    services: ['Air Conditioning', 'Wash & Detail'],
  },
  {
    title: 'Roadside',
    description: 'When your vehicle cannot make it to the shop, we can come to you.',
    services: ['Towing', 'Other'],
  },
]

const steps = [
  {
    number: '01',
    title: 'Tell us what your car needs',
    text: 'Choose one service or several. If you are not sure what is wrong, tell us what you are experiencing and we will take it from there.',
  },
  {
    number: '02',
    title: 'Choose when and where',
    text: 'Pick a date and available time. Then provide your Georgia service location or use your phone location.',
  },
  {
    number: '03',
    title: 'We find the right technician',
    text: 'Viso checks technician availability, service capability and location before assigning the job.',
  },
  {
    number: '04',
    title: 'Your technician comes to you',
    text: 'Once your booking is confirmed, the technician has the details needed to meet you where your vehicle is.',
  },
]

const faqs = [
  {
    question: 'Where does Viso Mobile Autocare operate?',
    answer:
      'Viso currently serves locations in Georgia. Your service location is checked before a booking can be completed.',
  },
  {
    question: 'Can I choose more than one service?',
    answer:
      'Yes. You can select multiple services during booking. The system uses the combined services when calculating the expected job duration and price.',
  },
  {
    question: 'Can I use my phone location?',
    answer:
      'Yes. You can allow your phone or browser to provide your current location. You can also enter or search for a service address manually.',
  },
  {
    question: 'What happens if no technician is available?',
    answer:
      "Viso checks technician schedules before accepting the booking. If nobody is available for your selected time, you can choose another time.",
  },
  {
    question: 'How is the mileage charge calculated?',
    answer:
      'The mileage component is based on the distance between your service location and the technician selected for the job.',
  },
  {
    question: 'What if I select Other?',
    answer:
      'Other is available when your vehicle needs something that is not listed. It carries a fixed booking price initially. If the technician determines that the actual work exceeds what that price covers, you will be informed of any additional charge before work proceeds.',
  },
]

export default function Home() {
  return (
    <main className="bg-white text-[#25263a]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f5f5fa] pt-[120px]">
        <div className="mx-auto grid min-h-[680px] max-w-[1280px] items-center gap-12 px-5 pb-20 sm:px-7 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:pb-24">

          <div className="max-w-[650px]">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#3531a4]">
              Viso Mobile Autocare
            </p>

            <h1 className="text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[.92] tracking-[-0.065em] text-[#25263a]">
              Car care.
              <br />
              <span className="text-[#3531a4]">Where you are.</span>
            </h1>

            <p className="mt-7 max-w-[540px] text-[17px] leading-8 text-[#666879] md:text-[19px]">
              Professional mobile auto care that comes to your vehicle.
              Choose what you need, pick a time that works, and let Viso
              handle the rest.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/book"
                className="rounded-full bg-[#3531a4] px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-[#29267f]"
              >
                Book a Service
              </Link>

              <a
                href="#how-it-works"
                className="rounded-full border border-[#d7d7e0] bg-white px-7 py-4 text-[15px] font-semibold text-[#303143] transition hover:border-[#3531a4]"
              >
                How it works
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#77798a]">
              <span>12 years of experience</span>
              <span>•</span>
              <span>Mobile service</span>
              <span>•</span>
              <span>Georgia locations</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[36px] bg-[#25263a] p-7 shadow-[0_30px_90px_rgba(37,38,58,.18)] md:p-10">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#3531a4]/30 blur-2xl" />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
                  Your service
                </p>

                <h2 className="mt-5 max-w-[420px] text-3xl font-semibold leading-tight tracking-[-.035em] text-white md:text-4xl">
                  A mechanic without the waiting room.
                </h2>

                <div className="mt-9 space-y-3">
                  {[
                    ['01', 'Choose your service'],
                    ['02', 'Pick your time'],
                    ['03', 'Set your location'],
                    ['04', 'Meet your technician'],
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.055] px-4 py-4"
                    >
                      <span className="text-xs font-bold text-[#a8a5ff]">
                        {number}
                      </span>
                      <span className="text-sm font-medium text-white/85">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-white/10 pt-6 text-sm leading-6 text-white/50">
                  Availability is checked before your booking is accepted.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE TRUST BAR */}
      <section className="border-b border-[#e9e9ee] bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-px px-5 sm:px-7 md:grid-cols-4 lg:px-10">
          {[
            ['12', 'Years of experience'],
            ['GA', 'Georgia service area'],
            ['01', 'Mobile-first service'],
            ['24/7', 'Online booking'],
          ].map(([value, label]) => (
            <div key={label} className="border-r border-[#eeeeF2] px-5 py-7 first:pl-0 last:border-r-0">
              <strong className="block text-xl font-semibold text-[#3531a4]">
                {value}
              </strong>
              <span className="mt-1 block text-sm text-[#77798a]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">

          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.28em] text-[#3531a4]">
                What we do
              </p>

              <h2 className="mt-4 max-w-[500px] text-4xl font-semibold tracking-[-.045em] text-[#25263a] md:text-5xl">
                The care your car needs, without the shop visit.
              </h2>

              <p className="mt-5 max-w-[470px] text-base leading-7 text-[#77798a]">
                From routine maintenance to roadside help, Viso brings
                practical vehicle care directly to you.
              </p>

              <Link
                to="/book"
                className="mt-7 inline-flex text-sm font-semibold text-[#3531a4] hover:underline"
              >
                See all services →
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {serviceGroups.map((group, index) => (
                <a
                  key={group.title}
                  href="/book"
                  className={`group rounded-[26px] border border-[#e4e4eb] p-6 transition hover:-translate-y-1 hover:border-[#b9b7ef] hover:shadow-[0_18px_45px_rgba(53,49,164,.08)] ${
                    index === 0 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0efff] text-sm font-bold text-[#3531a4]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xl text-[#b0b0bb] transition group-hover:translate-x-1 group-hover:text-[#3531a4]">
                      →
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold text-[#2d2e40]">
                    {group.title}
                  </h3>

                  <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#77798a]">
                    {group.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-[#f5f5f8] px-3 py-1.5 text-xs text-[#686a79]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-[#25263a] py-24 text-white md:py-32"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">

          <div className="max-w-[680px]">
            <p className="text-xs font-bold uppercase tracking-[.28em] text-[#a8a5ff]">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-5xl">
              Simple from booking to driveway.
            </h2>

            <p className="mt-5 text-base leading-7 text-white/55">
              Viso is built around a straightforward idea: you should not
              have to rearrange your day just because your car needs attention.
            </p>
          </div>

          <div className="mt-14 grid border-t border-white/10 md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border-b border-white/10 py-9 md:nth-[2n]:pl-10 md:nth-[2n+1]:pr-10"
              >
                <span className="text-xs font-bold tracking-[.2em] text-[#a8a5ff]">
                  {step.number}
                </span>

                <h3 className="mt-4 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-[470px] text-sm leading-6 text-white/50">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY VISO */}
      <section className="bg-[#f5f5fa] py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">

          <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[.28em] text-[#3531a4]">
                Why Viso
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-5xl">
                Built around your day, not the other way around.
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: 'Mobile by design',
                  text: 'The service comes to your vehicle, so ordinary maintenance does not automatically become a full-day errand.',
                },
                {
                  title: 'Availability first',
                  text: 'We check technician schedules before accepting a booking instead of promising a time nobody can actually cover.',
                },
                {
                  title: 'Location-aware',
                  text: 'Your service location helps us determine the appropriate technician and travel distance for the job.',
                },
                {
                  title: 'Straightforward pricing',
                  text: 'Your booking shows the service, mileage and applicable discount before you continue to payment.',
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-lg font-semibold text-[#2d2e40]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#77798a]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* EXPERIENCE / BRAND STATEMENT */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <img src="/images/viso-service-bg.jpg" alt="Mobile vehicle service" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07]" />
        <div className="pointer-events-none absolute inset-0 bg-white/75" />
        <div className="relative mx-auto max-w-[1100px] px-5 text-center sm:px-7">

          <p className="text-xs font-bold uppercase tracking-[.28em] text-[#3531a4]">
            The Viso difference
          </p>

          <h2 className="mx-auto mt-5 max-w-[850px] text-4xl font-semibold leading-[1.02] tracking-[-.055em] text-[#25263a] md:text-6xl">
            Your car doesn't need to go to the shop.
            <span className="text-[#3531a4]"> The shop comes to you.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-[680px] text-base leading-7 text-[#77798a]">
            Viso Mobile Autocare combines scheduled service, technician
            availability and location-aware dispatch into one experience
            designed for modern car owners.
          </p>
        </div>
      </section>

      {/* BOOKING FLOW PREVIEW */}
      <section className="bg-[#f5f5fa] py-24 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">

          <div className="relative overflow-hidden rounded-[32px] bg-[#3531a4] p-7 text-white md:p-12 lg:p-16">
            <img src="/images/viso-driveway.jpg" alt="Viso mobile service at a driveway" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" />
            <div className="pointer-events-none absolute inset-0 bg-[#3531a4]/80" />
            <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center">

              <div>
                <p className="text-xs font-bold uppercase tracking-[.28em] text-white/55">
                  Booking made practical
                </p>

                <h2 className="mt-4 max-w-[600px] text-4xl font-semibold tracking-[-.045em] md:text-5xl">
                  Choose the service. Pick the time. We handle the rest.
                </h2>

                <p className="mt-5 max-w-[560px] text-base leading-7 text-white/65">
                  Your booking is checked against technician availability,
                  service capability and your location before it is accepted.
                </p>

                <Link
                  to="/book"
                  className="mt-8 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#3531a4] transition hover:bg-[#f1f1ff]"
                >
                  Start a booking
                </Link>
              </div>

              <div className="grid gap-3">
                {[
                  ['Service', 'Select one or multiple services'],
                  ['Vehicle', 'Tell us what you drive'],
                  ['Schedule', 'Choose an available date and time'],
                  ['Location', 'Use your location or enter an address'],
                ].map(([label, text]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[.08] px-5 py-4"
                  >
                    <span className="block text-xs uppercase tracking-[.16em] text-white/40">
                      {label}
                    </span>
                    <span className="mt-1 block text-sm text-white/85">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* TECHNICIAN COMING SOON */}
      <section className="bg-white py-24 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">

          <div className="grid gap-8 rounded-[32px] border border-[#e5e5eb] p-7 md:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.28em] text-[#3531a4]">
                For technicians
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] md:text-4xl">
                Want to work with Viso?
              </h2>

              <p className="mt-4 max-w-[650px] text-sm leading-6 text-[#77798a] md:text-base">
                We are building a technician network where qualified
                professionals can manage their availability, receive jobs
                and serve customers through the Viso platform.
              </p>
            </div>

            <Link to="/technicians/apply" className="w-fit rounded-full bg-[#3531a4] px-5 py-2.5 text-xs font-bold uppercase tracking-[.16em] text-white hover:bg-[#29267f]">
              Become a Technician
            </Link>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 bg-[#f5f5fa] py-24 md:py-32">
        <div className="mx-auto max-w-[1000px] px-5 sm:px-7">

          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[.28em] text-[#3531a4]">
              FAQ
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] md:text-5xl">
              Questions, answered.
            </h2>
          </div>

          <div className="divide-y divide-[#dedee6] border-y border-[#dedee6]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-8 text-lg font-semibold text-[#2d2e40]">
                  <span>{faq.question}</span>

                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d8d8e0] text-[#3531a4] transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="max-w-[760px] pt-4 text-sm leading-7 text-[#77798a]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#25263a] py-24 text-white md:py-28">
        <div className="mx-auto max-w-[900px] px-5 text-center sm:px-7">

          <p className="text-xs font-bold uppercase tracking-[.28em] text-[#a8a5ff]">
            Viso Mobile Autocare
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-[-.05em] md:text-6xl">
            When your car needs attention,
            <span className="text-[#a8a5ff]"> keep your day.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-[620px] text-base leading-7 text-white/50">
            Book mobile auto care around your schedule and let Viso bring the
            service to you.
          </p>

          <Link
            to="/book"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#3531a4] transition hover:bg-[#f1f1ff]"
          >
            Book a Service
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#171823] py-12 text-white">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-10">

          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">

            <div>
              <h2 className="text-xl font-semibold">
                Viso Mobile Autocare
              </h2>

              <p className="mt-3 max-w-[390px] text-sm leading-6 text-white/45">
                Professional mobile auto care designed around your vehicle,
                your location and your schedule.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">
                Explore
              </p>

              <div className="mt-4 space-y-3 text-sm text-white/60">
                <a href="#services" className="block hover:text-white">
                  Services
                </a>
                <a href="#how-it-works" className="block hover:text-white">
                  How It Works
                </a>
                <Link to="/about" className="block hover:text-white">
                  About
                </Link>
                <a href="#faq" className="block hover:text-white">
                  FAQ
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">
                Get started
              </p>

              <div className="mt-4 space-y-3 text-sm text-white/60">
                <Link to="/book" className="block hover:text-white">
                  Book a Service
                </Link>
                <span className="block">
                  Become a Technician
                </span>
              </div>
            </div>

          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} Viso Mobile Autocare. All rights reserved.
            </span>

            <span>
              Developed by GoddyWhyte Technologies
            </span>
          </div>

        </div>
      </footer>

    </main>
  )
}