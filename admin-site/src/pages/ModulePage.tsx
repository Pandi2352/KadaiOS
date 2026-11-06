import { Link } from 'react-router-dom';
import { buttonClass } from '@/components/ui/buttonStyles';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { BUSINESS_TYPES } from '@/config/businessTypes';
import { MODULES } from '@/config/modules';
import { useWorkspace } from '@/context/WorkspaceContext';
import { isModuleAvailable } from '@/lib/navigation';
import type { ModuleDefinition } from '@/types/navigation';

/** Shared screen for every module until its real page is built. */
export function ModulePage({ module }: { module: ModuleDefinition }) {
  const { businessType } = useWorkspace();
  const business = BUSINESS_TYPES[businessType];

  const audience = module.businessTypes?.map((type) => BUSINESS_TYPES[type].plural).join(' and ');

  if (!isModuleAvailable(module, businessType)) {
    return (
      <div className="space-y-4">
        <PageHeader title={module.label} description={module.description} />
        <Notice
          title={`Not part of a ${business.label.toLowerCase()}`}
          action={
            <Link to={MODULES.dashboard.path} className={buttonClass('outline')}>
              Go to Dashboard
            </Link>
          }
        >
          This module is only for {audience}.
        </Notice>
      </div>
    );
  }

  const businessNote = module.byBusiness?.[businessType];
  const scopeNote = audience
    ? `This module is only for ${audience}.`
    : 'This module works the same way for every business type.';

  return (
    <div className="space-y-4">
      <PageHeader title={module.label} description={module.description} />
      <Notice title={`Not built yet: planned for ${module.planned}`}>
        {businessNote ? `For a ${business.label.toLowerCase()}: ${businessNote}` : scopeNote}
      </Notice>
    </div>
  );
}
