import { useEffect, useRef } from "react";
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
import Blog from "./blog/Blog";
import { getPost } from "./blog/posts";
import { useHashRoute } from "./blog/useHashRoute";

export default function AcademicPortfolio() {
  const route = useHashRoute();
  const isBlog = route.name !== "home";
  const blogSlug = route.name === "post" ? route.slug : null;
  const wasBlog = useRef(isBlog);

  useEffect(() => {
    if (isBlog) {
      window.scrollTo({ top: 0 });
      wasBlog.current = true;
      return;
    }

    const id = decodeURIComponent(window.location.hash.slice(1));

    if (id && !id.startsWith("/")) {
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });

      wasBlog.current = false;
      return () => cancelAnimationFrame(frame);
    }

    if (wasBlog.current) {
      window.scrollTo({ top: 0 });
    }

    wasBlog.current = false;
  }, [isBlog, blogSlug]);

  useEffect(() => {
    if (!isBlog) {
      document.title = "pzq123456.github.io";
      return;
    }

    const post = blogSlug ? getPost(blogSlug) : undefined;
    document.title = post
      ? `${post.title} · Blogs`
      : "Blogs · pzq123456.github.io";
  }, [isBlog, blogSlug]);

  return (
    <AppProvider>
      <div className="relative min-h-screen w-full text-ink-base overflow-x-clip">
        <Navbar />
        {isBlog ? (
          <Blog slug={blogSlug} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </AppProvider>
  );
}
