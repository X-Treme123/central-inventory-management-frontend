import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login'); // Mengarahkan secara otomatis ke /login
  return null; 
}