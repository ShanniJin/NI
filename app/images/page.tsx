import { PhotoGallery } from "@/components/images/PhotoGallery";
import { photographs } from "@/lib/photographs";
import "./gallery.css";

export const metadata = { title: "Images" };
export default function Images() {
  return <PhotoGallery photos={photographs} />;
}
