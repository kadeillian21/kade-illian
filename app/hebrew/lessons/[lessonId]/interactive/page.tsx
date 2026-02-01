'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * This page now acts as a redirect to the step-based route structure.
 * All lesson rendering happens at /hebrew/lessons/[lessonId]/interactive/step/[stepNumber]
 */
export default function InteractiveLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  useEffect(() => {
    // Redirect to step 1
    router.replace(`/hebrew/lessons/${lessonId}/interactive/step/1`);
  }, [lessonId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-white flex items-center justify-center">
      <div className="text-2xl text-gray-600">Redirecting to lesson...</div>
    </div>
  );
}
