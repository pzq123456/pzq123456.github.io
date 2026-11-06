import { AppProvider } from "./context/AppContext";
import Navbar from "./components/sections/Navbar";
import Hero from "./components/sections/Hero";
import Skills from "./components/sections/Skills";
import Experience from "./components/sections/Experience";
import Gallery from "./components/sections/Gallery";
import CvWorkspace from "./components/sections/CvWorkspace";
import AcademicRecord from "./components/sections/AcademicRecord";
import Footer from "./components/sections/Footer";
import QuantLab from "./components/sections/QuantLab";

export default function AcademicPortfolio() {
  return (
    <AppProvider>
      <div className="relative min-h-screen w-full text-ink-base overflow-x-clip">
        <Navbar />
        <main className="max-w-6xl mx-auto relative z-10">
          <Hero />
          <Skills />
          <Experience />
          <Gallery />
          <QuantLab />
          <AcademicRecord />
          <CvWorkspace />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}
