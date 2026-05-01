import Image from 'next/image';
import Link from 'next/link';
import { Bus, Dumbbell, FlaskConical, Hospital, Library, ShieldCheck } from 'lucide-react';

const notices = [
  'Admissions Open for Session 2026-27 for Nursery to Class IX.',
  'PTM for Classes VI-XII on Saturday, May 16, 2026.',
  'CBSE Mandatory Disclosure updated on April 25, 2026.',
];

const gallery = [
  { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop', tag: 'Campus' },
  { src: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop', tag: 'Academics' },
  { src: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop', tag: 'Sports' },
  { src: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop', tag: 'Events' },
];

const dashboards = [
  {
    role: 'Student / Parent Login',
    features: ['Attendance', 'Results', 'Homework', 'Fee Status', 'Notices', 'Leave Forms'],
  },
  {
    role: 'Teacher Login',
    features: ['Mark Attendance', 'Upload Assignments', 'Post Marks', 'Class Notices'],
  },
  {
    role: 'Admin Login',
    features: ['Manage Students & Staff', 'Gallery', 'Fees', 'Notices', 'Admissions'],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#041f4a] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-orange-300">CBSE Affiliation No. 2133587</p>
            <h1 className="text-lg font-bold md:text-2xl">Manvasa Vidya Public School (MVPS)</h1>
          </div>
          <Link href="/login" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold hover:bg-orange-400">Login</Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-[#041f4a] to-[#0b3d91] px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">Premium CBSE School in Bhadohi, UP</p>
          <h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">Shaping confident learners with values, discipline, and academic excellence.</h2>
          <div className="overflow-hidden rounded-lg border border-white/20 bg-black/20">
            <div className="notice-ticker whitespace-nowrap px-4 py-2 text-sm">
              {notices.map((n, i) => (
                <span key={n} className="mr-10">📌 {n}{i < notices.length - 1 ? ' • ' : ''}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Students', value: '1800+' },
          { label: 'Faculty', value: '95+' },
          { label: 'Years of Excellence', value: '22' },
          { label: 'CBSE Affiliated', value: 'Yes' },
        ].map((s) => (
          <article key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-[#041f4a]">{s.value}</p>
            <p className="text-sm text-slate-600">{s.label}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl space-y-12 px-4 pb-14">
        <ContentCard id="about" title="About MVPS" subtitle="Principal's Message & School History">
          <p className="text-sm text-slate-700">At MVPS, we believe each child carries unique potential. Our mission is to nurture strong character, modern skills, and an Indian value system rooted in respect and responsibility.</p>
          <p className="text-sm text-slate-700">Established to serve Bhadohi and neighboring communities, the school has grown into a trusted institution delivering quality CBSE education with focus on academics, sports, and holistic growth.</p>
        </ContentCard>

        <ContentCard id="academics" title="Academics" subtitle="Curriculum • Faculty • Timetable • Calendar">
          <ul className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <li>• CBSE curriculum from foundational to senior classes.</li><li>• Experienced faculty cards by department.</li><li>• Weekly timetable view by class & section.</li><li>• Academic calendar with exams, activities, and holidays.</li>
          </ul>
        </ContentCard>

        <ContentCard id="admissions" title="Admissions" subtitle="Simple Process & Transparent Fees">
          <ol className="list-decimal space-y-1 pl-6 text-sm text-slate-700">
            <li>Online/Offline Inquiry</li><li>Campus Visit & Counselling</li><li>Document Submission</li><li>Entrance/Interaction (if applicable)</li><li>Fee Payment & Confirmation</li>
          </ol>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100"><tr><th className="p-2">Class Group</th><th className="p-2">Admission Fee</th><th className="p-2">Quarterly Fee</th></tr></thead>
              <tbody>
                <tr><td className="p-2">Nursery - II</td><td className="p-2">₹8,000</td><td className="p-2">₹6,500</td></tr>
                <tr className="bg-slate-50"><td className="p-2">III - VIII</td><td className="p-2">₹10,000</td><td className="p-2">₹7,800</td></tr>
                <tr><td className="p-2">IX - XII</td><td className="p-2">₹12,000</td><td className="p-2">₹9,200</td></tr>
              </tbody>
            </table>
          </div>
        </ContentCard>

        <ContentCard id="student-life" title="Student Life" subtitle="Sports • Events • Student Council">
          <p className="text-sm text-slate-700">A vibrant campus culture with house activities, annual events, leadership programs, and structured sports training that builds teamwork and confidence.</p>
        </ContentCard>

        <ContentCard id="facilities" title="Facilities" subtitle="Complete Campus Support">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Library, 'Library'], [FlaskConical, 'Science & Computer Labs'], [Dumbbell, 'Sports Infrastructure'], [Bus, 'Safe Transport'], [Hospital, 'Medical Room'], [ShieldCheck, 'Campus Safety'],
            ].map(([Icon, label]) => <div key={label} className="flex items-center gap-2 rounded-md border bg-white p-3"><Icon className="h-4 w-4 text-orange-500" />{label}</div>)}
          </div>
        </ContentCard>

        <ContentCard id="gallery" title="Gallery" subtitle="Filterable Photo Grid Teaser">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((img) => (
              <div key={img.src} className="group relative overflow-hidden rounded-lg">
                <Image src={img.src} alt={img.tag} width={600} height={400} loading="lazy" className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">{img.tag}</span>
              </div>
            ))}
          </div>
        </ContentCard>

        <ContentCard id="mandatory-disclosure" title="Mandatory Disclosure" subtitle="CBSE Compliance Tables & Downloadable Documents">
          <p className="text-sm text-slate-700">Publish trust details like recognition certificate, NOC, building safety, fire safety, water/health certificates, SMC committee details, and annual academic results in downloadable PDF format.</p>
        </ContentCard>

        <ContentCard id="login" title="Role-Based Dashboards" subtitle="Unified portal for all stakeholders">
          <div className="grid gap-3 md:grid-cols-3">
            {dashboards.map((d) => (
              <article key={d.role} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-[#041f4a]">{d.role}</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{d.features.map((f) => <li key={f}>{f}</li>)}</ul>
              </article>
            ))}
          </div>
        </ContentCard>
      </section>

      <footer className="bg-[#041f4a] px-4 py-8 text-sm text-white">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          <div><h4 className="font-semibold">Contact</h4><p className="mt-2">+91 9935228262</p><p>info@mvps.in</p><p>Mangapatti, Sudhawari, Bhadohi – 221308</p></div>
          <div><h4 className="font-semibold">Quick Links</h4><p className="mt-2">About • Academics • Admissions • Gallery</p></div>
          <div><h4 className="font-semibold">School Hours</h4><p className="mt-2">Mon-Sat: 8:00 AM - 2:30 PM</p></div>
          <div><h4 className="font-semibold">Follow Us</h4><p className="mt-2">Facebook • Instagram • YouTube</p></div>
        </div>
      </footer>
    </main>
  );
}

function ContentCard({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#041f4a]">{title}</h2>
      <p className="mb-4 text-sm text-orange-600">{subtitle}</p>
      {children}
    </section>
  );
}
