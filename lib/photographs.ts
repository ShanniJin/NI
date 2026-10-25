export type Photograph = {
  id: string;
  src: string;
  width: number;
  height: number;
  title: string;
  alt: string;
  date?: string;
  location?: string;
  description?: string;
  relatedFieldNote?: { href: string; title: string };
};

// Placeholder photographs, not personal photo provenance. Replace or extend
// this collection with owner-approved photos; rendering needs no changes.
export const photographs: readonly Photograph[] = [
  {
    id: "distance",
    src: "/photos/mountains.jpg",
    width: 2800,
    height: 1900,
    title: "Distance",
    alt: "A mountain range in soft blue light",
    date: "2026",
    description: "Light, texture, and the feeling of being somewhere.",
  },
  {
    id: "the-long-way",
    src: "/photos/sample2_1280.jpg",
    width: 1280,
    height: 852,
    title: "The long way",
    alt: "Sunlit coastal cliffs leading toward a lighthouse",
    date: "2026",
    relatedFieldNote: {
      href: "/field-notes/the-long-way-to-the-water",
      title: "The long way to the water",
    },
  },
  {
    id: "up-close",
    src: "/photos/sample1_1280.jpg",
    width: 1280,
    height: 852,
    title: "Up close",
    alt: "Tiny water droplets resting on an orange petal",
    date: "2026",
  },
  {
    id: "looking-up",
    src: "/photos/dome.jpg",
    width: 1296,
    height: 968,
    title: "Looking up",
    alt: "Light and geometry in a glass and steel roof",
    date: "2026",
    relatedFieldNote: {
      href: "/field-notes/the-long-way-to-the-water#looking-up",
      title: "On looking, and looking again",
    },
  },
];
