import { NotesExplorer } from "@/components/NotesExplorer";
export const metadata={title:"Field Notes"};
export default function FieldNotes(){return <div className="page-width inner-page"><div className="page-intro"><span className="eyebrow">A COLLECTION, NOT A CHRONOLOGY</span><h1>Field Notes<span className="small-star">✳︎</span></h1><p>Places I’ve been. Things I’ve noticed.<br/>A few thoughts along the way.</p></div><NotesExplorer/></div>}
