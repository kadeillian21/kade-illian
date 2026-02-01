import { redirect } from 'next/navigation';

export default function HebrewPage() {
  // Redirect to lessons as the primary learning structure
  redirect('/hebrew/lessons');
}
