import Link from "next/link";
import { Photo, Sun, Tree, SectionHeading } from "@/components/Visuals";
import { Board } from "@/components/Notes";
import { WallComposition } from "@/components/Wall";
import { HomeScene } from "@/components/HomeScene";
import "./home-scenes.css";
export default function Home() {
  return (
    <div className="home-scroll">
      <HomeScene scene="hero" label="Introduction">
        <div className="hero page-width">
          <div className="hero-copy">
            <span className="eyebrow">
              PLACES, PICTURES & SMALL OBSERVATIONS
            </span>
            <h1>
              A place to
              <br />
              wander<span className="serif italic"> a little.</span>
            </h1>
            <p>
              I design places, take photographs, and collect small observations
              along the way.
            </p>
            <a className="scroll-cue" href="#recent">
              <svg viewBox="0 0 60 90" aria-hidden="true">
                <path
                  d="M8 2c58 0 3 58 33 77m-8-4 8 5 3-9"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
              <span>TAKE YOUR TIME</span>
            </a>
          </div>
          <div className="hero-image">
            <Photo
              name="sample2_1280"
              alt="Warm late afternoon sunlight along a coastal path, overlooking a lighthouse and the sea"
              priority
            />
            <span className="hand-caption">somewhere between here & there</span>
            <span className="image-index">01 — A LITTLE FURTHER</span>
          </div>
          <Sun className="hero-sun" />
          <span className="hero-side">
            A PERSONAL COLLECTION / ALWAYS IN PROGRESS
          </span>
        </div>
      </HomeScene>
      <HomeScene scene="recent" id="recent" label="Recently">
        <div className="section page-width">
          <div className="section-top">
            <SectionHeading
              number="01"
              title="RECENTLY"
              subtitle="A few things worth keeping."
            />
            <Link className="text-link" href="/field-notes">
              Browse all field notes ↗
            </Link>
          </div>
          <Board preview />
        </div>
      </HomeScene>
      <HomeScene scene="camera" label="From the Camera">
        <div className="section camera page-width">
          <div className="section-top">
            <SectionHeading
              number="02"
              title="FROM THE CAMERA"
              subtitle="Looking, a little closer."
            />
            <Link className="text-link" href="/images">
              View photo story ↗
            </Link>
          </div>
          <div className="camera-grid">
            <Photo
              name="mountains"
              alt="Mountain peaks in blue evening light"
            />
            <div className="camera-aside">
              <Photo
                name="sample1_1280"
                alt="Rain drops collected on a petal"
              />
              <Photo name="dome" alt="Geometric shadows beneath a glass roof" />
            </div>
          </div>
          <div className="photo-caption">
            <span>THE QUIET IN BETWEEN</span>
            <span>A selection of light, texture, and place · 2026</span>
            <span>01 — 03</span>
          </div>
        </div>
      </HomeScene>
      <HomeScene scene="practice" id="practice" label="Things I Notice">
        <div className="section practice page-width">
          <SectionHeading
            number="03"
            title="THINGS I NOTICE"
            subtitle="The small things make a place."
          />
          <div className="practice-grid">
            <Photo
              name="dome"
              alt="A glass roof that creates a changing pattern of light"
            />
            <div>
              <span className="eyebrow">LIGHT / SHADE / THE SPACE BETWEEN</span>
              <h3>
                A ceiling can be
                <br />a landscape, too.
              </h3>
              <p>
                Light moves across the floor. A pattern appears, then
                disappears. The structure stays the same; the place is always
                changing.
              </p>
              <span className="annotation">↖ look up, every now and then</span>
              <Tree />
            </div>
          </div>
        </div>
      </HomeScene>
      <HomeScene scene="wall" label="The Wall preview">
        <div className="wall-band">
          <div className="page-width">
            <div className="section-top">
              <SectionHeading
                number="04"
                title="THE WALL"
                subtitle="A little room for little things."
              />
              <Link className="text-link" href="/wall">
                Leave something behind ↗
              </Link>
            </div>
            <WallComposition preview />
          </div>
        </div>
      </HomeScene>
      <HomeScene scene="ending" label="About Shanni">
        <div className="home-about page-width">
          <Sun />
          <div>
            <span className="eyebrow">HELLO, I’M SHANNI</span>
            <p>
              A landscape designer, photographer, and observer of everyday
              places. This is a space for things I notice, make, and want to
              remember.
            </p>
            <Link className="text-link" href="/about">
              A little more about me ↗
            </Link>
          </div>
          <span className="small-caption">Glad you found your way here.</span>
        </div>
      </HomeScene>
    </div>
  );
}
