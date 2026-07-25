import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/paths';

export default function CompanyEditRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(withBasePath(`/dashboard/company?companyId=${params.id}`));
}
