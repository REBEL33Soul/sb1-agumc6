import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { LegalDocumentEditor } from '@/components/admin/legal-document-editor';

export default async function AdminLegalPage() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Legal Documents</h2>
        <p className="text-gray-400 mt-2">
          Manage terms of service, privacy notice, and other legal documents
        </p>
      </div>

      <LegalDocumentEditor />
    </div>
  );
}